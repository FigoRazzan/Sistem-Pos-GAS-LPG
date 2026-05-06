import crypto from "crypto";
import prisma from "@/lib/prisma";

const STATUS = {
  PEMBAYARAN_TIDAK_VALID: 0,
  MENUNGGU_MIDTRANS: 7,
  SIAP_KIRIM: 3,
};

export async function POST(request: Request) {
  const payload = await request.json();

  const orderId = payload?.order_id as string | undefined;
  const statusCode = payload?.status_code as string | undefined;
  const grossAmount = payload?.gross_amount as string | undefined;
  const signatureKey = payload?.signature_key as string | undefined;

  if (!orderId || !statusCode || !grossAmount || !signatureKey) {
    return Response.json({ error: "Payload tidak lengkap" }, { status: 400 });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  if (!serverKey) {
    return Response.json({ error: "Konfigurasi Midtrans belum lengkap" }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");

  if (expectedSignature !== signatureKey) {
    return Response.json({ error: "Signature tidak valid" }, { status: 401 });
  }

  const transactionStatus = payload?.transaction_status as string | undefined;
  const paymentType = payload?.payment_type as string | undefined;
  const transactionId = payload?.transaction_id as string | undefined;
  const fraudStatus = payload?.fraud_status as string | undefined;

  let statusPemesanan: number | undefined;

  if (transactionStatus === "capture" || transactionStatus === "settlement") {
    statusPemesanan = fraudStatus === "deny" ? STATUS.PEMBAYARAN_TIDAK_VALID : STATUS.SIAP_KIRIM;
  } else if (transactionStatus === "pending") {
    statusPemesanan = STATUS.MENUNGGU_MIDTRANS;
  } else if (["deny", "cancel", "expire"].includes(transactionStatus || "")) {
    statusPemesanan = STATUS.PEMBAYARAN_TIDAK_VALID;
  }

  const transaction = await prisma.transactions.findFirst({
    where: { midtransOrderId: orderId }
  });

  if (!transaction) {
    return Response.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  await prisma.transactions.update({
    where: { id: transaction.id },
    data: {
      statusPemesanan: statusPemesanan ?? transaction.statusPemesanan,
      midtransStatus: transactionStatus,
      midtransPaymentType: paymentType,
      midtransTransactionId: transactionId,
      midtransFraudStatus: fraudStatus,
    }
  });

  return Response.json({ success: true });
}
