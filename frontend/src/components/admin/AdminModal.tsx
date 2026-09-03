'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}: AdminModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop — subtle blur, low opacity */}
      <div
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className={`relative w-full ${maxWidth} bg-white border border-slate-200/80 rounded-3xl sm:rounded-[28px] shadow-2xl shadow-slate-900/10 flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-black text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-all cursor-pointer focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );

  // Render via portal so it escapes the sidebar/header stacking context
  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
