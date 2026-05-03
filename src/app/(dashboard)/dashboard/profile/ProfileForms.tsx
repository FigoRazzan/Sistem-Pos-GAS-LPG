"use client";

import { useState } from "react";
import { updateProfile, changePassword } from "@/app/actions/profile";

export default function ProfileForms({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");
  const [msg, setMsg] = useState("");

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await updateProfile(fd);
    setMsg(res.error || res.message || "");
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await changePassword(fd);
    setMsg(res.error || res.message || "");
    if (res.success) {
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        <button 
          onClick={() => setActiveTab("info")} 
          className={`pb-2 font-bold ${activeTab === "info" ? "border-b-2 border-teal-500 text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          Informasi Pribadi
        </button>
        <button 
          onClick={() => setActiveTab("password")} 
          className={`pb-2 font-bold ${activeTab === "password" ? "border-b-2 border-teal-500 text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          Ganti Password
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm font-semibold ${msg.includes("berhasil") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {msg}
        </div>
      )}

      {activeTab === "info" ? (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Nama Lengkap</label>
              <input name="fullname" defaultValue={user.fullname} required className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none text-slate-900 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Email <span className="text-xs text-red-400">(Read-Only)</span></label>
              <input value={user.email} readOnly className="w-full p-3 bg-slate-100 rounded-lg border border-slate-200 outline-none text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Nomor Telepon</label>
              <input name="nomorTelepon" defaultValue={user.nomorTelepon} required className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none text-slate-900 focus:border-teal-500" />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-500 mb-1">Alamat Lengkap</label>
              <textarea name="alamat" defaultValue={user.alamat} required rows={3} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none text-slate-900 focus:border-teal-500" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors">
              Simpan Perubahan
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Password Saat Ini</label>
            <input type="password" name="currentPassword" required className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none text-slate-900 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Password Baru</label>
            <input type="password" name="newPassword" required minLength={6} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none text-slate-900 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Konfirmasi Password Baru</label>
            <input type="password" name="confirmPassword" required minLength={6} className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 outline-none text-slate-900 focus:border-teal-500" />
          </div>
          <div className="flex justify-start mt-2">
            <button type="submit" className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors">
              Ubah Password
            </button>
          </div>
        </form>
      )}
    </div>
  );
}