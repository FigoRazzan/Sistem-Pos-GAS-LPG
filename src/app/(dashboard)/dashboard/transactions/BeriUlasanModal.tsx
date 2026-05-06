"use client";

import { useState } from "react";
import { submitRating } from "@/app/actions/rating";
import { useToast } from "@/components/ToastProvider";

export default function BeriUlasanModal({ transactionId }: { transactionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("rating", rating.toString());
    
    const result = await submitRating(formData);
    
    if (result.success) {
      toast.success(result.message || "Ulasan berhasil dikirim!");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Gagal mengirim ulasan");
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
      >
        Beri Ulasan
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Penilaian Pesanan</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="hidden" name="transaction_id" value={transactionId} />
              
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500 mb-2">Berapa bintang untuk produk/pelayanan ini?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRating(star)}
                      className={`w-10 h-10 transition-transform ${star <= rating ? 'text-yellow-400 scale-110' : 'text-slate-200 hover:scale-110'}`}
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tuliskan ulasan Anda</label>
                <textarea 
                  name="ulasan" 
                  required 
                  rows={4} 
                  className="w-full border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all" 
                  placeholder="Gasnya awet, pengiriman cepat, mantap!" 
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
