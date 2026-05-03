"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

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

  try {
    const product = await prisma.products.findUnique({ where: { id: BigInt(productId) } });
    if (!product) return { error: "Produk tidak ditemukan" };
    if (product.stokProduk < 25) return { error: "Stok produk tidak mencukupi (minimal 25 unit)" };

    const user = await prisma.users.findUnique({ where: { id: BigInt(session.user.id) } });
    if (!user) return { error: "User tidak ditemukan" };

    // Transaction Data
    const totalPembayaran = product.hargaProduk * 25; // 25 is fixed unit count in Laravel logic

    await prisma.transactions.create({
      data: {
        deskripsi,
        alamatTujuan: user.alamat,
        buktiPembayaran: "",
        tanggalTransaksi: new Date(),
        stokPemesanan: 25,
        statusPemesanan: 1, // 1 = Menunggu Upload Pembayaran
        metodePembayaran,
        totalPembayaran,
        agen_id: BigInt(session.user.id),
        product_id: BigInt(productId),
      }
    });

    // Update Product Stock
    await prisma.products.update({
      where: { id: BigInt(productId) },
      data: {
        stokProduk: product.stokProduk - 25,
        produkTerjual: product.produkTerjual + 25,
      }
    });

    revalidatePath("/dashboard/transactions");
    return { success: true, message: "Pemesanan berhasil dibuat! Silakan upload bukti pembayaran." };
  } catch (error) {
    console.error("Error create transaction:", error);
    return { error: "Terjadi kesalahan sistem" };
  }
}

export async function uploadBuktiPembayaran(transactionId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 2) return { error: "Akses ditolak" };

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
        statusPemesanan: 2, // 2 = Menunggu validasi
      }
    });

    revalidatePath("/dashboard/transactions");
    return { success: true, message: "Bukti pembayaran berhasil diunggah" };
  } catch (error) {
    console.error("Error upload:", error);
    return { error: "Gagal mengunggah bukti pembayaran" };
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
