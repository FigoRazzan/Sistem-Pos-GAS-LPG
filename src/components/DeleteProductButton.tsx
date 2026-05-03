"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions/product";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    
    setLoading(true);
    const result = await deleteProduct(productId);
    if (!result.success) {
      alert(result.error);
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
