"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Header({ user }: { user: { name?: string | null, email?: string | null, role?: number } }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10 sticky top-0">
      
      {/* Mobile Menu Button & Title */}
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-500 hover:text-slate-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800 hidden md:block">
          {user.role === 1 ? "Dashboard Supplier" : "Dashboard Agen"}
        </h2>
      </div>

      {/* User Profile Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors border border-transparent hover:border-slate-200"
        >
          <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-inner">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden md:block">
            <span className="block text-sm font-bold text-slate-700">{user.name}</span>
            <span className="block text-xs text-slate-500">{user.role === 1 ? "Supplier" : "Agen Gas"}</span>
          </div>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
            <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-teal-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Profil Saya
            </Link>
            <div className="h-px bg-slate-100 my-2"></div>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
