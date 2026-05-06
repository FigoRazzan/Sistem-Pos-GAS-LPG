"use client";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const ICONS: Record<ToastType, string> = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>`,
};

const STYLES: Record<ToastType, { container: string; icon: string }> = {
  success: {
    container: "bg-white border border-emerald-200 shadow-lg shadow-emerald-100/50",
    icon: "text-emerald-500 bg-emerald-50 rounded-full p-1",
  },
  error: {
    container: "bg-white border border-red-200 shadow-lg shadow-red-100/50",
    icon: "text-red-500 bg-red-50 rounded-full p-1",
  },
  info: {
    container: "bg-white border border-blue-200 shadow-lg shadow-blue-100/50",
    icon: "text-blue-500 bg-blue-50 rounded-full p-1",
  },
  warning: {
    container: "bg-white border border-amber-200 shadow-lg shadow-amber-100/50",
    icon: "text-amber-500 bg-amber-50 rounded-full p-1",
  },
};

interface ToastCardProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

export function ToastCard({ toast, onRemove }: ToastCardProps) {
  const style = STYLES[toast.type];
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl min-w-[280px] max-w-sm animate-in slide-in-from-top-3 fade-in duration-300 ${style.container}`}
      role="alert"
    >
      <span
        className={style.icon}
        dangerouslySetInnerHTML={{ __html: ICONS[toast.type] }}
      />
      <p className="text-sm font-medium text-slate-700 flex-1 leading-snug pt-0.5">
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5 flex-shrink-0"
        aria-label="Tutup notifikasi"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
