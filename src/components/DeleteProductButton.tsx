"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions/product";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Hapus Produk",
      message: "Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.",
      confirmLabel: "Ya, Hapus",
      variant: "danger",
    });
    if (!ok) return;
    
    setLoading(true);
    const result = await deleteProduct(productId);
    if (result.success) {
      toast.success(result.message || "Produk berhasil dihapus!");
    } else {
      toast.error(result.error || "Gagal menghapus produk");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="flex-1 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100 disabled:opacity-50"
    >
      {loading ? "Menghapus..." : "Hapus Produk"}
    </button>
  );
}
