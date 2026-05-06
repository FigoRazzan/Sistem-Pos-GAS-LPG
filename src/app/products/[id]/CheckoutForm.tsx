"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createTransaction, syncMidtransStatus } from "@/app/actions/transaction";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";

const PAYMENT_METHOD = {
  TRANSFER: 1,
  CASH: 2,
  MIDTRANS: 3,
};

export default function CheckoutForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [metode, setMetode] = useState(1);
  const toast = useToast();
  const confirm = useConfirm();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // capture before await — React nullifies currentTarget after async
    const ok = await confirm({
      title: "Konfirmasi Pesanan",
      message: "Apakah Anda yakin ingin memesan gas ini?",
      confirmLabel: "Ya, Pesan Sekarang",
    });
    if (!ok) return;
    
    setLoading(true);
    const formData = new FormData(form);
    formData.append("product_id", productId);
    
    const result = await createTransaction(formData);
    
    if (result.success) {
      if (result.payment?.type === "midtrans" && result.payment.token && result.transactionId) {
        if (typeof window !== "undefined" && (window as any).snap) {
          (window as any).snap.pay(result.payment.token, {
            onSuccess: async () => {
              await syncMidtransStatus(result.transactionId);
              toast.success("Pembayaran berhasil! Pesanan akan segera diproses.");
              router.push("/dashboard/transactions");
            },
            onPending: async () => {
              await syncMidtransStatus(result.transactionId);
              toast.info("Pembayaran pending. Silakan selesaikan pembayaran.");
              router.push("/dashboard/transactions");
            },
            onError: () => {
              toast.error("Pembayaran gagal. Silakan coba lagi.");
              router.push("/dashboard/transactions");
            },
            onClose: () => {
              toast.warning("Pembayaran belum selesai. Kamu bisa lanjutkan dari menu transaksi.");
              router.push("/dashboard/transactions");
            },
          });
        } else {
          toast.error("Snap Midtrans belum siap. Coba refresh halaman.");
        }
      } else {
        toast.success(result.message || "Pesanan berhasil dibuat!");
        router.push("/dashboard/transactions");
      }
    } else {
      toast.error(result.error || "Gagal membuat pesanan");
    }
    setLoading(false);
  };


  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const snapSrc = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Script
        src={snapSrc}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Metode Pembayaran</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${metode === PAYMENT_METHOD.TRANSFER ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200' : 'border-slate-200 hover:border-teal-300'}`}>
            <input type="radio" name="metodePembayaran" value={PAYMENT_METHOD.TRANSFER} checked={metode === PAYMENT_METHOD.TRANSFER} onChange={() => setMetode(PAYMENT_METHOD.TRANSFER)} className="hidden" />
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${metode === PAYMENT_METHOD.TRANSFER ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
              {metode === PAYMENT_METHOD.TRANSFER && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <span className="font-semibold text-slate-800">Transfer Manual</span>
          </label>
          <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${metode === PAYMENT_METHOD.MIDTRANS ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200' : 'border-slate-200 hover:border-teal-300'}`}>
            <input type="radio" name="metodePembayaran" value={PAYMENT_METHOD.MIDTRANS} checked={metode === PAYMENT_METHOD.MIDTRANS} onChange={() => setMetode(PAYMENT_METHOD.MIDTRANS)} className="hidden" />
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${metode === PAYMENT_METHOD.MIDTRANS ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
              {metode === PAYMENT_METHOD.MIDTRANS && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <span className="font-semibold text-slate-800">Midtrans</span>
          </label>
          <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${metode === PAYMENT_METHOD.CASH ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200' : 'border-slate-200 hover:border-teal-300'}`}>
            <input type="radio" name="metodePembayaran" value={PAYMENT_METHOD.CASH} checked={metode === PAYMENT_METHOD.CASH} onChange={() => setMetode(PAYMENT_METHOD.CASH)} className="hidden" />
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${metode === PAYMENT_METHOD.CASH ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
              {metode === PAYMENT_METHOD.CASH && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <span className="font-semibold text-slate-800">Bayar di Tempat</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
        <textarea name="deskripsi" rows={3} className="w-full border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" placeholder="Misal: Tolong dikirim pagi hari..." />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl text-lg hover:bg-teal-600 shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Memproses...
          </>
        ) : (
          "BUAT PESANAN"
        )}
      </button>
    </form>
  );
}
