import Image from "next/image";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)] flex items-center justify-center bg-white">
              <Image src="/asset-img/logo.png" alt="Logo" width={40} height={40} className="object-cover w-full h-full" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">WEB-GAS</span>
          </Link>
          
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            <li><Link href="/" className="text-slate-300 hover:text-teal-300 transition-colors">Home</Link></li>
            <li><Link href="/about" className="text-slate-300 hover:text-teal-300 transition-colors">About</Link></li>
            <li><Link href="/products" className="text-slate-300 hover:text-teal-300 transition-colors">Produk</Link></li>
          </ul>

          <Link href="/login" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 border border-slate-700 hover:border-teal-500 hover:bg-slate-800/80 transition-all duration-300 text-sm font-semibold text-slate-200">
            MASUK / DAFTAR
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 max-w-3xl mx-auto px-6">
        <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-center text-teal-400">Kontak Kami</h1>
        <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 shadow-xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Nama Lengkap</label>
              <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" placeholder="Masukkan nama Anda" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
              <input type="email" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" placeholder="Masukkan email Anda" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Pesan</label>
              <textarea rows={5} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors" placeholder="Tulis pesan Anda di sini..."></textarea>
            </div>
            <button type="button" className="w-full bg-teal-500 text-slate-900 font-bold py-3 rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20">
              Kirim Pesan
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}