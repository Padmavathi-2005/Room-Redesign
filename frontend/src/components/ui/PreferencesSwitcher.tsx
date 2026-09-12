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
  variant?: 'icon' | 'pill' | 'split';
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
    <div className={`relative inline-block text-start ${className}`} ref={dropdownRef}>
      {/* TRIGGER BUTTON: SPLIT (MOBILE DRAWER) / PILL (DESKTOP) / ICON (COMPACT) */}
      {variant === 'split' ? (
        <div className="flex items-center gap-1.5" dir="ltr">
          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={() => {
              if (isOpen && activeTab === 'language') {
                setIsOpen(false);
              } else {
                setActiveTab('language');
                setIsOpen(true);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/60 hover:text-primary shadow-2xs text-xs font-semibold transition-all cursor-pointer select-none ${
              isOpen && activeTab === 'language' ? 'ring-2 ring-primary/20 border-primary text-primary' : ''
            }`}
            title={`Language: ${currentLanguage.name}`}
            aria-label="Select Language"
          >
            <span className="text-xs leading-none">{currentLanguage.flag || '🌐'}</span>
            <span className="text-[11px] font-bold tracking-wide" suppressHydrationWarning>
              {currentLanguage.code.toUpperCase()}
            </span>
          </button>

          {/* Currency Switcher Pill */}
          <button
            type="button"
            onClick={() => {
              if (isOpen && activeTab === 'currency') {
                setIsOpen(false);
              } else {
                setActiveTab('currency');
                setIsOpen(true);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/60 hover:text-primary shadow-2xs text-xs font-semibold transition-all cursor-pointer select-none ${
              isOpen && activeTab === 'currency' ? 'ring-2 ring-primary/20 border-primary text-primary' : ''
            }`}
            title={`Currency: ${selectedCurrency.code} (${selectedCurrency.symbol})`}
            aria-label="Select Currency"
          >
            <span className="text-[11px] font-black text-amber-500 dark:text-amber-400">
              {selectedCurrency.symbol}
            </span>
            <span className="text-[11px] font-bold tracking-wide" suppressHydrationWarning>
              {selectedCurrency.code}
            </span>
          </button>
        </div>
      ) : variant === 'pill' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/60 hover:text-primary shadow-2xs text-xs font-semibold transition-all cursor-pointer select-none ${
            isOpen ? 'ring-2 ring-primary/20 border-primary text-primary' : ''
          }`}
          title={`Language: ${currentLanguage.name} · Currency: ${selectedCurrency.code}`}
          aria-label="Language and Currency Preferences"
        >
          <div className="inline-flex items-center gap-1.5" dir="ltr">
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-[11px] font-bold tracking-wide" suppressHydrationWarning>{currentLanguage.code.toUpperCase()}</span>
            <span className="text-slate-300 dark:text-slate-600 text-[10px]">|</span>
            <span className="text-[11px] font-bold tracking-wide" suppressHydrationWarning>{selectedCurrency.code}</span>
          </div>
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
            className={`preferences-popup-card absolute ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto ${
              placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            } w-64 max-w-[calc(100vw-32px)] max-h-[380px] overflow-y-auto z-[9999] bg-white dark:bg-[#0D121F] border border-slate-200/90 dark:border-2 dark:border-[#8B5CF6] rounded-2xl shadow-2xl dark:shadow-[0_0_24px_-2px_rgba(139,92,246,0.4),0_16px_36px_rgba(0,0,0,0.8)] p-2.5 space-y-2 text-start`}
          >
            {/* TOP COMPACT TABS (MODERN SEGMENTED PILL SWITCHER) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/90 dark:bg-[#131929] border border-slate-200/80 dark:border-purple-500/30 rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('language')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'language'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-extrabold dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 dark:text-white dark:border-transparent dark:shadow-[0_0_14px_rgba(139,92,246,0.45)]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 font-semibold'
                }`}
              >
                <Globe className={`w-3.5 h-3.5 transition-colors ${activeTab === 'language' ? 'text-blue-600 dark:text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>Language</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('currency')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'currency'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-extrabold dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 dark:text-white dark:border-transparent dark:shadow-[0_0_14px_rgba(139,92,246,0.45)]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 font-semibold'
                }`}
              >
                <Coins className={`w-3.5 h-3.5 transition-colors ${activeTab === 'currency' ? 'text-blue-600 dark:text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>Currency</span>
              </button>
            </div>

            {/* TAB CONTENT: LANGUAGE (SIMPLE, NOT BIG, NO REDUNDANT TEXT) */}
            {activeTab === 'language' && (
              <div className="space-y-1 pt-0.5">
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
                      className={`w-full text-start px-2.5 py-2 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-primary/10 text-primary dark:bg-purple-500/20 dark:text-purple-200 dark:border dark:border-purple-400/40 font-bold shadow-2xs'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700" dir="ltr">
                          {lang.code.toUpperCase()}
                        </span>
                        <div className="flex flex-col text-start min-w-0">
                          <span className="truncate font-bold text-xs">{lang.name}</span>
                          {lang.nativeName && lang.nativeName !== lang.name && (
                            <span className="text-[10px] text-slate-400 font-medium truncate">{lang.nativeName}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Direction Badge */}
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            lang.dir === 'rtl'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {lang.dir === 'rtl' ? 'RTL' : 'LTR'}
                        </span>

                        {isSelected && <Check className="w-3.5 h-3.5 text-primary dark:text-purple-300 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: CURRENCY (SIMPLE, COMPACT SINGLE-LINE) */}
            {activeTab === 'currency' && (
              <div className="space-y-1 pt-0.5">
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
                      className={`w-full text-start px-2.5 py-2 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-primary/10 text-primary dark:bg-purple-500/20 dark:text-purple-200 dark:border dark:border-purple-400/40 font-bold shadow-2xs'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700">
                          {curr.symbol}
                        </span>
                        <div className="flex flex-col text-start min-w-0">
                          <span className="font-bold text-xs">{curr.code}</span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {curr.name}
                          </span>
                        </div>
                      </div>

                      {isSelected && <Check className="w-3.5 h-3.5 text-primary dark:text-purple-300 shrink-0" />}
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
