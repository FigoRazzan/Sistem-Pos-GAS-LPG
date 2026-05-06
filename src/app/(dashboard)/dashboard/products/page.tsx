import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Image from "next/image";
import AddProductModal from "@/components/AddProductModal";
import DeleteProductButton from "@/components/DeleteProductButton";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

const getJenisLabel = (jenis: number) => {
  switch (jenis) {
    case 1: return { label: "Gas 3 Kg", img: "/asset-img/gas3kg.jpg", color: "text-green-600 bg-green-100 border-green-200" };
    case 2: return { label: "Gas 12 Kg", img: "/asset-img/gas12kg-circle.png", color: "text-blue-600 bg-blue-100 border-blue-200" };
    case 3: return { label: "Bright 5 Kg", img: "/asset-img/br5kg-circle.png", color: "text-pink-600 bg-pink-100 border-pink-200" };
    case 4: return { label: "Bright 12 Kg", img: "/asset-img/br12kg-circle.png", color: "text-pink-600 bg-pink-100 border-pink-200" };
    default: return { label: "Unknown", img: "/asset-img/null-produk.png", color: "text-slate-600 bg-slate-100 border-slate-200" };
  }
};

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 1) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">Akses Ditolak</div>
    );
  }

  const products = await prisma.products.findMany({
    where: { user_id: BigInt(session.user.id) },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Produk</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola daftar produk gas yang Anda jual</p>
        </div>
        <AddProductModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500">Belum ada produk. Silakan tambahkan produk baru.</p>
          </div>
        ) : (
          products.map((product) => {
            const jenis = getJenisLabel(product.jenisProduk);
            return (
              <div key={product.id.toString()} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-shadow group">
                <div className="h-48 relative bg-slate-50 flex items-center justify-center p-4">
                  <Image 
                    src={jenis.img} 
                    alt={product.namaProduk} 
                    width={120} 
                    height={120} 
                    className="object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border ${jenis.color}`}>
                    {jenis.label}
                  </span>
                </div>
                <div className="p-6 border-t border-slate-50 relative">
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{product.namaProduk}</h3>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Harga / item</p>
                      <p className="font-bold text-teal-600 text-xl">{formatRupiah(product.hargaProduk)}</p>
                      <p className="text-xs text-amber-600 mt-0.5">Min. order 25 item</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Stok Tersedia</p>
                      <p className="font-semibold text-slate-700">{product.stokProduk} Unit</p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    {/* Add Edit later */}
                    <DeleteProductButton productId={product.id.toString()} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
