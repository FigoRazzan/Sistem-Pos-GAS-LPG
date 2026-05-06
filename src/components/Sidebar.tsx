"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ userRole }: { userRole: number }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Transaksi", href: "/dashboard/transactions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  ];

  // Supplier only
  if (userRole === 1) {
    navItems.splice(1, 0, { name: "Produk Gas", href: "/dashboard/products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" });
    navItems.push({ name: "Laporan Pajak", href: "/dashboard/laporan-pajak", icon: "M9 12h6m-6 4h6m-5 4h4m2 2H8a2 2 0 01-2-2V6a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2z" });
    navItems.push({ name: "Deteksi Uang Palsu", href: "/dashboard/deteksi-uang-palsu", icon: "M12 8c-1.657 0-3 1.343-3 3v6a3 3 0 006 0v-6c0-1.657-1.343-3-3-3zm-7 3a7 7 0 0114 0v6a7 7 0 01-14 0v-6z" });
  } else if (userRole === 2) {
    navItems.push({ name: "Katalog Gas (Beli)", href: "/products", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" });
  }

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white shadow-xl z-20 hidden md:block">
      <div className="flex items-center justify-center h-20 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
          WEB-GAS
        </h1>
      </div>

      <div className="flex flex-col p-4 mt-4 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
          Menu Utama
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
