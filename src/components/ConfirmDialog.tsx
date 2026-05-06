"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: async () => false,
});

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>({ isOpen: false, message: "" });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ isOpen: true, ...options });
    });
  }, []);

  const handleConfirm = () => {
    resolverRef.current?.(true);
    setState((s) => ({ ...s, isOpen: false }));
  };

  const handleCancel = () => {
    resolverRef.current?.(false);
    setState((s) => ({ ...s, isOpen: false }));
  };

  const isDanger = state.variant === "danger";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              {state.title && (
                <h3 className="font-bold text-lg text-slate-800 mb-2">{state.title}</h3>
              )}
              <p className="text-sm text-slate-600 leading-relaxed">{state.message}</p>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {state.cancelLabel || "Batal"}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-colors ${
                  isDanger
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-teal-500 hover:bg-teal-600"
                }`}
              >
                {state.confirmLabel || "Ya, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext).confirm;
}
