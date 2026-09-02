'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
  Filter,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  externalSearchQuery?: string;
  hideSearchInput?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  emptyMessage?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  rowKeyAccessor?: (row: T, index: number) => string | number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchKeys,
  externalSearchQuery,
  hideSearchInput = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  isLoading = false,
  emptyMessage = 'No matching records found',
  title,
  subtitle,
  actions,
  rowKeyAccessor,
}: DataTableProps<T>) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  // Filter data based on global search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      // If searchKeys provided, search specified keys
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const val = item[key as string];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
        });
      }

      // Default: search all string/number primitive values in item
      return Object.values(item).some((val) => {
        if (val === undefined || val === null) return false;
        if (typeof val === 'object') {
          return JSON.stringify(val).toLowerCase().includes(query);
        }
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Pagination calculation
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, validCurrentPage, pageSize]);

  const handleSort = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const startEntry = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endEntry = Math.min(validCurrentPage * pageSize, totalItems);

  return (
    <div className="space-y-4">
      {/* HEADER CONTROLS (TITLE, SEARCH & ROW LIMIT) */}
      {title || subtitle || actions || !hideSearchInput ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          {(title || subtitle || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {(title || subtitle) && (
                <div>
                  {title && <h3 className="text-base font-extrabold text-slate-900 font-heading">{title}</h3>}
                  {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
              )}

              {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* SEARCH INPUT */}
            {!hideSearchInput && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={internalSearchQuery}
                  onChange={(e) => {
                    setInternalSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all font-medium"
                />
              </div>
            )}

            {/* PAGE SIZE SELECTOR */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-600 font-medium ml-auto">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} rows
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* Standalone right-aligned Page Size selector when top search card is suppressed */
        <div className="flex items-center justify-end gap-2 text-xs text-slate-600 font-medium pb-1">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer shadow-2xs"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} rows
              </option>
            ))}
          </select>
        </div>
      )}

      {/* TABLE DATA CONTAINER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[11px] font-extrabold text-slate-600 font-heading uppercase tracking-wider">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`px-5 py-4 select-none ${col.sortable ? 'cursor-pointer hover:bg-slate-100/80 transition-colors' : ''} ${col.headerClassName || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {sortColumn === col.key ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-purple-600" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {isLoading ? (
                Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded-2xl w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400">
                    <div className="space-y-2 max-w-xs mx-auto">
                      <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">{emptyMessage}</p>
                      {searchQuery && (
                        <p className="text-[11px] text-slate-500">
                          No results matching "<span className="font-semibold">{searchQuery}</span>". Try adjusting your search query.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rIdx) => {
                  const key = rowKeyAccessor ? rowKeyAccessor(row, rIdx) : row._id || row.id || rIdx;
                  return (
                    <motion.tr
                      key={key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="hover:bg-purple-50/40 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`px-5 py-4 ${col.className || ''}`}>
                          {col.accessor ? col.accessor(row) : row[col.key]}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!isLoading && totalItems > 0 && (
          <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
            {/* COUNTER SUMMARY */}
            <div>
              Showing <strong className="text-slate-900 font-extrabold">{startEntry}</strong> to{' '}
              <strong className="text-slate-900 font-extrabold">{endEntry}</strong> of{' '}
              <strong className="text-slate-900 font-extrabold">{totalItems}</strong> entries
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4 text-slate-700" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>

              <span className="px-3 py-1 bg-white border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-900 font-mono">
                {validCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
