import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DownloadSlipPajakRekapButton from "./DownloadSlipPajakRekapButton";

const TAX_RATE = 11;

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default async function LaporanPajakPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || Number(session.user.role) !== 1) {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const now = new Date();
  const month = resolvedParams?.month ? parseInt(resolvedParams.month) : now.getMonth() + 1;
  const year = resolvedParams?.year ? parseInt(resolvedParams.year) : now.getFullYear();

  const safeMonth = Number.isNaN(month) || month < 1 || month > 12 ? now.getMonth() + 1 : month;
  const safeYear = Number.isNaN(year) ? now.getFullYear() : year;

  const startDate = new Date(safeYear, safeMonth - 1, 1);
  const endDate = new Date(safeYear, safeMonth, 1);

  const transactions = await prisma.transactions.findMany({
    where: {
      products: { user_id: BigInt(session.user.id) },
      tanggalTransaksi: { gte: startDate, lt: endDate },
      statusPemesanan: { gte: 3 },
    },
    include: { products: true, users: true },
    orderBy: { tanggalTransaksi: "desc" },
  });

  const totalDpp = transactions.reduce((sum, t) => {
    const subtotal = t.subtotalPembayaran ?? t.totalPembayaran;
    return sum + subtotal;
  }, 0);

  const totalPpn = transactions.reduce((sum, t) => {
    const subtotal = t.subtotalPembayaran ?? t.totalPembayaran;
    const pajak = t.pajakPembayaran ?? Math.round((subtotal * TAX_RATE) / 100);
    return sum + pajak;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Pajak</h1>
          <p className="text-slate-500 text-sm mt-1">
            Rekap PPN transaksi bulan {monthNames[safeMonth - 1]} {safeYear}.
          </p>
        </div>
        <DownloadSlipPajakRekapButton
          data={{
            supplier: session.user.name || "Supplier",
            bulan: monthNames[safeMonth - 1],
            tahun: safeYear,
            totalTransaksi: transactions.length,
            totalDpp,
            totalPpn,
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total DPP</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{formatRupiah(totalDpp)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total PPN</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{formatRupiah(totalPpn)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Jumlah Transaksi</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{transactions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Agen</th>
                <th className="p-4 font-semibold">Produk</th>
                <th className="p-4 font-semibold">DPP</th>
                <th className="p-4 font-semibold">PPN</th>
                <th className="p-4 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Belum ada transaksi bulan ini</td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const subtotal = t.subtotalPembayaran ?? t.totalPembayaran;
                  const pajak = t.pajakPembayaran ?? Math.round((subtotal * TAX_RATE) / 100);
                  const total = t.subtotalPembayaran ? t.totalPembayaran : subtotal + pajak;

                  return (
                    <tr key={t.id.toString()} className="hover:bg-slate-50">
                      <td className="p-4 text-sm font-medium text-slate-700">#{t.id.toString()}</td>
                      <td className="p-4 text-sm text-slate-600">{new Date(t.tanggalTransaksi).toLocaleDateString("id-ID")}</td>
                      <td className="p-4 text-sm text-slate-600">{t.users?.fullname}</td>
                      <td className="p-4 text-sm text-slate-600">{t.products?.namaProduk}</td>
                      <td className="p-4 text-sm text-slate-600">{formatRupiah(subtotal)}</td>
                      <td className="p-4 text-sm text-slate-600">{formatRupiah(pajak)}</td>
                      <td className="p-4 text-sm font-semibold text-teal-600">{formatRupiah(total)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-400">
        Gunakan query parameter <strong>?month=5&amp;year=2026</strong> untuk melihat periode lain.
      </div>
    </div>
  );
}
