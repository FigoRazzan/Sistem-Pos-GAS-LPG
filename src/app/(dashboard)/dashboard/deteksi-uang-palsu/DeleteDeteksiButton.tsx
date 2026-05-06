"use client";

import { useState } from "react";
import { deleteCashDetection } from "@/app/actions/cashDetection";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";

export default function DeleteDeteksiButton({ detectionId }: { detectionId: string }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Hapus Data Deteksi",
      message: "Data deteksi dan foto akan dihapus permanen. Lanjutkan?",
      confirmLabel: "Ya, Hapus",
    });
    if (!ok) return;

    setLoading(true);
    const result = await deleteCashDetection(detectionId);
    if (result.success) {
      toast.success("Data deteksi berhasil dihapus.");
    } else {
      toast.error(result.error || "Gagal menghapus data.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Hapus"
      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  );
}
