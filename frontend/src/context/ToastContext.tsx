'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
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
  duration?: number; // in ms, default 5000
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

const DEFAULT_DURATION = 5000;

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
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newToast: Toast = {
        id,
        type,
        title,
        message,
        timestamp,
        duration,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 active toasts
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
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-[90vw] sm:w-[380px] pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
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
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 shadow-xl border backdrop-blur-xl transition-all duration-300 transform animate-in slide-in-from-top-4 fade-in-80 ${config.bgStyle} ${config.borderStyle}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl shrink-0 ${config.iconBgStyle}`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-xs font-black uppercase tracking-wider font-heading ${config.titleColor}`}>
              {toast.title || config.defaultTitle}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              {toast.timestamp}
            </span>
          </div>

          <p className={`text-xs font-medium mt-1 leading-relaxed ${config.textColor}`}>
            {toast.message}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* AUTO DISMISS PROGRESS BAR */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/40 dark:bg-slate-800/40 overflow-hidden">
        <div
          className={`h-full ${config.progressStyle} ${isPaused ? 'paused' : ''}`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  );
}

function getToastConfig(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle2,
        defaultTitle: 'Success',
        bgStyle: 'bg-emerald-50/95 dark:bg-emerald-950/90',
        borderStyle: 'border-emerald-200 dark:border-emerald-800/80',
        iconBgStyle: 'bg-emerald-100 dark:bg-emerald-900/60',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        titleColor: 'text-emerald-900 dark:text-emerald-200',
        textColor: 'text-emerald-800 dark:text-emerald-300',
        progressStyle: 'bg-emerald-500',
      };
    case 'error':
      return {
        icon: AlertCircle,
        defaultTitle: 'Error',
        bgStyle: 'bg-rose-50/95 dark:bg-rose-950/90',
        borderStyle: 'border-rose-200 dark:border-rose-800/80',
        iconBgStyle: 'bg-rose-100 dark:bg-rose-900/60',
        iconColor: 'text-rose-600 dark:text-rose-400',
        titleColor: 'text-rose-900 dark:text-rose-200',
        textColor: 'text-rose-800 dark:text-rose-300',
        progressStyle: 'bg-rose-500',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        defaultTitle: 'Warning',
        bgStyle: 'bg-amber-50/95 dark:bg-amber-950/90',
        borderStyle: 'border-amber-200 dark:border-amber-800/80',
        iconBgStyle: 'bg-amber-100 dark:bg-amber-900/60',
        iconColor: 'text-amber-600 dark:text-amber-400',
        titleColor: 'text-amber-900 dark:text-amber-200',
        textColor: 'text-amber-800 dark:text-amber-300',
        progressStyle: 'bg-amber-500',
      };
    case 'info':
    default:
      return {
        icon: Info,
        defaultTitle: 'Notification',
        bgStyle: 'bg-indigo-50/95 dark:bg-indigo-950/90',
        borderStyle: 'border-indigo-200 dark:border-indigo-800/80',
        iconBgStyle: 'bg-indigo-100 dark:bg-indigo-900/60',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        titleColor: 'text-indigo-900 dark:text-indigo-200',
        textColor: 'text-indigo-800 dark:text-indigo-300',
        progressStyle: 'bg-indigo-500',
      };
  }
}
