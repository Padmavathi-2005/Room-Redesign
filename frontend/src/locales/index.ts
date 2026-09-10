import { en, Translations } from './en';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { hi } from './hi';
import { ar } from './ar';

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  direction: 'Left-to-Right' | 'Right-to-Left';
  isRtl: boolean;
}

/**
 * 3 Primary Global Languages configured as requested:
 * 1. English (LTR)
 * 2. Français (LTR)
 * 3. العربية (RTL with explicit Right-to-Left field)
 */
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    direction: 'Left-to-Right',
    isRtl: false,
  },
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
    direction: 'Left-to-Right',
    isRtl: false,
  },
  {
    code: 'ar',
    name: 'العربية',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
    direction: 'Right-to-Left',
    isRtl: true,
  },
];

export const TRANSLATIONS: Record<string, Translations> = {
  en,
  fr,
  ar,
  es,
  de,
  hi,
};

export { en, es, fr, de, hi, ar };
export type { Translations };
