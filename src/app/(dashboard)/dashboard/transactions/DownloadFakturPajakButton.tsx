"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ToastProvider";

interface FakturPajakData {
  id: string;
  tanggal: string;
  supplier: string;
  agen: string;
  subtotal: number;
  pajak: number;
  total: number;
  status: string;
  npwpSupplier?: string;
  npwpAgen?: string;
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export default function DownloadFakturPajakButton({ data }: { data: FakturPajakData }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const npwpSupplier = data.npwpSupplier || "00.000.000.0-000.000";
  const npwpAgen = data.npwpAgen || "00.000.000.0-000.000";

  const generatePDF = async () => {
    setLoading(true);
    try {
      const fakturDiv = document.createElement("div");
      fakturDiv.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;";
      fakturDiv.innerHTML = `
        <div id="faktur-pajak" style="width: 595px; padding: 40px; background: white; font-family: Arial, sans-serif; color: #1e293b; box-sizing: border-box;">
          <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #0f766e; font-size: 26px;">WEB-GAS</h1>
            <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Faktur Pajak</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b;">ID Transaksi</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">#${data.id}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Tanggal</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.tanggal}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Supplier</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.supplier}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">NPWP Supplier</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${npwpSupplier}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Agen</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.agen}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">NPWP Agen</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${npwpAgen}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Status</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.status}</td>
            </tr>
          </table>

          <div style="margin-top: 30px; border-top: 2px dashed #cbd5e1; padding-top: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="font-size: 16px; font-weight: 600; color: #334155;">DPP</td>
                <td style="font-size: 16px; font-weight: 700; text-align: right;">${formatRupiah(data.subtotal)}</td>
              </tr>
              <tr>
                <td style="font-size: 16px; font-weight: 600; color: #334155;">PPN 11%</td>
                <td style="font-size: 16px; font-weight: 700; text-align: right;">${formatRupiah(data.pajak)}</td>
              </tr>
              <tr>
                <td style="font-size: 18px; font-weight: 800; color: #0f766e;">Total Bayar</td>
                <td style="font-size: 18px; font-weight: 900; color: #0f766e; text-align: right;">${formatRupiah(data.total)}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>Dokumen ini adalah faktur pajak simulasi.</p>
            <p>Gunakan untuk keperluan administrasi internal.</p>
          </div>
        </div>
      `;
      document.body.appendChild(fakturDiv);

      const element = document.getElementById("faktur-pajak");
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const imgW = pageW - margin * 2;
        const imgH = (canvas.height / canvas.width) * imgW;

        if (imgH <= pageH - margin * 2) {
          pdf.addImage(imgData, "PNG", margin, margin, imgW, imgH);
        } else {
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

        pdf.save(`WEB-GAS_FakturPajak_${data.id}.pdf`);
        toast.success("Faktur pajak berhasil diunduh!");
      }

      document.body.removeChild(fakturDiv);
    } catch (error) {
      console.error("Failed to generate faktur pajak", error);
      toast.error("Gagal membuat faktur pajak. Coba lagi.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1 disabled:opacity-70"
    >
      {loading ? "..." : "Faktur Pajak"}
    </button>
  );
}
