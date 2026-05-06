import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import UploadBuktiModal from "./UploadBuktiModal";
import ValidasiPembayaranButton from "./ValidasiPembayaranButton";
import BeriUlasanModal from "./BeriUlasanModal";
import DownloadPDFButton from "./DownloadPDFButton";
import DownloadFakturPajakButton from "./DownloadFakturPajakButton";
import MidtransPayButton from "./MidtransPayButton";
import Link from "next/link";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

const getStatusBadge = (status: number) => {
  switch (status) {
    case 0: return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Pembayaran Tidak Valid</span>;
    case 1: return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Menunggu Upload</span>;
    case 2: return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Menunggu Validasi</span>;
    case 3: return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Siap Kirim</span>;
    case 4: return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Proses Pengiriman</span>;
    case 5: return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Telah Diterima</span>;
    case 6: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">Selesai</span>;
    case 7: return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Menunggu Pembayaran</span>;
    case 8: return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Menunggu Deteksi Uang</span>;
    default: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">Unknown</span>;
  }
};

const getMetodeLabel = (metode: number) => {
  switch (metode) {
    case 1: return "Transfer Manual";
    case 2: return "Bayar di Tempat";
    case 3: return "Midtrans";
    default: return "Unknown";
  }
};

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = session.user.role; // 1 = Supplier, 2 = Agen

  // Get transactions based on role
  let transactions = [];
  
  if (role === 1) {
    // Supplier: Fetch orders for their products
    transactions = await prisma.transactions.findMany({
      where: { products: { user_id: BigInt(session.user.id) } },
      include: { products: { include: { users: true } }, users: true, ratings: true }, // users here is the agen
      orderBy: { tanggalTransaksi: 'desc' }
    });
  } else {
    // Agen: Fetch their orders
    transactions = await prisma.transactions.findMany({
      where: { agen_id: BigInt(session.user.id) },
      include: { products: { include: { users: true } }, users: true, ratings: true },
      orderBy: { tanggalTransaksi: 'desc' }
    });
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return "Pembayaran Tidak Valid";
      case 1: return "Menunggu Upload";
      case 2: return "Menunggu Validasi";
      case 3: return "Siap Kirim";
      case 4: return "Proses Pengiriman";
      case 5: return "Telah Diterima";
      case 6: return "Selesai";
      case 7: return "Menunggu Pembayaran";
      case 8: return "Menunggu Deteksi Uang";
      default: return "Unknown";
    }
  };

  const pajakRate = 11;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Transaksi</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau status pesanan dan pembayaran</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Produk</th>
                <th className="p-4 font-semibold">{role === 1 ? "Agen Pemesan" : "Supplier"}</th>
                <th className="p-4 font-semibold">Total Pembayaran</th>
                <th className="p-4 font-semibold">Metode</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Belum ada transaksi</td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isTransfer = t.metodePembayaran === 1;
                  const isCash = t.metodePembayaran === 2;
                  const isMidtrans = t.metodePembayaran === 3;
                  const subtotal = t.subtotalPembayaran ?? t.totalPembayaran;
                  const pajak = t.pajakPembayaran ?? Math.round((subtotal * pajakRate) / 100);
                  const totalValue = t.subtotalPembayaran ? t.totalPembayaran : subtotal + pajak;

                  return (
                    <tr key={t.id.toString()} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-700">#{t.id.toString()}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{t.products?.namaProduk}</div>
                      <div className="text-xs text-slate-500">{new Date(t.tanggalTransaksi).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {role === 1 ? t.users?.fullname : t.products?.users?.fullname}
                    </td>
                    <td className="p-4 font-bold text-teal-600">
                      {formatRupiah(totalValue)}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {getMetodeLabel(t.metodePembayaran)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(t.statusPemesanan)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {/* PDF DOWNLOAD (Available if status >= 3) */}
                        {t.statusPemesanan >= 3 && (
                          <DownloadPDFButton data={{
                            id: t.id.toString(),
                            tanggal: new Date(t.tanggalTransaksi).toLocaleDateString('id-ID'),
                            produk: t.products?.namaProduk || "",
                            supplier: (role === 1 ? session.user.name : t.products?.users?.fullname) || "",
                            agen: (role === 1 ? t.users?.fullname : session.user.name) || "",
                            subtotal,
                            pajak,
                            total: totalValue,
                            status: getStatusText(t.statusPemesanan)
                          }} />
                        )}

                        {t.statusPemesanan >= 3 && (
                          <DownloadFakturPajakButton data={{
                            id: t.id.toString(),
                            tanggal: new Date(t.tanggalTransaksi).toLocaleDateString('id-ID'),
                            supplier: (role === 1 ? session.user.name : t.products?.users?.fullname) || "",
                            agen: (role === 1 ? t.users?.fullname : session.user.name) || "",
                            subtotal,
                            pajak,
                            total: totalValue,
                            status: getStatusText(t.statusPemesanan)
                          }} />
                        )}

                        {/* AGEN ACTIONS */}
                        {role === 2 && isTransfer && (t.statusPemesanan === 1 || t.statusPemesanan === 0) && (
                          <UploadBuktiModal transactionId={t.id.toString()} isReupload={t.statusPemesanan === 0} />
                        )}

                        {role === 2 && isMidtrans && (t.statusPemesanan === 7 || t.statusPemesanan === 0) && (
                          <MidtransPayButton transactionId={t.id.toString()} />
                        )}

                        {/* RATING ACTION (Agen only, status >= 5, no rating yet) */}
                        {role === 2 && t.statusPemesanan >= 5 && t.ratings.length === 0 && (
                          <BeriUlasanModal transactionId={t.id.toString()} />
                        )}
                        
                        {/* SUPPLIER ACTIONS */}
                        {role === 1 && isTransfer && t.statusPemesanan === 2 && (
                          <ValidasiPembayaranButton 
                            transactionId={t.id.toString()} 
                            buktiUrl={`/bukti_pembayaran/${t.buktiPembayaran}`} 
                          />
                        )}

                        {role === 1 && isCash && t.statusPemesanan === 8 && (
                          <Link
                            href={`/dashboard/deteksi-uang-palsu?transactionId=${t.id.toString()}`}
                            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                          >
                            Deteksi Uang
                          </Link>
                        )}
                        
                        {/* VIEW RATING IF EXISTS */}
                        {t.ratings.length > 0 && (
                          <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <span className="text-xs font-bold">{t.ratings[0].rating}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
