'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Coins, Search, Globe } from 'lucide-react';
import { useCurrency, Currency } from '@/context/CurrencyContext';

interface CurrencySwitcherProps {
  className?: string;
  compact?: boolean;
}

export default function CurrencySwitcher({ className = '', compact = false }: CurrencySwitcherProps) {
  const { currencies, selectedCurrency, setCurrency, isLoading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.includes(search)
  );

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 shadow-2xs backdrop-blur-md transition-all cursor-pointer select-none font-heading ${
          isOpen ? 'ring-2 ring-primary/20 border-primary/50' : ''
        }`}
        title={`Change currency (Current: ${selectedCurrency.code} - ${selectedCurrency.name})`}
        aria-label="Select Currency"
      >
        <span className="w-5 h-5 rounded-md bg-primary/10 dark:bg-primary/20 text-primary font-black text-[11px] flex items-center justify-center shrink-0">
          {selectedCurrency?.symbol || '$'}
        </span>
        <span className="text-xs font-bold tracking-wide">
          {selectedCurrency?.code || 'USD'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 group-hover:text-slate-600 dark:group-hover:text-slate-300 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 z-[90] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 overflow-hidden"
          >
            <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>Select Currency</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">
                {currencies.length} Available
              </span>
            </div>

            {/* Quick Search */}
            {currencies.length > 5 && (
              <div className="relative px-1 pt-1 pb-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search currency..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {/* Currencies List */}
            <div className="max-h-60 overflow-y-auto space-y-0.5 pt-1 [scrollbar-width:thin]">
              {filteredCurrencies.map((curr) => {
                const isSelected = selectedCurrency.code === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      setCurrency(curr.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer font-heading ${
                      isSelected
                        ? 'bg-primary text-white shadow-2xs font-extrabold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-primary border border-slate-200/60 dark:border-slate-700'
                        }`}
                      >
                        {curr.symbol}
                      </span>
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="text-xs font-bold truncate">{curr.code}</span>
                        <span
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-400'
                          }`}
                        >
                          {curr.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {curr.isDefault && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-extrabold tracking-wider ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900'
                          }`}
                        >
                          Base
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                    </div>
                  </button>
                );
              })}

              {filteredCurrencies.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400 font-medium">
                  No currencies match &quot;{search}&quot;
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
