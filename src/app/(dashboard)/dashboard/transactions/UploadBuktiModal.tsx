"use client";

import { useState } from "react";
import { uploadBuktiPembayaran } from "@/app/actions/transaction";
import { useToast } from "@/components/ToastProvider";

export default function UploadBuktiModal({ transactionId, isReupload = false }: { transactionId: string, isReupload?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await uploadBuktiPembayaran(transactionId, formData);
    
    if (result.success) {
      toast.success(result.message || "Bukti berhasil diunggah!");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Gagal mengunggah bukti");
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`px-3 py-2 ${isReupload ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"} text-white text-xs font-bold rounded-lg shadow-sm transition-colors`}
      >
        {isReupload ? "Upload Ulang Bukti" : "Upload Bukti"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Upload Bukti Pembayaran</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                <input 
                  type="file" 
                  name="img" 
                  accept="image/png, image/jpeg, image/jpg" 
                  required 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {preview ? (
                  <div className="space-y-4">
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-sm" />
                    <p className="text-sm font-medium text-teal-600">Klik untuk mengganti foto</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Pilih foto bukti transfer</p>
                    <p className="text-xs text-slate-500">Maks. 5MB (JPG, PNG)</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50">
                  {loading ? "Mengunggah..." : "Upload Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
