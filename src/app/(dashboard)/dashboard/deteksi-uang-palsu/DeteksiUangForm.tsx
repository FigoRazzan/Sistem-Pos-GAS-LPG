"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createCashDetection } from "@/app/actions/cashDetection";
import { useToast } from "@/components/ToastProvider";

type Mode = "camera" | "upload";

export default function DeteksiUangForm({ transactionId }: { transactionId?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<Mode>("upload");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    setFile(null);
    setPreview(null);
  }, [mode]);

  useEffect(() => {
    if (mode !== "camera") {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }
    if (stream) return;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Gagal akses kamera", error);
        toast.error("Tidak bisa mengakses kamera. Silakan gunakan upload foto.");
        setMode("upload");
      }
    };
    startCamera();

    return () => {
      // cleanup handled in mode-change effect
    };
  }, [mode, stream]);

  // ─── File helpers ─────────────────────────────────────────────────────────
  const applyFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.warning("Hanya file gambar (JPG/PNG) yang diizinkan.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.warning("Ukuran file maksimal 5MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) applyFile(selected);
  };

  // ─── Drag & Drop ──────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) applyFile(dropped);
  };

  // ─── Camera capture ───────────────────────────────────────────────────────
  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const capturedFile = new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
      setFile(capturedFile);
      setPreview(URL.createObjectURL(capturedFile));
    }, "image/jpeg", 0.92);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.warning("Silakan pilih atau ambil foto terlebih dahulu.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("img", file);
    formData.append("metodeDeteksi", mode === "camera" ? "1" : "2");
    if (transactionId) {
      formData.append("transactionId", transactionId);
    }

    const result = await createCashDetection(formData);
    if (result.success) {
      if (result.aiStatus === "asli") {
        toast.success(`✅ ${result.message}`);
      } else if (result.aiStatus === "palsu") {
        toast.error(`🚨 ${result.message}`);
      } else {
        toast.info(result.message || "Data deteksi tersimpan.");
      }
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } else {
      toast.error(result.error || "Gagal menyimpan deteksi");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Deteksi Uang Palsu</h2>
          <p className="text-sm text-slate-500">
            Upload atau drag &amp; drop foto uang — AI akan menganalisis keasliannya secara otomatis.
          </p>
          {transactionId && (
            <p className="text-xs text-teal-600 mt-1">Terkait transaksi #{transactionId}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${mode === "upload"
              ? "bg-teal-500 text-white border-teal-500"
              : "border-slate-200 text-slate-600 hover:border-teal-300"
              }`}
          >
            📁 Upload Foto
          </button>
          <button
            type="button"
            onClick={() => setMode("camera")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${mode === "camera"
              ? "bg-teal-500 text-white border-teal-500"
              : "border-slate-200 text-slate-600 hover:border-teal-300"
              }`}
          >
            📷 Gunakan Kamera
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "upload" ? (
          /* ── Drag & Drop Upload Area ── */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none ${isDragging
              ? "border-teal-500 bg-teal-50"
              : "border-slate-300 hover:border-teal-400 hover:bg-slate-50"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <span className="text-4xl">{isDragging ? "📥" : "🖼️"}</span>
              <p className="text-sm font-semibold text-slate-700">
                {isDragging ? "Lepaskan untuk upload" : "Klik atau drag & drop foto di sini"}
              </p>
              <p className="text-xs text-slate-400">JPG / PNG · Maks. 5MB</p>
            </div>
          </div>
        ) : (
          /* ── Camera View ── */
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
            </div>
            <button
              type="button"
              onClick={handleCapture}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              📸 Ambil Foto
            </button>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">Preview Foto</p>
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕ Hapus
              </button>
            </div>
            <img src={preview} alt="Preview" className="max-h-64 rounded-lg object-contain mx-auto" />
            {file && (
              <p className="text-xs text-slate-400 mt-2 text-center">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
            )}
          </div>
        )}

        {/* AI Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
          <strong>ℹ️ Cara kerja AI:</strong> Jika AI yakin ≥60% bahwa uang tersebut asli → <strong>ASLI</strong>. Jika keyakinan &lt;60% → <strong>PALSU</strong> / perlu verifikasi.
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !file}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menganalisis AI...
              </span>
            ) : "🔍 Deteksi Sekarang"}
          </button>
        </div>
      </form>
    </div>
  );
}
