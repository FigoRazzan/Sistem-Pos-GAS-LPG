import { Suspense } from "react";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import ProductFilter from "./ProductFilter";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

const getJenisLabel = (jenis: number) => {
  switch (jenis) {
    case 1: return { label: "Gas Elpiji 3 Kg", img: "/asset-img/gas3kg.jpg", color: "text-green-600 bg-green-100 border-green-200" };
    case 2: return { label: "Gas Elpiji 12 Kg", img: "/asset-img/gas12kg-circle.png", color: "text-blue-600 bg-blue-100 border-blue-200" };
    case 3: return { label: "Bright Gas 5 Kg", img: "/asset-img/br5kg-circle.png", color: "text-pink-600 bg-pink-100 border-pink-200" };
    case 4: return { label: "Bright Gas 12 Kg", img: "/asset-img/br12kg-circle.png", color: "text-pink-600 bg-pink-100 border-pink-200" };
    default: return { label: "Lainnya", img: "/asset-img/null-produk.png", color: "text-slate-600 bg-slate-100 border-slate-200" };
  }
};

export default async function PublicProductsPage({
  searchParams
}: {
  searchParams: Promise<{ jenis?: string }>
}) {
  const resolvedSp = await searchParams;
  const jenisFilter = resolvedSp.jenis ? parseInt(resolvedSp.jenis) : undefined;
  
  const products = await prisma.products.findMany({
    where: jenisFilter ? { jenisProduk: jenisFilter } : {},
    include: { users: true },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Simple */}
      <nav className="w-full z-50 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-teal-500 bg-white">
              <Image src="/asset-img/logo.png" alt="Logo" width={40} height={40} className="object-cover w-full h-full" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">WEB-GAS</span>
          </Link>
          <Link href="/dashboard" className="text-teal-400 font-semibold hover:text-teal-300">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Katalog Produk Gas</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Pilih dan pesan gas dari supplier terpercaya kami. Harga bersaing dan terjamin keasliannya.</p>
        </div>

        <Suspense fallback={<div className="h-10"></div>}>
          <ProductFilter />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500">
              Tidak ada produk yang ditemukan untuk kategori ini.
            </div>
          ) : products.map((product) => {
            const jenis = getJenisLabel(product.jenisProduk);
            return (
              <div key={product.id.toString()} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col">
                <div className="h-64 relative bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-8">
                  <Image 
                    src={jenis.img} 
                    alt={product.namaProduk} 
                    width={180} 
                    height={180} 
                    className="object-contain group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 drop-shadow-xl"
                  />
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border ${jenis.color}`}>
                    {jenis.label}
                  </span>
                  {product.stokProduk < 25 && (
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                      Stok Habis
                    </span>
                  )}
                </div>
                
                <div className="p-6 border-t border-slate-100 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl text-slate-800 mb-2">{product.namaProduk}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Supplier: <span className="font-semibold text-slate-700">{product.users?.fullname}</span>
                  </p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Harga / item</p>
                        <p className="font-bold text-teal-600 text-2xl">{formatRupiah(product.hargaProduk)}</p>
                        <p className="text-xs text-amber-600 mt-0.5">Min. order 25 item</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Stok Tersedia</p>
                        <p className="font-semibold text-slate-700">{product.stokProduk} Unit</p>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/products/${product.id.toString()}`}
                      className={`block w-full py-3 text-center rounded-xl font-bold transition-colors ${
                        product.stokProduk >= 25 
                          ? "bg-slate-900 text-white hover:bg-teal-500 shadow-md hover:shadow-teal-500/30" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {product.stokProduk >= 25 ? "PESAN SEKARANG" : "STOK TIDAK CUKUP"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
