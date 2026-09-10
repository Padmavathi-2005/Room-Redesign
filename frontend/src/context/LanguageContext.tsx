'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageInfo, Translations } from '@/locales';

export type TFunction = ((path: string, params?: Record<string, string | number>) => string) & Translations;

interface LanguageContextType {
  language: string;
  currentLanguage: LanguageInfo;
  languages: LanguageInfo[];
  dir: 'ltr' | 'rtl';
  setLanguage: (code: string) => void;
  t: TFunction;
  translations: Translations;
}

const DEFAULT_LANG = SUPPORTED_LANGUAGES[0]; // English
const defaultT = Object.assign(((path: string) => path) as any, TRANSLATIONS['en']) as TFunction;

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANG.code,
  currentLanguage: DEFAULT_LANG,
  languages: SUPPORTED_LANGUAGES,
  dir: 'ltr',
  setLanguage: () => {},
  t: defaultT,
  translations: TRANSLATIONS['en'],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANG.code);

  // Initialize from localStorage or navigator.language
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('selected_language');
    if (saved) {
      const match = SUPPORTED_LANGUAGES.find((l) => l.code === saved);
      if (match) {
        setLanguageState(match.code);
        return;
      }
    }

    // Auto-detect browser language
    try {
      const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
      const match = SUPPORTED_LANGUAGES.find((l) => l.code === browserLang);
      if (match) {
        setLanguageState(match.code);
      }
    } catch {}
  }, []);

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || DEFAULT_LANG;

  // Update HTML lang and dir attributes dynamically
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = currentLanguage.code;
    document.documentElement.dir = currentLanguage.dir;
  }, [currentLanguage]);

  const setLanguage = useCallback((code: string) => {
    const match = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === code.trim().toLowerCase());
    if (match) {
      setLanguageState(match.code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected_language', match.code);
        window.dispatchEvent(new CustomEvent('language-changed', { detail: match }));
      }
    }
  }, []);

  /**
   * Helper to resolve nested keys like "nav.generate" or "common.save"
   * Falls back to English if the key is missing in the active translation.
   */
  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split('.');
      const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
      const fallbackDict = TRANSLATIONS['en'];

      let result: any = dict;
      for (const k of keys) {
        result = result?.[k];
        if (result === undefined) break;
      }

      // Fallback to English if undefined
      if (result === undefined) {
        let fallbackResult: any = fallbackDict;
        for (const k of keys) {
          fallbackResult = fallbackResult?.[k];
          if (fallbackResult === undefined) break;
        }
        result = fallbackResult;
      }

      if (typeof result !== 'string') {
        return path;
      }

      // Variable interpolation: e.g. "Welcome, {name}"
      if (params) {
        return Object.entries(params).reduce((acc, [key, val]) => {
          return acc.replace(new RegExp(`{${key}}`, 'g'), String(val));
        }, result);
      }

      return result;
    },
    [language]
  );

  const activeDict = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const tWithProps = Object.assign(
    (path: string, params?: Record<string, string | number>) => t(path, params),
    activeDict
  ) as TFunction;

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguage,
        languages: SUPPORTED_LANGUAGES,
        dir: currentLanguage.dir,
        setLanguage,
        t: tWithProps,
        translations: activeDict,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export const useLanguage = useTranslation;
