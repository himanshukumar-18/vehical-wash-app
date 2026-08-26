"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
};

const colors: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: "#f0fdf4",
    icon: "#16a34a",
    border: "#bbf7d0",
  },
  error: {
    bg: "#fef2f2",
    icon: "#dc2626",
    border: "#fecaca",
  },
  info: {
    bg: "#eff6ff",
    icon: "#2563eb",
    border: "#bfdbfe",
  },
  warning: {
    bg: "#fffbeb",
    icon: "#d97706",
    border: "#fde68a",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { bg, icon: iconColor, border } = colors[toast.type];
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: "12px",
        backgroundColor: bg,
        border: `1px solid ${border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        minWidth: "280px",
        maxWidth: "360px",
        pointerEvents: "all",
      }}
    >
      <span style={{ color: iconColor, flexShrink: 0, marginTop: "1px" }}>
        {icons[toast.type]}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: "14px",
          fontWeight: 500,
          color: "#111827",
          lineHeight: 1.5,
        }}
      >
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#9ca3af",
          padding: "2px",
          flexShrink: 0,
        }}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [{ id, type, message, duration }, ...prev].slice(0, 5));
    },
    []
  );

  const value: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
    warning: (msg) => addToast(msg, "warning"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
        }}
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
