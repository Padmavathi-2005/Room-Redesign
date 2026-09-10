'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Coins, Check } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency, Currency } from '@/context/CurrencyContext';

interface PreferencesSwitcherProps {
  className?: string;
  initialTab?: 'language' | 'currency';
  placement?: 'bottom' | 'top';
  variant?: 'icon' | 'pill';
  onCloseParent?: () => void;
}

export default function PreferencesSwitcher({
  className = '',
  initialTab = 'language',
  placement = 'bottom',
  variant = 'pill',
  onCloseParent,
}: PreferencesSwitcherProps) {
  const { currentLanguage, languages, setLanguage } = useTranslation();
  const { currencies, selectedCurrency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'language' | 'currency'>(initialTab);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Streamlined currencies from database (USD, EUR, GBP, INR)
  const activeCurrencies = React.useMemo(() => {
    if (currencies && currencies.length > 0) {
      return currencies.filter((c) => c.isActive);
    }
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0, isDefault: true, isActive: true, position: 'prefix', decimalPlaces: 2 },
      { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92, isDefault: false, isActive: true, position: 'suffix', decimalPlaces: 2 },
      { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79, isDefault: false, isActive: true, position: 'prefix', decimalPlaces: 2 },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 83.5, isDefault: false, isActive: true, position: 'prefix', decimalPlaces: 2 },
    ] as Currency[];
  }, [currencies]);



  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* TRIGGER BUTTON (PILL FOR FOOTER / ICON FOR COMPACT AREAS) */}
      {variant === 'pill' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/60 hover:text-primary shadow-2xs text-xs font-semibold transition-all cursor-pointer select-none ${
            isOpen ? 'ring-2 ring-primary/20 border-primary text-primary' : ''
          }`}
          title={`Language: ${currentLanguage.name} · Currency: ${selectedCurrency.code}`}
          aria-label="Language and Currency Preferences"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="text-[11px] font-bold tracking-wide" suppressHydrationWarning>{currentLanguage.code.toUpperCase()}</span>
          <span className="text-slate-300 dark:text-slate-600 text-[10px]">|</span>
          <span className="text-[11px] font-bold tracking-wide" suppressHydrationWarning>{selectedCurrency.code}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/60 hover:text-primary shadow-2xs flex items-center justify-center transition-all cursor-pointer select-none ${
            isOpen ? 'ring-2 ring-primary/20 border-primary text-primary' : ''
          }`}
          title={`Language: ${currentLanguage.name} · Currency: ${selectedCurrency.code}`}
          aria-label="Language and Currency Preferences"
        >
          <Globe className="w-4 h-4" />
        </button>
      )}

      {/* COMPACT FLOATING PREFERENCES CARD */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'top' ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'top' ? -6 : 6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute right-0 ${
              placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            } w-56 z-[99] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-2 overflow-hidden`}
          >
            {/* TOP COMPACT TABS (JUST ICONS + COMPACT LABEL) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('language')}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'language'
                    ? 'bg-white dark:bg-slate-900 text-primary shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Language</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('currency')}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'currency'
                    ? 'bg-white dark:bg-slate-900 text-primary shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Currency</span>
              </button>
            </div>

            {/* TAB CONTENT: LANGUAGE (SIMPLE, NOT BIG, NO REDUNDANT TEXT) */}
            {activeTab === 'language' && (
              <div className="space-y-0.5 pt-0.5">
                {languages.map((lang) => {
                  const isSelected = currentLanguage.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsOpen(false);
                        onCloseParent?.();
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0 leading-none">{lang.flag}</span>
                        <span className="truncate font-semibold">{lang.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Direction Badge */}
                        <span
                          className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${
                            lang.dir === 'rtl'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {lang.dir === 'rtl' ? 'RTL' : 'LTR'}
                        </span>

                        {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: CURRENCY (SIMPLE, COMPACT SINGLE-LINE) */}
            {activeTab === 'currency' && (
              <div className="space-y-0.5 pt-0.5">
                {activeCurrencies.map((curr) => {
                  const isSelected = selectedCurrency.code === curr.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => {
                        setCurrency(curr.code);
                        setIsOpen(false);
                        onCloseParent?.();
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {curr.symbol}
                        </span>
                        <span className="font-bold text-xs">{curr.code}</span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {curr.name}
                        </span>
                      </div>

                      {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
