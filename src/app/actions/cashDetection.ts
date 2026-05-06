"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import axios from "axios";

const DETEKSI_STATUS = {
  MENUNGGU: 0,
  ASLI: 1,
  PALSU: 2,
};

const TRANSAKSI_STATUS = {
  PEMBAYARAN_TIDAK_VALID: 0,
  SIAP_KIRIM: 3,
  MENUNGGU_DETEKSI_UANG: 8,
};

export async function createCashDetection(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || Number(session.user.role) !== 1) {
    return { error: "Hanya Supplier yang bisa melakukan deteksi" };
  }

  const file = formData.get("img") as File;
  const metodeDeteksi = parseInt(formData.get("metodeDeteksi") as string);
  const transactionId = (formData.get("transactionId") as string) || "";

  if (!file || file.size === 0) return { error: "Foto uang wajib diunggah" };
  if (!metodeDeteksi || isNaN(metodeDeteksi)) return { error: "Metode deteksi tidak valid" };
  if (![1, 2].includes(metodeDeteksi)) return { error: "Metode deteksi tidak didukung" };
  if (file.size > 5 * 1024 * 1024) return { error: "Ukuran file maksimal 5MB" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `DETEKSI_${Date.now()}_${Math.floor(Math.random() * 9999)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public/deteksi_uang_palsu");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  let transaksiIdValue: bigint | undefined;
  if (transactionId && transactionId !== "undefined") {
    transaksiIdValue = BigInt(transactionId);
  }

  if (transaksiIdValue) {
    const tx = await prisma.transactions.findUnique({
      where: { id: transaksiIdValue }
    });
    if (!tx) return { error: "Transaksi tidak ditemukan" };
    if (tx.metodePembayaran !== 2) {
      return { error: "Transaksi ini bukan pembayaran cash" };
    }

    await prisma.transactions.update({
      where: { id: transaksiIdValue },
      data: { statusPemesanan: TRANSAKSI_STATUS.MENUNGGU_DETEKSI_UANG }
    });
  }

  const detection = await prisma.cash_detections.create({
    data: {
      transaction_id: transaksiIdValue,
      user_id: BigInt(session.user.id),
      metodeDeteksi,
      statusDeteksi: DETEKSI_STATUS.MENUNGGU,
      gambarDeteksi: fileName,
    }
  });

  // === Roboflow AI Detection ===
  let aiStatus: "asli" | "palsu" | "menunggu" = "menunggu";
  let aiMessage = "Data deteksi tersimpan. Menunggu verifikasi manual.";
  let finalStatus = DETEKSI_STATUS.MENUNGGU;
  let aiConfidence = 0;     // 0–100 percentage
  let aiLabel = "Tidak diketahui"; // class name from model

  try {
    const apiKey = process.env.ROBOFLOW_API_KEY;
    const modelUrl = process.env.ROBOFLOW_MODEL_URL || "https://serverless.roboflow.com/rupiah-bl9md/1";

    if (apiKey) {
      const imagePath = path.join(uploadDir, fileName);
      const imageBuffer = await readFile(imagePath);
      const imageBase64 = imageBuffer.toString("base64");

      const roboflowResponse = await axios({
        method: "POST",
        url: modelUrl,
        params: { api_key: apiKey },
        data: imageBase64,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      });

      const predictions = roboflowResponse.data?.predictions ?? [];

      if (predictions.length > 0) {
        // Sort by confidence, highest first
        const sorted = [...predictions].sort(
          (a: any, b: any) => (b.confidence ?? 0) - (a.confidence ?? 0)
        );
        const topPrediction = sorted[0];
        const confidencePct = Math.round((topPrediction.confidence ?? 0) * 100);

        aiConfidence = confidencePct;
        aiLabel = topPrediction.class ?? "Tidak diketahui";

        // Threshold: confidence ≥60% → ASLI, <60% → PALSU
        if (confidencePct >= 60) {
          finalStatus = DETEKSI_STATUS.ASLI;
          aiStatus = "asli";
          aiMessage = `AI mendeteksi uang ASLI dengan keyakinan ${confidencePct}%. Transaksi dapat dilanjutkan.`;
        } else {
          finalStatus = DETEKSI_STATUS.PALSU;
          aiStatus = "palsu";
          aiMessage = `AI mencurigai uang PALSU (keyakinan hanya ${confidencePct}%, di bawah 50%). Mohon verifikasi ulang.`;
        }
      } else {
        // No predictions
        aiLabel = "Tidak terdeteksi";
        aiConfidence = 0;
        aiStatus = "menunggu";
        aiMessage = "AI tidak dapat mendeteksi pola uang dalam foto. Mohon verifikasi manual.";
      }
    }
  } catch (aiError) {
    console.error("Roboflow AI detection failed:", aiError);
    aiLabel = "Error AI";
    aiStatus = "menunggu";
    aiMessage = "Data tersimpan. AI tidak tersedia saat ini, mohon verifikasi manual.";
  }

  // Always update detection record with AI result (skor + catatan + status)
  await prisma.cash_detections.update({
    where: { id: detection.id },
    data: {
      statusDeteksi: finalStatus,
      skorDeteksi: aiConfidence,
      catatan: aiLabel,
    },
  });

  // Auto-update transaction status based on AI result
  if (transaksiIdValue) {
    if (finalStatus === DETEKSI_STATUS.ASLI) {
      // AI says ASLI → transaction is valid, ready to ship
      await prisma.transactions.update({
        where: { id: transaksiIdValue },
        data: { statusPemesanan: TRANSAKSI_STATUS.SIAP_KIRIM },
      });
    } else if (finalStatus === DETEKSI_STATUS.PALSU) {
      // AI says PALSU → mark payment as invalid
      await prisma.transactions.update({
        where: { id: transaksiIdValue },
        data: { statusPemesanan: TRANSAKSI_STATUS.PEMBAYARAN_TIDAK_VALID },
      });
    }
    // If MENUNGGU → keep MENUNGGU_DETEKSI_UANG, no update needed
  }
  // === End Roboflow ===

  revalidatePath("/dashboard/deteksi-uang-palsu");
  revalidatePath("/dashboard/transactions");
  return { success: true, message: aiMessage, aiStatus };
}

export async function updateCashDetectionStatus(detectionId: string, statusDeteksi: number, catatan?: string) {
  const session = await getServerSession(authOptions);
  if (!session || Number(session.user.role) !== 1) {
    return { error: "Hanya Supplier yang bisa memvalidasi deteksi" };
  }

  const detection = await prisma.cash_detections.findUnique({
    where: { id: BigInt(detectionId) },
  });

  if (!detection) return { error: "Data deteksi tidak ditemukan" };

  await prisma.cash_detections.update({
    where: { id: BigInt(detectionId) },
    data: { statusDeteksi, catatan: catatan || null }
  });

  if (detection.transaction_id) {
    await prisma.transactions.update({
      where: { id: detection.transaction_id },
      data: {
        statusPemesanan: statusDeteksi === DETEKSI_STATUS.ASLI
          ? TRANSAKSI_STATUS.SIAP_KIRIM
          : TRANSAKSI_STATUS.PEMBAYARAN_TIDAK_VALID,
      }
    });
  }

  revalidatePath("/dashboard/deteksi-uang-palsu");
  revalidatePath("/dashboard/transactions");
  return { success: true, message: "Status deteksi diperbarui" };
}

export async function deleteCashDetection(detectionId: string) {
  const session = await getServerSession(authOptions);
  if (!session || Number(session.user.role) !== 1) {
    return { error: "Akses ditolak" };
  }

  const detection = await prisma.cash_detections.findUnique({
    where: { id: BigInt(detectionId) },
  });

  if (!detection) return { error: "Data tidak ditemukan" };
  if (detection.user_id.toString() !== session.user.id) {
    return { error: "Bukan data milik Anda" };
  }

  // Hapus file foto dari disk
  try {
    const filePath = path.join(process.cwd(), "public/deteksi_uang_palsu", detection.gambarDeteksi);
    const { unlink } = await import("fs/promises");
    await unlink(filePath);
  } catch {
    // File mungkin sudah tidak ada, lanjut saja
  }

  await prisma.cash_detections.delete({ where: { id: BigInt(detectionId) } });

  revalidatePath("/dashboard/deteksi-uang-palsu");
  return { success: true };
}
