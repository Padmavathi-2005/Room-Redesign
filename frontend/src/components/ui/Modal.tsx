'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode | string;
  subtitle?: string;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth = 'md',
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Manage body scroll lock & data-modal-open state
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isOpen) {
      document.body.setAttribute('data-modal-open', 'true');
      document.body.classList.add('modal-open');
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.removeAttribute('data-modal-open');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.removeAttribute('data-modal-open');
      document.body.classList.remove('modal-open');
    }
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full m-4',
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/20 dark:bg-slate-950/30 backdrop-blur-xs transition-all duration-200"
          onClick={() => {
            if (closeOnBackdrop) onClose();
          }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${maxWidthClasses[maxWidth] || 'max-w-md'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-900 dark:text-slate-100 max-h-[88vh] flex flex-col overflow-hidden ${className}`}
          >
            {/* MODAL HEADER */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 p-6 sm:px-8 sm:pt-7 sm:pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  {icon && (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 shrink-0 border border-purple-100 dark:border-purple-900/50">
                      {icon}
                    </div>
                  )}
                  {title && (
                    <div className="space-y-0.5 min-w-0">
                      {typeof title === 'string' ? (
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-sans truncate">
                          {title}
                        </h3>
                      ) : (
                        title
                      )}
                      {subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 stroke-[2.2]" />
                  </button>
                )}
              </div>
            )}

            {/* MODAL BODY — Scrollable inside box */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
