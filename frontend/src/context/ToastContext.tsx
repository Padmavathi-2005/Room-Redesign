'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  timestamp: string;
  duration?: number; // in ms, default 4000
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      type,
      title,
      message,
      duration = DEFAULT_DURATION,
    }: Omit<Toast, 'id' | 'timestamp'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const newToast: Toast = {
        id,
        type,
        title,
        message,
        timestamp,
        duration,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5));
    },
    []
  );

  const toastHelpers = {
    success: (message: string, title?: string, duration?: number) =>
      addToast({ type: 'success', title: title || 'Success', message, duration }),
    error: (message: string, title?: string, duration?: number) =>
      addToast({ type: 'error', title: title || 'Error', message, duration }),
    warning: (message: string, title?: string, duration?: number) =>
      addToast({ type: 'warning', title: title || 'Warning', message, duration }),
    info: (message: string, title?: string, duration?: number) =>
      addToast({ type: 'info', title: title || 'Notification', message, duration }),
  };

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, toast: toastHelpers }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/* -------------------------------------------------------------------------- */
/*                            TOAST CONTAINER LAYER                           */
/* -------------------------------------------------------------------------- */

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div
      aria-live="assertive"
      className="fixed top-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm w-[90vw] sm:w-[380px] pointer-events-none font-sans"
    >
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               TOAST ITEM CARD                              */
/* -------------------------------------------------------------------------- */

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [isPaused, setIsPaused] = useState(false);

  React.useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, isPaused, onDismiss]);

  const config = getToastConfig(toast.type);
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="pointer-events-auto relative overflow-hidden rounded-[14px] p-4 shadow-xl shadow-slate-950/10 dark:shadow-slate-950/40 border bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/90 dark:border-slate-800 transition-all font-sans"
    >
      <div className="flex items-start gap-3">
        {/* Left Icon Container */}
        <div className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center border ${config.iconBgStyle}`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-xs font-bold font-sans ${config.titleColor}`}>
              {toast.title || config.defaultTitle}
            </h4>
            <span className="text-[10px] font-sans text-slate-400 font-medium shrink-0">
              {toast.timestamp}
            </span>
          </div>

          <p className="text-xs font-sans text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-normal">
            {toast.message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* AUTO DISMISS PROGRESS BAR */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${config.progressStyle}`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>
    </motion.div>
  );
}

function getToastConfig(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle2,
        defaultTitle: 'Success',
        iconBgStyle: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:bg-emerald-500/15',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        titleColor: 'text-slate-900 dark:text-white',
        progressStyle: 'bg-emerald-500',
      };
    case 'error':
      return {
        icon: AlertCircle,
        defaultTitle: 'Error',
        iconBgStyle: 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:bg-rose-500/15',
        iconColor: 'text-rose-600 dark:text-rose-400',
        titleColor: 'text-slate-900 dark:text-white',
        progressStyle: 'bg-rose-500',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        defaultTitle: 'Warning',
        iconBgStyle: 'bg-amber-500/10 border-amber-500/20 text-amber-500 dark:bg-amber-500/15',
        iconColor: 'text-amber-600 dark:text-amber-400',
        titleColor: 'text-slate-900 dark:text-white',
        progressStyle: 'bg-amber-500',
      };
    case 'info':
    default:
      return {
        icon: Info,
        defaultTitle: 'Notification',
        iconBgStyle: 'bg-purple-500/10 border-purple-500/20 text-purple-500 dark:bg-purple-500/15',
        iconColor: 'text-purple-600 dark:text-purple-400',
        titleColor: 'text-slate-900 dark:text-white',
        progressStyle: 'bg-purple-600',
      };
  }
}

