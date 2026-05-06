"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";
import { createSnapTransaction, getMidtransConfig, getMidtransStatus } from "@/lib/midtrans";

const PAYMENT_METHOD = {
  TRANSFER: 1,
  CASH: 2,
  MIDTRANS: 3,
};

const STATUS = {
  PEMBAYARAN_TIDAK_VALID: 0,
  MENUNGGU_UPLOAD: 1,
  MENUNGGU_VALIDASI: 2,
  SIAP_KIRIM: 3,
  PROSES_PENGIRIMAN: 4,
  TELAH_DITERIMA: 5,
  SELESAI: 6,
  MENUNGGU_MIDTRANS: 7,
  MENUNGGU_DETEKSI_UANG: 8,
};

const TAX_RATE = 11;

const mapMidtransStatus = (transactionStatus?: string, fraudStatus?: string) => {
  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    return fraudStatus === "deny" ? STATUS.PEMBAYARAN_TIDAK_VALID : STATUS.SIAP_KIRIM;
  }
  if (transactionStatus === "pending") {
    return STATUS.MENUNGGU_MIDTRANS;
  }
  if (["deny", "cancel", "expire"].includes(transactionStatus || "")) {
    return STATUS.PEMBAYARAN_TIDAK_VALID;
  }
  return STATUS.MENUNGGU_MIDTRANS;
};

export async function createTransaction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || Number(session.user.role) !== 2) { // Only Agen (Role 2) can order
    return { error: "Hanya Agen yang dapat melakukan pemesanan" };
  }

  const productId = formData.get("product_id") as string;
  const metodePembayaran = parseInt(formData.get("metodePembayaran") as string);
  const deskripsi = (formData.get("deskripsi") as string) || "-";

  if (!productId || productId === "undefined" || !metodePembayaran || isNaN(metodePembayaran)) {
    return { error: "Terjadi kesalahan ID atau Metode pembayaran tidak valid" };
  }

  if (![PAYMENT_METHOD.TRANSFER, PAYMENT_METHOD.CASH, PAYMENT_METHOD.MIDTRANS].includes(metodePembayaran)) {
    return { error: "Metode pembayaran tidak didukung" };
  }

  try {
    const product = await prisma.products.findUnique({ where: { id: BigInt(productId) } });
    if (!product) return { error: "Produk tidak ditemukan" };
    if (product.stokProduk < 25) return { error: "Stok produk tidak mencukupi (minimal 25 unit)" };

    const user = await prisma.users.findUnique({ where: { id: BigInt(session.user.id) } });
    if (!user) return { error: "User tidak ditemukan" };

    // Transaction Data
    const subtotalPembayaran = product.hargaProduk * 25; // 25 is fixed unit count in Laravel logic
    const pajakPembayaran = Math.round((subtotalPembayaran * TAX_RATE) / 100);
    const totalPembayaran = subtotalPembayaran + pajakPembayaran;
    const isCash = metodePembayaran === PAYMENT_METHOD.CASH;
    const isMidtrans = metodePembayaran === PAYMENT_METHOD.MIDTRANS;
    const statusPemesanan = isMidtrans
      ? STATUS.MENUNGGU_MIDTRANS
      : isCash
        ? STATUS.MENUNGGU_DETEKSI_UANG
        : STATUS.MENUNGGU_UPLOAD;

    const createdTransaction = await prisma.transactions.create({
      data: {
        deskripsi,
        alamatTujuan: user.alamat,
        buktiPembayaran: "",
        tanggalTransaksi: new Date(),
        stokPemesanan: 25,
        statusPemesanan,
        metodePembayaran,
        totalPembayaran,
        subtotalPembayaran,
        pajakPembayaran,
        agen_id: BigInt(session.user.id),
        product_id: BigInt(productId),
      }
    });

    const transactionId = createdTransaction.id.toString();

    // Update Product Stock
    await prisma.products.update({
      where: { id: BigInt(productId) },
      data: {
        stokProduk: product.stokProduk - 25,
        produkTerjual: product.produkTerjual + 25,
      }
    });

    if (isMidtrans) {
      const orderId = `WEBGAS-${createdTransaction.id.toString()}-${Date.now()}`;
      try {
        const snap = await createSnapTransaction({
          orderId,
          grossAmount: totalPembayaran,
          itemName: product.namaProduk,
          customerName: user.fullname,
          customerEmail: user.email,
          customerPhone: user.nomorTelepon,
        });

        await prisma.transactions.update({
          where: { id: createdTransaction.id },
          data: {
            midtransOrderId: orderId,
            midtransToken: snap.token,
            midtransRedirectUrl: snap.redirect_url,
            midtransStatus: "pending",
          }
        });

        revalidatePath("/dashboard/transactions");
        return {
          success: true,
          message: "Pemesanan dibuat. Lanjutkan pembayaran via Midtrans.",
          transactionId,
          payment: {
            type: "midtrans",
            token: snap.token,
            redirectUrl: snap.redirect_url,
          }
        };
      } catch (error) {
        await prisma.transactions.update({
          where: { id: createdTransaction.id },
          data: {
            statusPemesanan: STATUS.PEMBAYARAN_TIDAK_VALID,
            midtransStatus: "error",
          }
        });

        if ((error as Error)?.message === "MIDTRANS_KEY_MISSING") {
          return { error: "Konfigurasi Midtrans belum lengkap" };
        }

        return { error: "Gagal membuat pembayaran Midtrans" };
      }
    }

    revalidatePath("/dashboard/transactions");
    return {
      success: true,
      message: isCash
        ? "Pemesanan berhasil dibuat! Menunggu deteksi uang oleh Supplier."
        : "Pemesanan berhasil dibuat! Silakan upload bukti pembayaran.",
      transactionId,
    };
  } catch (error) {
    console.error("Error create transaction:", error);
    return { error: "Terjadi kesalahan sistem" };
  }
}

export async function uploadBuktiPembayaran(transactionId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || Number(session.user.role) !== 2) return { error: "Akses ditolak" };

  const transaction = await prisma.transactions.findUnique({
    where: { id: BigInt(transactionId) }
  });

  if (!transaction) return { error: "Transaksi tidak ditemukan" };
  if (transaction.metodePembayaran !== PAYMENT_METHOD.TRANSFER) {
    return { error: "Metode pembayaran bukan transfer manual" };
  }

  const file = formData.get("img") as File;
  if (!file || file.size === 0) return { error: "Bukti pembayaran wajib diunggah" };
  
  if (file.size > 5 * 1024 * 1024) return { error: "Ukuran file maksimal 5MB" };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop();
    const fileName = `ID_PESANAN_${transactionId}_${Date.now()}.${ext}`;
    
    // Save to public/bukti_pembayaran
    const uploadDir = path.join(process.cwd(), "public/bukti_pembayaran");
    
    // Create dir if not exists (handled loosely here)
    await writeFile(path.join(uploadDir, fileName), buffer);

    await prisma.transactions.update({
      where: { id: BigInt(transactionId) },
      data: {
        buktiPembayaran: fileName,
        statusPemesanan: STATUS.MENUNGGU_VALIDASI,
      }
    });

    revalidatePath("/dashboard/transactions");
    return { success: true, message: "Bukti pembayaran berhasil diunggah" };
  } catch (error) {
    console.error("Error upload:", error);
    return { error: "Gagal mengunggah bukti pembayaran" };
  }
}

export async function requestMidtransPayment(transactionId: string) {
  const session = await getServerSession(authOptions);
  if (!session || Number(session.user.role) !== 2) return { error: "Akses ditolak" };

  const tx = await prisma.transactions.findUnique({
    where: { id: BigInt(transactionId) },
    include: { products: true, users: true },
  });

  if (!tx) return { error: "Transaksi tidak ditemukan" };
  if (tx.agen_id !== BigInt(session.user.id)) return { error: "Akses ditolak" };
  if (tx.metodePembayaran !== PAYMENT_METHOD.MIDTRANS) {
    return { error: "Metode pembayaran bukan Midtrans" };
  }

  const orderId = tx.midtransOrderId || `WEBGAS-${tx.id.toString()}-${Date.now()}`;

  try {
    const snap = await createSnapTransaction({
      orderId,
      grossAmount: tx.totalPembayaran,
      itemName: tx.products?.namaProduk || "Gas LPG",
      customerName: tx.users?.fullname || session.user.name || "Agen",
      customerEmail: tx.users?.email || session.user.email || "",
      customerPhone: tx.users?.nomorTelepon || "",
    });

    await prisma.transactions.update({
      where: { id: tx.id },
      data: {
        midtransOrderId: orderId,
        midtransToken: snap.token,
        midtransRedirectUrl: snap.redirect_url,
        midtransStatus: "pending",
        statusPemesanan: STATUS.MENUNGGU_MIDTRANS,
      }
    });

    revalidatePath("/dashboard/transactions");
    return {
      success: true,
      token: snap.token,
      redirectUrl: snap.redirect_url,
    };
  } catch (error) {
    const { serverKey, clientKey } = getMidtransConfig();
    if (!serverKey || !clientKey) {
      return { error: "Konfigurasi Midtrans belum lengkap" };
    }
    console.error("Error create midtrans payment:", error);
    return { error: "Gagal memproses pembayaran Midtrans" };
  }
}

export async function syncMidtransStatus(transactionId: string) {
  const session = await getServerSession(authOptions);
  if (!session || Number(session.user.role) !== 2) return { error: "Akses ditolak" };

  const tx = await prisma.transactions.findUnique({
    where: { id: BigInt(transactionId) },
  });

  if (!tx) return { error: "Transaksi tidak ditemukan" };
  if (tx.agen_id !== BigInt(session.user.id)) return { error: "Akses ditolak" };
  if (tx.metodePembayaran !== PAYMENT_METHOD.MIDTRANS) {
    return { error: "Metode pembayaran bukan Midtrans" };
  }

  const orderId = tx.midtransOrderId;
  if (!orderId) return { error: "Order Midtrans belum tersedia" };

  try {
    const statusResponse = await getMidtransStatus(orderId);
    const nextStatus = mapMidtransStatus(statusResponse?.transaction_status, statusResponse?.fraud_status);

    await prisma.transactions.update({
      where: { id: tx.id },
      data: {
        statusPemesanan: nextStatus,
        midtransStatus: statusResponse?.transaction_status,
        midtransPaymentType: statusResponse?.payment_type,
        midtransTransactionId: statusResponse?.transaction_id,
        midtransFraudStatus: statusResponse?.fraud_status,
      }
    });

    revalidatePath("/dashboard/transactions");
    return { success: true, status: statusResponse?.transaction_status };
  } catch (error) {
    const { serverKey, clientKey } = getMidtransConfig();
    if (!serverKey || !clientKey) {
      return { error: "Konfigurasi Midtrans belum lengkap" };
    }
    console.error("Error sync midtrans status:", error);
    return { error: "Gagal sinkronisasi status Midtrans" };
  }
}

export async function updateTransactionStatus(transactionId: string, status: number) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 1) return { error: "Hanya Supplier yang bisa update status" };

  try {
    await prisma.transactions.update({
      where: { id: BigInt(transactionId) },
      data: { statusPemesanan: status }
    });

    revalidatePath("/dashboard/transactions");
    return { success: true, message: "Status pesanan berhasil diperbarui" };
  } catch (error) {
    console.error("Error update status:", error);
    return { error: "Gagal memperbarui status" };
  }
}
