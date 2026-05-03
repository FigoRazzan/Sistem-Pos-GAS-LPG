import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  const roleName = session.user.role === 1 ? "Supplier" : "Agen Gas";

  // Simple stats
  const totalProducts = await prisma.products.count();
  const totalTransactions = await prisma.transactions.count({
    where: session.user.role === 2 ? { agen_id: BigInt(session.user.id) } : {}
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang, {session.user.name}!</h1>
          <p className="text-teal-50 text-lg">Kamu masuk sebagai <span className="font-semibold bg-white/20 px-2 py-1 rounded-md">{roleName}</span>.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-500">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Produk Gas</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalProducts}</h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Transaksi</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalTransactions}</h3>
          </div>
        </div>

      </div>

      {/* Main content placeholder */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[300px]">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Aktivitas Terkini</h2>
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p>Belum ada aktivitas baru</p>
        </div>
      </div>
    </div>
  );
}
