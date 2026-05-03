"use client";

import { useState } from "react";
import { updateTransactionStatus } from "@/app/actions/transaction";

export default function ValidasiPembayaranButton({ transactionId, buktiUrl }: { transactionId: string, buktiUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleValidasi = async (status: number) => {
    const isConfirm = confirm(status === 3 ? "Tandai pembayaran valid?" : "Tolak pembayaran ini?");
    if (!isConfirm) return;

    setLoading(true);
    const result = await updateTransactionStatus(transactionId, status);
    if (result.success) {
      alert(result.message);
      setIsOpen(false);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
      >
        Validasi Bukti
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Validasi Pembayaran</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-3 text-center">Foto Bukti Transfer dari Agen</p>
              
              <div className="bg-slate-100 rounded-xl p-2 flex justify-center mb-6">
                <img src={buktiUrl} alt="Bukti Pembayaran" className="max-h-96 rounded-lg shadow-sm object-contain" />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleValidasi(0)} 
                  disabled={loading}
                  className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  TIDAK VALID
                </button>
                <button 
                  onClick={() => handleValidasi(3)} 
                  disabled={loading}
                  className="flex-1 py-3 bg-teal-500 text-white font-bold rounded-xl shadow-md hover:bg-teal-600 hover:shadow-teal-500/30 transition-all disabled:opacity-50"
                >
                  VALID & TERIMA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
