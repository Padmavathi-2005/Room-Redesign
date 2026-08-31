'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

interface CommonPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function CommonPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 15, 25, 50],
  className = '',
}: CommonPaginationProps) {
  const { settings, updateSettings } = useSettings();
  const limit = pageSize || settings.tablePaginationLimit || 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(totalItems, currentPage * limit);

  const handlePageSizeSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
    // Update global app settings so all tables sync to the same user preference
    try {
      await updateSettings({ tablePaginationLimit: newSize });
    } catch {}
    // Reset to page 1 on page size change
    onPageChange(1);
  };

  if (totalItems === 0) return null;

  const isStandalone = className.includes('bg-transparent') || className.includes('border-0');
  const baseStyle = isStandalone ? '' : 'bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800';

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 ${baseStyle} ${className}`}>
      {/* Left: Range Info & Items Per Page Selector */}
      <div className="flex items-center gap-3">
        <span className="font-medium">
          Showing <span className="font-extrabold text-slate-900 dark:text-white">{startItem}</span> to{' '}
          <span className="font-extrabold text-slate-900 dark:text-white">{endItem}</span> of{' '}
          <span className="font-extrabold text-slate-900 dark:text-white">{totalItems}</span> entries
        </span>

        <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 dark:border-slate-700 pl-3">
          <span className="text-[11px] font-semibold text-slate-400">Rows per page:</span>
          <select
            value={limit}
            onChange={handlePageSizeSelect}
            className="px-2 py-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 cursor-pointer shadow-2xs"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 px-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((page, index, array) => {
              const prevPage = array[index - 1];
              const showEllipsis = prevPage && page - prevPage > 1;

              return (
                <React.Fragment key={page}>
                  {showEllipsis && <span className="px-1 text-slate-400 font-bold">...</span>}
                  <button
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-2xl text-xs font-extrabold transition-all ${
                      currentPage === page
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
