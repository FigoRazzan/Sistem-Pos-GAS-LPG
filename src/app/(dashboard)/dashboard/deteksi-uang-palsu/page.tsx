import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DeteksiUangForm from "./DeteksiUangForm";

const getMetodeLabel = (metode: number) => {
  switch (metode) {
    case 1:
      return "Kamera";
    case 2:
      return "Upload Foto";
    default:
      return "Unknown";
  }
};

const getStatusBadge = (status: number) => {
  switch (status) {
    case 0:
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">⏳ Menunggu</span>;
    case 1:
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✅ Asli</span>;
    case 2:
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">🚨 Palsu</span>;
    default:
      return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">Unknown</span>;
  }
};

const getConfidenceBadge = (status: number, skor: number | null, catatan: string | null) => {
  if (!skor && skor !== 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const pct = skor;
  const label = catatan || "";

  // Color based on status
  const barColor =
    status === 2 ? "bg-red-500"
    : status === 1 ? "bg-emerald-500"
    : "bg-amber-400";

  const textColor =
    status === 2 ? "text-red-600"
    : status === 1 ? "text-emerald-600"
    : "text-amber-600";

  return (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold ${textColor}`}>{pct}%</span>
        {label && (
          <span className="text-[10px] text-slate-400 ml-1 truncate max-w-[70px]" title={label}>{label}</span>
        )}
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className={`${barColor} h-1.5 rounded-full transition-all`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default async function DeteksiUangPalsuPage({
  searchParams,
}: {
  searchParams: Promise<{ transactionId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || Number(session.user.role) !== 1) {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const transactionId = resolvedParams?.transactionId;

  const detections = await prisma.cash_detections.findMany({
    where: { user_id: BigInt(session.user.id) },
    include: { transactions: { include: { users: true, products: true } } },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Deteksi Uang Palsu</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload foto uang — AI akan otomatis menganalisis dan menampilkan tingkat keyakinan (confidence) apakah uang tersebut asli atau palsu.
        </p>
      </div>

      <DeteksiUangForm transactionId={transactionId} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Transaksi</th>
                <th className="p-4 font-semibold">Metode</th>
                <th className="p-4 font-semibold">Status AI</th>
                <th className="p-4 font-semibold">Confidence AI</th>
                <th className="p-4 font-semibold">Foto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Belum ada data deteksi</td>
                </tr>
              ) : (
                detections.map((d) => (
                  <tr key={d.id.toString()} className="hover:bg-slate-50">
                    <td className="p-4 text-sm font-medium text-slate-700">#{d.id.toString()}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {d.transactions ? (
                        <div>
                          <div className="font-semibold text-slate-800">#{d.transactions.id.toString()}</div>
                          <div className="text-xs text-slate-500">{d.transactions.products?.namaProduk}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Manual</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600">{getMetodeLabel(d.metodeDeteksi)}</td>
                    <td className="p-4">{getStatusBadge(d.statusDeteksi)}</td>
                    <td className="p-4">{getConfidenceBadge(d.statusDeteksi, d.skorDeteksi, d.catatan)}</td>
                    <td className="p-4">
                      <img
                        src={`/deteksi_uang_palsu/${d.gambarDeteksi}`}
                        alt="Deteksi"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
