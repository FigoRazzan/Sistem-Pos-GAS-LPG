"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitRating(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 2) return { error: "Hanya Agen yang bisa memberi ulasan" };

  const transactionId = formData.get("transaction_id") as string;
  const ratingValue = parseInt(formData.get("rating") as string);
  const ulasan = formData.get("ulasan") as string;

  if (!transactionId || !ratingValue || !ulasan) {
    return { error: "Semua kolom ulasan wajib diisi" };
  }

  try {
    // Pastikan transaksi ini milik Agen yang sedang login dan statusnya sudah Selesai (e.g. 5 atau 6)
    const transaction = await prisma.transactions.findUnique({
      where: { id: BigInt(transactionId) }
    });

    if (!transaction || transaction.agen_id !== BigInt(session.user.id)) {
      return { error: "Transaksi tidak ditemukan atau bukan milik Anda" };
    }

    if (transaction.statusPemesanan < 5) {
      return { error: "Hanya pesanan selesai yang dapat diberi ulasan" };
    }

    // Cek apakah sudah pernah beri rating
    const existing = await prisma.ratings.findFirst({
      where: { transaction_id: BigInt(transactionId) }
    });

    if (existing) {
      return { error: "Anda sudah memberikan ulasan untuk pesanan ini" };
    }

    await prisma.ratings.create({
      data: {
        rating: ratingValue,
        ulasan,
        transaction_id: BigInt(transactionId),
        agen_id: transaction.agen_id,
        product_id: transaction.product_id,
        tanggal: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    // Opsional: ubah status transaksi menjadi 6 (Selesai Sepenuhnya)
    if (transaction.statusPemesanan === 5) {
      await prisma.transactions.update({
        where: { id: BigInt(transactionId) },
        data: { statusPemesanan: 6 }
      });
    }

    revalidatePath("/dashboard/transactions");
    return { success: true, message: "Ulasan berhasil dikirim. Terima kasih!" };
  } catch (error) {
    console.error("Error rating:", error);
    return { error: "Gagal mengirim ulasan" };
  }
}
