"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface TransactionData {
  id: string;
  tanggal: string;
  produk: string;
  supplier: string;
  agen: string;
  total: string;
  status: string;
}

export default function DownloadPDFButton({ data }: { data: TransactionData }) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      // Create a temporary hidden div for the receipt
      const receiptDiv = document.createElement("div");
      receiptDiv.innerHTML = `
        <div id="receipt-container" style="width: 600px; padding: 40px; background: white; font-family: sans-serif; color: #1e293b;">
          <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #0f766e; font-size: 28px;">WEB-GAS</h1>
            <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Struk Transaksi Resmi</p>
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
              <td style="padding: 10px 0; color: #64748b;">Produk Gas</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.produk}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Supplier</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.supplier}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Agen Pemesan</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.agen}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Status Pemesanan</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${data.status}</td>
            </tr>
          </table>

          <div style="margin-top: 30px; border-top: 2px dashed #cbd5e1; padding-top: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="font-size: 18px; font-weight: bold; color: #334155;">Total Pembayaran</td>
                <td style="font-size: 24px; font-weight: 900; color: #0f766e; text-align: right;">${data.total}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>Terima kasih telah menggunakan layanan WEB-GAS</p>
            <p>Dokumen ini adalah bukti transaksi yang sah.</p>
          </div>
        </div>
      `;
      document.body.appendChild(receiptDiv);

      const element = document.getElementById("receipt-container");
      if (element) {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width / 2, canvas.height / 2]
        });
        
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`WEB-GAS_Transaksi_${data.id}.pdf`);
      }
      
      document.body.removeChild(receiptDiv);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Gagal membuat PDF");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={generatePDF}
      disabled={loading}
      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1 disabled:opacity-70"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      {loading ? "..." : "PDF"}
    </button>
  );
}
