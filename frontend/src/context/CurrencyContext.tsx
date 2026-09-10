'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Currency {
  _id?: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
  position: 'prefix' | 'suffix';
  decimalPlaces: number;
}

export interface CurrencyContextType {
  currencies: Currency[];
  selectedCurrency: Currency;
  defaultCurrency: Currency;
  isLoading: boolean;
  setCurrency: (code: string) => void;
  formatPrice: (
    amountInBase: number,
    options?: {
      showDecimals?: boolean;
      forceCode?: boolean;
      customRate?: number;
    }
  ) => string;
  convertPrice: (amountInBase: number) => number;
  refreshCurrencies: () => Promise<void>;
}

const FALLBACK_CURRENCIES: Currency[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    exchangeRate: 1.0,
    isDefault: true,
    isActive: true,
    position: 'prefix',
    decimalPlaces: 2,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    exchangeRate: 0.92,
    isDefault: false,
    isActive: true,
    position: 'suffix',
    decimalPlaces: 2,
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    exchangeRate: 83.5,
    isDefault: false,
    isActive: true,
    position: 'prefix',
    decimalPlaces: 2,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    exchangeRate: 0.79,
    isDefault: false,
    isActive: true,
    position: 'prefix',
    decimalPlaces: 2,
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    exchangeRate: 1.36,
    isDefault: false,
    isActive: true,
    position: 'prefix',
    decimalPlaces: 2,
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'AU$',
    exchangeRate: 1.52,
    isDefault: false,
    isActive: true,
    position: 'prefix',
    decimalPlaces: 2,
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    exchangeRate: 155.0,
    isDefault: false,
    isActive: true,
    position: 'prefix',
    decimalPlaces: 0,
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    exchangeRate: 3.67,
    isDefault: false,
    isActive: true,
    position: 'prefix',
    decimalPlaces: 2,
  },
];

const DEFAULT_CURRENCY = FALLBACK_CURRENCIES[0];

const CurrencyContext = createContext<CurrencyContextType>({
  currencies: FALLBACK_CURRENCIES,
  selectedCurrency: DEFAULT_CURRENCY,
  defaultCurrency: DEFAULT_CURRENCY,
  isLoading: false,
  setCurrency: () => {},
  formatPrice: (amount) => `$${amount.toFixed(2)}`,
  convertPrice: (amount) => amount,
  refreshCurrencies: async () => {},
});

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const cleanUrl = envUrl.replace(/\/$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>(FALLBACK_CURRENCIES);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrencies = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/currencies`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        const activeList: Currency[] = json?.data?.currencies || [];
        const baseDef: Currency = json?.data?.defaultCurrency || activeList.find((c) => c.isDefault) || FALLBACK_CURRENCIES[0];

        if (activeList.length > 0) {
          setCurrencies(activeList);
          setDefaultCurrency(baseDef);

          // Check if user previously saved a currency preference
          const savedCode = typeof window !== 'undefined' ? localStorage.getItem('selected_currency') : null;
          if (savedCode) {
            const found = activeList.find((c) => c.code.toUpperCase() === savedCode.toUpperCase());
            if (found) {
              setSelectedCurrency(found);
              return;
            }
          }
          // Default to the system's base currency if no saved pref
          setSelectedCurrency((prev) => {
            const match = activeList.find((c) => c.code === prev.code);
            return match || baseDef;
          });
        }
      }
    } catch (err) {
      console.warn('Could not load currencies from backend, using fallback list:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const setCurrency = useCallback(
    (code: string) => {
      const target = currencies.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
      if (target) {
        setSelectedCurrency(target);
        if (typeof window !== 'undefined') {
          localStorage.setItem('selected_currency', target.code);
          window.dispatchEvent(new CustomEvent('currency-changed', { detail: target }));
        }
      }
    },
    [currencies]
  );

  const convertPrice = useCallback(
    (amountInBase: number): number => {
      if (typeof amountInBase !== 'number' || isNaN(amountInBase)) return 0;
      const baseRate = defaultCurrency?.exchangeRate || 1.0;
      const targetRate = selectedCurrency?.exchangeRate || 1.0;
      return (amountInBase / baseRate) * targetRate;
    },
    [defaultCurrency, selectedCurrency]
  );

  const formatPrice = useCallback(
    (
      amountInBase: number,
      options?: {
        showDecimals?: boolean;
        forceCode?: boolean;
        customRate?: number;
      }
    ): string => {
      if (typeof amountInBase !== 'number' || isNaN(amountInBase)) return '$0.00';

      const rate = options?.customRate ?? (selectedCurrency?.exchangeRate || 1.0);
      const baseRate = defaultCurrency?.exchangeRate || 1.0;
      const converted = (amountInBase / baseRate) * rate;

      const decimals =
        options?.showDecimals === false
          ? 0
          : selectedCurrency.decimalPlaces !== undefined
          ? selectedCurrency.decimalPlaces
          : 2;

      // Format number with thousands separators
      const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(converted);

      const symbol = selectedCurrency?.symbol || '$';
      const isSuffix = selectedCurrency?.position === 'suffix';

      if (options?.forceCode) {
        return `${symbol}${formattedNumber} ${selectedCurrency.code}`;
      }

      return isSuffix ? `${formattedNumber} ${symbol}` : `${symbol}${formattedNumber}`;
    },
    [defaultCurrency, selectedCurrency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        selectedCurrency,
        defaultCurrency,
        isLoading,
        setCurrency,
        formatPrice,
        convertPrice,
        refreshCurrencies: fetchCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
