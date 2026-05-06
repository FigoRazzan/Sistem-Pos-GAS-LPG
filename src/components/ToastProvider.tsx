"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { ToastCard, ToastItem, ToastType } from "./Toast";

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    // Auto-dismiss after 6.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container — fixed, top-right */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return {
    success: (msg: string) => ctx.addToast("success", msg),
    error: (msg: string) => ctx.addToast("error", msg),
    info: (msg: string) => ctx.addToast("info", msg),
    warning: (msg: string) => ctx.addToast("warning", msg),
  };
}
