import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]">
              <Image src="/asset-img/logo.png" alt="Logo" fill sizes="40px" className="object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">WEB-GAS</span>
          </Link>
          
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            <li><Link href="/" className="text-slate-300 hover:text-teal-300 transition-colors">Home</Link></li>
            <li><Link href="/about" className="text-teal-400 transition-colors">About</Link></li>
            <li><Link href="/products" className="text-slate-300 hover:text-teal-300 transition-colors">Produk</Link></li>
          </ul>

          <Link href="/login" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 border border-slate-700 hover:border-teal-500 hover:bg-slate-800/80 transition-all duration-300 text-sm font-semibold text-slate-200">
            MASUK / DAFTAR
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-8">Tentang <span className="text-teal-400">Kami</span></h1>
        <p className="text-lg text-slate-400 leading-relaxed mb-12">
          WEB-GAS adalah platform distribusi dan pemesanan gas LPG yang menghubungkan Agen dengan Supplier secara langsung. 
          Kami berkomitmen untuk memberikan layanan terbaik, transparan, dan efisien untuk memenuhi kebutuhan energi Anda.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-xl font-bold text-teal-400 mb-3">Terpercaya</h3>
            <p className="text-sm text-slate-400">Supplier dan Agen kami telah terverifikasi untuk memastikan keamanan dan kualitas layanan.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-xl font-bold text-teal-400 mb-3">Cepat</h3>
            <p className="text-sm text-slate-400">Sistem pemesanan yang cepat dan mudah tanpa proses yang rumit.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-xl font-bold text-teal-400 mb-3">Aman</h3>
            <p className="text-sm text-slate-400">Proses transaksi dan upload bukti pembayaran yang terdokumentasi dengan baik.</p>
          </div>
        </div>
      </main>
    </div>
  );
}