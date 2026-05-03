"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ProductFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const currentJenis = searchParams.get("jenis") || "all";

  const handleFilter = (jenis: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (jenis === "all") {
      params.delete("jenis");
    } else {
      params.set("jenis", jenis);
    }
    router.push(pathname + "?" + params.toString());
  };

  const filters = [
    { label: "Semua Produk", value: "all" },
    { label: "Gas 3 Kg", value: "1" },
    { label: "Gas 12 Kg", value: "2" },
    { label: "Bright Gas 5 Kg", value: "3" },
    { label: "Bright Gas 12 Kg", value: "4" },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-10">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilter(filter.value)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            currentJenis === filter.value 
            ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 border-transparent" 
            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-teal-300"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}