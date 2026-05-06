import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

const getJenisImg = (jenis: number) => {
  switch (jenis) {
    case 1: return "/asset-img/gas3kg.jpg";
    case 2: return "/asset-img/gas12kg-circle.png";
    case 3: return "/asset-img/br5kg-circle.png";
    case 4: return "/asset-img/br12kg-circle.png";
    default: return "/asset-img/null-produk.png";
  }
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || Number(session.user.role) !== 2) {
    redirect("/login");
  }

  const product = await prisma.products.findUnique({
    where: { id: BigInt(resolvedParams.id) },
    include: { 
      users: true,
      ratings: {
        include: { users: true },
        orderBy: { tanggal: 'desc' }
      }
    }
  });

  if (!product) notFound();

  const user = await prisma.users.findUnique({
    where: { id: BigInt(session.user.id) }
  });

  const subtotalPembayaran = product.hargaProduk * 25;
  const pajakPembayaran = Math.round((subtotalPembayaran * 11) / 100);
  const totalPembayaran = subtotalPembayaran + pajakPembayaran;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-8 font-medium transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali ke Katalog
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="w-full md:w-2/5 bg-slate-50 p-12 flex items-center justify-center border-r border-slate-100">
            <Image 
              src={getJenisImg(product.jenisProduk)} 
              alt={product.namaProduk} 
              width={300} 
              height={300} 
              priority
              loading="eager"
              className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Details Section */}
          <div className="w-full md:w-3/5 p-8 md:p-12">
            <div className="mb-8">
              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                Tersedia {product.stokProduk} Unit
              </span>
              <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{product.namaProduk}</h1>
              <p className="text-slate-500 flex items-center gap-2">
                Supplier: <span className="font-semibold text-slate-700">{product.users?.fullname}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
              <p className="text-sm font-semibold text-slate-600 mb-4">Rincian Pembayaran</p>

              {/* Per-item breakdown */}
              <div className="space-y-2 text-sm text-slate-600 pb-4 border-b border-slate-200 mb-4">
                <div className="flex justify-between">
                  <span>Harga / item</span>
                  <span className="font-semibold text-slate-700">{formatRupiah(product.hargaProduk)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jumlah (min. order)</span>
                  <span className="font-semibold text-slate-700">25 item</span>
                </div>
                <div className="flex justify-between text-slate-800 font-semibold pt-1">
                  <span>Subtotal (DPP)</span>
                  <span>{formatRupiah(subtotalPembayaran)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN 11%</span>
                  <span className="font-semibold text-slate-700">{formatRupiah(pajakPembayaran)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">Total Pembayaran</p>
                <p className="text-3xl font-black text-teal-600">{formatRupiah(totalPembayaran)}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Detail Pengiriman</h3>
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
                <p className="font-semibold text-slate-700">{user?.fullname}</p>
                <p className="text-slate-500 text-sm mt-1">{user?.alamat}</p>
                <p className="text-slate-500 text-sm">{user?.nomorTelepon}</p>
              </div>

              {/* Checkout Form Component */}
              <CheckoutForm productId={resolvedParams.id} />
            </div>
          </div>
        </div>

        {/* Ulasan Produk Section */}
        <div className="mt-12 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
            Ulasan Produk
            <span className="text-sm px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
              {product.ratings.length} Ulasan
            </span>
          </h2>

          <div className="space-y-6">
            {product.ratings.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Belum ada ulasan untuk produk ini.</p>
            ) : (
              product.ratings.map((rating) => (
                <div key={rating.id.toString()} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">
                        {rating.users?.fullname.charAt(0).toUpperCase()}
                      </div>
                      {rating.users?.fullname}
                    </div>
                    <div className="text-sm text-slate-400">
                      {new Date(rating.tanggal).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 mb-3 ml-10">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < rating.rating ? "fill-current" : "text-slate-200"}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-600 ml-10 leading-relaxed bg-slate-50 p-4 rounded-xl rounded-tl-none border border-slate-100">
                    "{rating.ulasan}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
