"use client";

import { useState } from "react";
import { createProduct } from "@/app/actions/product";

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createProduct(formData);
    
    if (result.success) {
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
        className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Tambah Produk
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Tambah Produk Gas</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
                <input type="text" name="namaProduk" required className="w-full border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" placeholder="Contoh: Gas Elpiji 3 Kg" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga (25 Unit)</label>
                  <input type="number" name="hargaProduk" required className="w-full border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stok (Unit)</label>
                  <input type="number" name="stokProduk" required className="w-full border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Gas (Untuk Foto)</label>
                <select name="jenisProduk" required className="w-full border border-slate-300 text-slate-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                  <option value="">-- Pilih Jenis --</option>
                  <option value="1">Gas Elpiji 3 Kg (Hijau)</option>
                  <option value="2">Gas Elpiji 12 Kg (Biru)</option>
                  <option value="3">Bright Gas 5 Kg (Pink)</option>
                  <option value="4">Bright Gas 12 Kg (Pink)</option>
                </select>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
