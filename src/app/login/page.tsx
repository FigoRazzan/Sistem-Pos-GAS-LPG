"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Login handler
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await registerUser(formData);

    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.success) {
      setSuccessMsg(result.message || "Berhasil");
      setIsLogin(true); // Switch back to login form
      form.reset(); // clear form
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[url('/asset-img/gas3kg.jpg')] bg-cover bg-center bg-blend-overlay">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8 relative z-10 m-4">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 relative bg-slate-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
            <Image src="/asset-img/logo.png" alt="Logo" width={60} height={60} className="object-contain" />
          </div>
        </div>

        {/* Title */}
        <div className="flex justify-center w-full mb-6 text-3xl font-bold transition-all duration-300">
          {isLogin ? (
            <h2 className="text-slate-800">Login</h2>
          ) : (
            <h2 className="text-slate-800">Registrasi</h2>
          )}
        </div>

        {/* Slide Controls */}
        <div className="flex relative w-full h-12 bg-slate-100 rounded-full mb-8 overflow-hidden">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(""); setSuccessMsg(""); }}
            className={`w-1/2 h-full z-10 font-semibold transition-all duration-300 ${isLogin ? 'text-white' : 'text-slate-500'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(""); setSuccessMsg(""); }}
            className={`w-1/2 h-full z-10 font-semibold transition-all duration-300 ${!isLogin ? 'text-white' : 'text-slate-500'}`}
          >
            Buat Akun
          </button>
          
          {/* Slider Background */}
          <div 
            className={`absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-transform duration-300 ease-in-out`}
            style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}
          ></div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-600 text-sm font-medium border border-red-200">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-600 text-sm font-medium border border-green-200">
            {successMsg}
          </div>
        )}

        {/* Forms Container with sliding animation */}
        <div className="relative overflow-hidden w-full h-[400px]">
          <div 
            className="absolute top-0 w-[200%] flex transition-transform duration-500 ease-in-out"
            style={{ transform: isLogin ? 'translateX(0)' : 'translateX(-50%)' }}
          >
            
            {/* Login Form (Left Side) */}
            <form onSubmit={handleLogin} className="w-1/2 px-2 transition-opacity duration-300">
              <div className="space-y-4">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  required
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                />
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  required
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 mt-4 rounded-lg bg-gradient-to-r from-teal-400 to-emerald-500 text-white font-bold text-lg hover:shadow-lg hover:from-teal-500 hover:to-emerald-600 transition-all disabled:opacity-70"
                >
                  {loading ? "Memproses..." : "Masuk"}
                </button>
              </div>
            </form>

            {/* Register Form (Right Side) */}
            <form onSubmit={handleRegister} className="w-1/2 px-2 transition-opacity duration-300 overflow-y-auto max-h-[400px] pb-4 custom-scrollbar">
              <div className="space-y-3">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  required
                  className="w-full h-11 px-4 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-sm"
                />
                <input 
                  type="text" 
                  name="fullname"
                  placeholder="Nama Lengkap" 
                  required
                  className="w-full h-11 px-4 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-sm"
                />
                
                <div className="flex gap-3">
                  <select name="gender" required className="w-1/2 h-11 px-3 rounded-lg border border-slate-300 text-slate-900 focus:border-teal-500 outline-none text-sm bg-white">
                    <option value="">Jenis Kelamin</option>
                    <option value="1">Laki-laki</option>
                    <option value="2">Perempuan</option>
                  </select>
                  <select name="status" required className="w-1/2 h-11 px-3 rounded-lg border border-slate-300 text-slate-900 focus:border-teal-500 outline-none text-sm bg-white">
                    <option value="">Daftar Sebagai</option>
                    <option value="1">Supplier Gas</option>
                    <option value="2">Agen Gas</option>
                  </select>
                </div>

                <input 
                  type="number" 
                  name="nomorTelepon"
                  placeholder="Nomor Telepon" 
                  required
                  className="w-full h-11 px-4 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-sm"
                />
                <input 
                  type="text" 
                  name="alamat"
                  placeholder="Alamat Lengkap" 
                  required
                  className="w-full h-11 px-4 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-sm"
                />
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  required
                  className="w-full h-11 px-4 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-sm"
                />
                <input 
                  type="password" 
                  name="password_confirmation"
                  placeholder="Konfirmasi Password" 
                  required
                  className="w-full h-11 px-4 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-sm"
                />
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 mt-2 rounded-lg bg-gradient-to-r from-teal-400 to-emerald-500 text-white font-bold hover:shadow-lg hover:from-teal-500 hover:to-emerald-600 transition-all disabled:opacity-70"
                >
                  {loading ? "Memproses..." : "Buat Akun"}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
