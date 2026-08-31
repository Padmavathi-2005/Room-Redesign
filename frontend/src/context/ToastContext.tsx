'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastPayload {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastItem extends ToastPayload {
  id: string;
}

interface ToastContextType {
  showToast: (payload: ToastPayload) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type, title, message, duration = 5000 }: ToastPayload) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, type, title, message, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* TOP-RIGHT FLOATING TOAST CONTAINER */}
      <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full select-none">
        <AnimatePresence mode="sync">
          {toasts.map((toast) => {
            const isError = toast.type === 'error';
            const isSuccess = toast.type === 'success';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-md flex items-start gap-3 transition-all ${
                  isError
                    ? 'bg-white/95 dark:bg-slate-900/95 border-rose-200 dark:border-rose-900/60 text-slate-800 dark:text-slate-100 shadow-rose-500/5'
                    : isSuccess
                      ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-100 shadow-emerald-500/5'
                      : 'bg-white/95 dark:bg-slate-900/95 border-purple-200 dark:border-purple-900/60 text-slate-800 dark:text-slate-100 shadow-purple-500/5'
                }`}
              >
                {/* ICON CONTAINER */}
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isError
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      : isSuccess
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                  }`}
                >
                  {isError || isWarning ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                {/* TEXT CONTENT */}
                <div className="flex-1 space-y-0.5 min-w-0">
                  <h4
                    className={`text-xs font-bold font-heading leading-snug ${
                      isError
                        ? 'text-rose-600 dark:text-rose-400'
                        : isSuccess
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {toast.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words">
                    {toast.message}
                  </p>
                </div>

                {/* CLOSE BUTTON */}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
