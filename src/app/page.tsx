import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function Home() {
  // Ambil produk dengan penjualan tertinggi dari database
  const topProduct = await prisma.products.findFirst({
    orderBy: {
      produkTerjual: 'desc',
    },
  });

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const getProductImage = (jenis: number | undefined) => {
    switch (jenis) {
      case 4: return "/asset-img/br12kg-circle.png";
      case 3: return "/asset-img/br5kg-circle.png";
      case 2: return "/asset-img/gas12kg-circle.png";
      case 1: return "/asset-img/gas3kg.jpg";
      default: return "/asset-img/null-produk.png";
    }
  };

  const namaProduk = topProduct?.namaProduk || "BELUM ADA PRODUK";
  const hargaProduk = topProduct?.hargaProduk || 0;
  const jenisProduk = topProduct?.jenisProduk;
  const imageSrc = getProductImage(jenisProduk);

  // Jika nama produk memiliki > 1 kata, kita pecah untuk styling cantik
  const namaSplit = namaProduk.split(' ');
  const kataPertama = namaSplit[0];
  const kataSisa = namaSplit.slice(1).join(' ');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)] flex items-center justify-center bg-white">
              <Image src="/asset-img/logo.png" alt="Logo" width={40} height={40} className="object-cover w-full h-full" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
              WEB-GAS
            </span>
          </div>
          
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            <li><Link href="/" className="text-teal-400 transition-colors">Home</Link></li>
            <li><Link href="/about" className="text-slate-300 hover:text-teal-300 transition-colors">About</Link></li>
            <li><Link href="/contact" className="text-slate-300 hover:text-teal-300 transition-colors">Contact</Link></li>
            <li><Link href="/products" className="text-slate-300 hover:text-teal-300 transition-colors">Produk</Link></li>
          </ul>

          <Link href="/login" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 border border-slate-700 hover:border-teal-500 hover:bg-slate-800/80 transition-all duration-300 text-sm font-semibold text-slate-200 hover:text-teal-400 group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            MASUK / DAFTAR
          </Link>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden text-slate-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content (Text & Info) */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold tracking-wide uppercase shadow-[0_0_20px_rgba(20,184,166,0.15)] backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Produk Terlaris Saat Ini
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                {namaProduk !== "BELUM ADA PRODUK" ? (
                  <>
                    <span className="block text-slate-100">{kataPertama}</span>
                    <span className="block bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                      {kataSisa}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400">Belum Ada Produk</span>
                )}
              </h1>
              
              <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Dapatkan produk gas terbaik kami dengan harga yang kompetitif. 
                Melayani kebutuhan rumah tangga hingga industri dengan kualitas terjamin.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="text-left bg-slate-800/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700/50 shadow-xl">
                  <span className="block text-sm text-slate-400 mb-1">Harga Spesial</span>
                  <span className="block text-3xl font-bold text-white">
                    {hargaProduk > 0 ? formatRupiah(hargaProduk) : '-'}
                    <span className="text-sm font-normal text-slate-500 ml-2">/ 25 Unit</span>
                  </span>
                </div>

                {hargaProduk > 0 && (
                  <Link href="/products" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-slate-900 bg-teal-400 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(45,212,191,0.4)]">
                    <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                    <span className="relative flex items-center gap-2">
                      LIHAT PRODUK
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Content (Product Image) */}
            <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0">
              <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[450px] lg:h-[450px] animate-[float_6s_ease-in-out_infinite]">
                {/* Glow behind image */}
                <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-[80px] scale-90"></div>
                
                {/* Product Image Frame */}
                <div className="relative w-full h-full rounded-full border-4 border-slate-800/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-slate-800/80 backdrop-blur-sm p-4">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image 
                      src={imageSrc} 
                      alt={namaProduk} 
                      fill 
                      sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 450px"
                      className="object-cover hover:scale-110 transition-transform duration-700" 
                      priority
                    />
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 sm:bottom-10 sm:left-0 bg-slate-800/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-4 animate-[float_5s_ease-in-out_infinite_reverse]">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <span className="block text-white font-bold">Terlaris #1</span>
                    <span className="block text-xs text-slate-400">Dipercaya Pelanggan</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Global CSS Inject untuk custom animation float */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
}
