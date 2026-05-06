"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCashDetectionStatus } from "@/app/actions/cashDetection";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";

const STATUS = {
  MENUNGGU: 0,
  ASLI: 1,
  PALSU: 2,
};

export default function DeteksiUangStatusButton({
  detectionId,
  currentStatus,
}: {
  detectionId: string;
  currentStatus: number;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const handleUpdate = async (status: number) => {
    const isAsli = status === STATUS.ASLI;
    const ok = await confirm({
      title: isAsli ? "Tandai Uang Asli" : "Tandai Uang Palsu",
      message: isAsli
        ? "Anda yakin uang ini ASLI? Status transaksi akan diperbarui ke Siap Kirim."
        : "Anda yakin uang ini PALSU? Status transaksi akan ditandai tidak valid.",
      confirmLabel: isAsli ? "Ya, Asli" : "Ya, Palsu",
      variant: isAsli ? "default" : "danger",
    });
    if (!ok) return;

    setLoading(true);
    const result = await updateCashDetectionStatus(detectionId, status);
    if (result.success) {
      toast.success(result.message || "Status diperbarui");
      router.refresh();
    } else {
      toast.error(result.error || "Gagal memperbarui status");
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleUpdate(STATUS.ASLI)}
        disabled={loading || currentStatus === STATUS.ASLI}
        className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg disabled:opacity-50"
      >
        ASLI
      </button>
      <button
        onClick={() => handleUpdate(STATUS.PALSU)}
        disabled={loading || currentStatus === STATUS.PALSU}
        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-50"
      >
        PALSU
      </button>
    </div>
  );
}
