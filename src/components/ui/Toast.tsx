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
  success: <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
  error: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />,
};

const barColors: Record<ToastType, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
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
      className={`relative flex items-start gap-3 bg-zinc-900 border border-zinc-700/60 text-white text-xs rounded-xl shadow-2xl pl-4 pr-3 py-3 w-[340px] max-w-[90vw] overflow-hidden transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Left color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${barColors[toast.type]}`} />
      {icons[toast.type]}
      <span className="flex-1 leading-snug text-zinc-100 font-medium">{toast.message}</span>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-zinc-500 hover:text-zinc-200 transition-colors mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
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
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
