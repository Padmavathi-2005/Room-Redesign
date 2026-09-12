import { en, Translations } from './en';
import { fr } from './fr';
import { ar } from './ar';
import { hi } from './hi';

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
 * 4 Primary Languages:
 * 1. English (LTR)
 * 2. العربية / Arabic (RTL)
 * 3. Français / French (LTR)
 * 4. हिन्दी / Hindi (LTR)
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
    code: 'ar',
    name: 'العربية',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
    direction: 'Right-to-Left',
    isRtl: true,
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
    code: 'hi',
    name: 'हिन्दी',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    dir: 'ltr',
    direction: 'Left-to-Right',
    isRtl: false,
  },
];

export const TRANSLATIONS: Record<string, Translations> = {
  en,
  ar,
  fr,
  hi,
};

export { en, ar, fr, hi };
export type { Translations };
