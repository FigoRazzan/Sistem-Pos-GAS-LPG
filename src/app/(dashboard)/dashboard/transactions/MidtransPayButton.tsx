"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { requestMidtransPayment, syncMidtransStatus } from "@/app/actions/transaction";
import { useToast } from "@/components/ToastProvider";

export default function MidtransPayButton({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const snapSrc = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  const handlePay = async () => {
    setLoading(true);
    const result = await requestMidtransPayment(transactionId);

    if (result.success && result.token) {
      if (typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(result.token, {
          onSuccess: async () => {
            await syncMidtransStatus(transactionId);
            toast.success("Pembayaran berhasil! Pesanan akan segera diproses.");
            router.refresh();
          },
          onPending: async () => {
            await syncMidtransStatus(transactionId);
            toast.info("Pembayaran pending. Silakan selesaikan pembayaran.");
            router.refresh();
          },
          onError: () => {
            toast.error("Pembayaran gagal. Silakan coba lagi.");
            router.refresh();
          },
          onClose: () => {
            toast.warning("Pembayaran belum selesai. Klik tombol bayar lagi jika ingin melanjutkan.");
          },
        });
      } else {
        toast.error("Snap Midtrans belum siap. Coba refresh halaman.");
      }
    } else {
      toast.error(result.error || "Gagal memulai pembayaran");
    }

    setLoading(false);
  };

  return (
    <>
      <Script
        src={snapSrc}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      <button
        onClick={handlePay}
        disabled={loading}
        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Bayar Midtrans"}
      </button>
    </>
  );
}
