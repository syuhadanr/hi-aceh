"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />,
  error: <XCircle className="w-5 h-5 text-red-300 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-sky-300 flex-shrink-0" />,
};

const toastStyles: Record<ToastType, string> = {
  success: "border-emerald-400/40 bg-emerald-950 text-emerald-50 shadow-emerald-950/30",
  error: "border-red-400/40 bg-red-950 text-red-50 shadow-red-950/30",
  warning: "border-amber-400/50 bg-amber-950 text-amber-50 shadow-amber-950/30",
  info: "border-sky-400/40 bg-sky-950 text-sky-50 shadow-sky-950/30",
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  };

  useEffect(() => {
    const t = setTimeout(() => handleClose(), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`relative flex items-start gap-3 border text-sm rounded-2xl shadow-2xl px-5 py-4 w-[460px] max-w-[calc(100vw-2rem)] overflow-hidden transition-all duration-300 ease-out ${toastStyles[toast.type]} ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95"
      }`}
    >
      {icons[toast.type]}
      <span className="flex-1 leading-snug font-semibold">{toast.message}</span>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-white/50 hover:text-white transition-colors mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast portal — fixed bottom-right */}
      <div className="fixed top-5 left-1/2 z-[9999] flex -translate-x-1/2 flex-col gap-3 items-center pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
