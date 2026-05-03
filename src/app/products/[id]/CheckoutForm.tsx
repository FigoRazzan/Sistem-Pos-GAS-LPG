"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/app/actions/transaction";

export default function CheckoutForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [metode, setMetode] = useState(1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm("Apakah Anda yakin ingin memesan gas ini?")) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("product_id", productId);
    
    const result = await createTransaction(formData);
    
    if (result.success) {
      alert(result.message);
      router.push("/dashboard/transactions");
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Metode Pembayaran</label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${metode === 1 ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200' : 'border-slate-200 hover:border-teal-300'}`}>
            <input type="radio" name="metodePembayaran" value="1" checked={metode === 1} onChange={() => setMetode(1)} className="hidden" />
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${metode === 1 ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
              {metode === 1 && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <span className="font-semibold text-slate-800">Transfer Bank</span>
          </label>
          <label className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${metode === 2 ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200' : 'border-slate-200 hover:border-teal-300'}`}>
            <input type="radio" name="metodePembayaran" value="2" checked={metode === 2} onChange={() => setMetode(2)} className="hidden" />
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${metode === 2 ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
              {metode === 2 && <div className="w-2 h-2 bg-white rounded-full"></div>}
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
