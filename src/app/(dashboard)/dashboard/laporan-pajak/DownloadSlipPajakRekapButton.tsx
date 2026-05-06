"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ToastProvider";

interface SlipPajakRekapData {
  supplier: string;
  bulan: string;
  tahun: number;
  totalTransaksi: number;
  totalDpp: number;
  totalPpn: number;
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export default function DownloadSlipPajakRekapButton({ data }: { data: SlipPajakRekapData }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const generatePDF = async () => {
    setLoading(true);
    try {
      const slipDiv = document.createElement("div");
      // Position off-screen so it doesn't affect layout
      slipDiv.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;";
      slipDiv.innerHTML = `
        <div id="slip-pajak-rekap" style="width: 595px; padding: 40px; background: white; font-family: Arial, sans-serif; color: #1e293b; box-sizing: border-box;">
          <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #0f766e; font-size: 26px;">WEB-GAS</h1>
            <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Slip Pajak Bulanan (Simulasi)</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Supplier</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.supplier}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Periode</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.bulan} ${data.tahun}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Total Transaksi</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.totalTransaksi} transaksi</td>
            </tr>
          </table>

          <div style="margin-top: 30px; border-top: 2px dashed #cbd5e1; padding-top: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="font-size: 16px; font-weight: 600; color: #334155;">Total DPP</td>
                <td style="font-size: 16px; font-weight: 700; text-align: right;">${formatRupiah(data.totalDpp)}</td>
              </tr>
              <tr>
                <td style="font-size: 16px; font-weight: 600; color: #334155;">Total PPN</td>
                <td style="font-size: 16px; font-weight: 700; text-align: right;">${formatRupiah(data.totalPpn)}</td>
              </tr>
              <tr>
                <td style="font-size: 18px; font-weight: 800; color: #0f766e;">Total Setor</td>
                <td style="font-size: 18px; font-weight: 900; color: #0f766e; text-align: right;">${formatRupiah(data.totalPpn)}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>Slip pajak ini dibuat otomatis sebagai simulasi e-Billing.</p>
            <p>Dokumen ini bersifat informatif.</p>
          </div>
        </div>
      `;
      document.body.appendChild(slipDiv);

      const element = document.getElementById("slip-pajak-rekap");
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");

        // A4 dimensions in mm: 210 x 297
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const imgW = pageW - margin * 2;
        const imgH = (canvas.height / canvas.width) * imgW;

        // If content fits in one page
        if (imgH <= pageH - margin * 2) {
          pdf.addImage(imgData, "PNG", margin, margin, imgW, imgH);
        } else {
          // Multi-page rendering
          let yOffset = 0;
          let pageRemaining = pageH - margin * 2;
          let isFirst = true;
          while (yOffset < imgH) {
            if (!isFirst) pdf.addPage();
            const sliceH = Math.min(pageRemaining, imgH - yOffset);
            pdf.addImage(imgData, "PNG", margin, margin - yOffset, imgW, imgH);
            yOffset += sliceH;
            isFirst = false;
          }
        }

        pdf.save(`WEB-GAS_SlipPajak_${data.bulan}_${data.tahun}.pdf`);
        toast.success("Slip pajak berhasil diunduh!");
      }

      document.body.removeChild(slipDiv);
    } catch (error) {
      console.error("Failed to generate slip pajak rekap", error);
      toast.error("Gagal membuat slip pajak. Coba lagi.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70"
    >
      {loading ? "Membuat..." : "Generate Slip Pajak"}
    </button>
  );
}
