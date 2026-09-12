'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface TaxSetting {
  id: string;
  name: string;
  rate: number;
  enabled: boolean;
}

export interface AppSettings {
  applicationName: string;
  siteUrl?: string;
  supportEmail?: string;
  theme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  glassOpacity: number;
  blurStrength: number;
  logo?: string;
  favicon?: string;
  maintenanceMode: boolean;
  creditsPerGeneration: number;
  tablePaginationLimit: number;
  activeTheme?: 'light' | 'dark';
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalSecretKey: string;
  taxes: TaxSetting[];
  homepageSections?: Record<string, any>;
}

export const DEFAULT_HOMEPAGE_SECTIONS: Record<string, any> = {
  hero: {
    translations: {
      en: {
        badge: 'Trusted Construction ERP',
        title: 'Build Better. Manage Smarter. Deliver Faster.',
        subtitle: 'The only digital craftsmanship platform designed to unite your field and office. Seamlessly manage budgets, logistics, and labor in one high-performance interface.',
        primaryCta: 'Start Free Trial',
        secondaryCta: 'Book a Demo',
      },
      ar: {
        badge: 'نظام معتمد لإدارة وتصميم الإنشاءات',
        title: 'ابنِ بشكل أفضل. أدر بذكاء أكبر. سلّم بشكل أسرع.',
        subtitle: 'المنصة الحرفية الرقمية الوحيدة المصممة لتوحيد موقع العمل والمكتب. أدر الميزانيات والخدمات اللوجستية والعمالة بسلاسة في واجهة واحدة عالية الأداء.',
        primaryCta: 'ابدأ التجربة المجانية',
        secondaryCta: 'احجز عرضاً توضيحياً',
      },
      fr: {
        badge: 'ERP de Construction de Confiance',
        title: 'Construisez Mieux. Gérez Plus Intelligemment. Livrez Plus Vite.',
        subtitle: 'La seule plateforme artisanale numérique conçue pour unifier votre chantier et vos bureaux.',
        primaryCta: 'Essai Gratuit',
        secondaryCta: 'Réserver une Démo',
      },
      hi: {
        badge: 'भरोसेमंद निर्माण ईआरपी',
        title: 'बेहतर निर्माण करें। स्मार्ट प्रबंधन करें। तेज़ी से पूरा करें।',
        subtitle: 'फील्ड और ऑफिस को जोड़ने वाला संपूर्ण डिजिटल आर्किटेक्चरल प्लेटफॉर्म।',
        primaryCta: 'मुफ़्त परीक्षण शुरू करें',
        secondaryCta: 'डेमो बुक करें',
      },
    },
  },
  video: {
    translations: {
      en: {
        badge: 'Platform Demonstration',
        title: 'Experience the Power of RoomAI',
        subtitle: 'Watch how our AI-driven design studio transforms ordinary spatial concepts into high-end architectural reality in seconds.',
      },
      ar: {
        badge: 'عرض توضيحي للمنصة',
        title: 'اختبر قوة منصة RoomAI',
        subtitle: 'شاهد كيف يحول استوديو التصميم المدعوم بالذكاء الاصطناعي المفاهيم المكانية العادية إلى واقع معماري راقٍ في ثوانٍ.',
      },
    },
  },
  whyChoose: {
    translations: {
      en: {
        badge: 'Core Advantages',
        title: 'Why Choose RoomAI for Your Spaces',
        subtitle: 'Architectural precision meets cutting-edge generative AI, delivering professional render fidelity in seconds.',
      },
      ar: {
        badge: 'المزايا الجوهرية',
        title: 'لماذا تختار RoomAI لتصميم مساحاتك',
        subtitle: 'الدقة المعمارية تلتقي بأحدث تقنيات الذكاء الاصطناعي التوليدي لتقديم تصاميم فائقة الجودة في ثوانٍ.',
      },
    },
  },
  whoBenefits: {
    translations: {
      en: {
        badge: 'Target Audiences',
        title: 'Who Benefits From Our Digital Platform',
        subtitle: 'Empowering interior designers, architects, real estate developers, and homeowners with photorealistic visualization tools.',
      },
      ar: {
        badge: 'لمن صُممت المنصة',
        title: 'من يستفيد من منصتنا الرقمية',
        subtitle: 'تمكين مصممي الديكور الداخلي والمهندسين المعماريين والمطورين العقاريين وأصحاب المنازل بأدوات تصوير واقعية مذهلة.',
      },
    },
  },
  exploreTools: {
    translations: {
      en: {
        badge: 'AI Studio Suite',
        title: 'Explore Powerful Architectural Redesign Tools',
        subtitle: 'From interior revamps to exterior transformations, explore our suite of intelligent redesign tools tailored to your spatial needs.',
      },
      ar: {
        badge: 'مجموعة أدوات استوديو الذكاء الاصطناعي',
        title: 'استكشف أدوات إعادة التصميم المعماري القوية',
        subtitle: 'من التجديدات الداخلية إلى التحولات الخارجية، استكشف أدوات إعادة التصميم الذكية المصممة خصيصاً لاحتياجاتك المكانية.',
      },
    },
  },
  howItWorks: {
    translations: {
      en: {
        badge: 'Workflow',
        title: 'How It Works in 3 Simple Steps',
        subtitle: 'Transform any space with photorealistic precision effortlessly.',
      },
      ar: {
        badge: 'طريقة العمل',
        title: 'كيف يعمل في 3 خطوات بسيطة',
        subtitle: 'حوّل أي مساحة بدقة واقعية فائقة بكل سهولة.',
      },
    },
  },
  ctaBanner: {
    translations: {
      en: {
        badge: 'Start Your Journey',
        title: 'Start Smarter Home Design with RoomAI Today',
        subtitle: 'Join thousands of designers, architects, and homeowners elevating spatial concepts into photorealistic reality.',
        primaryCta: 'Get Started Free',
      },
      ar: {
        badge: 'ابدأ رحلتك الآن',
        title: 'ابدأ تصميماً أذكى لمنزلك مع RoomAI اليوم',
        subtitle: 'انضم إلى آلاف المصممين والمهندسين وأصحاب المنازل الذين يحولون الأفكار المكانية إلى واقع ملموس بدقة فائقة.',
        primaryCta: 'ابدأ مجاناً الآن',
      },
    },
  },
};

const DEFAULT_SETTINGS: AppSettings = {
  applicationName: 'RoomAI',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  supportEmail: 'support@roomai.com',
  theme: 'light',
  primaryColor: '#1D4ED8',
  secondaryColor: '#7C3AED',
  accentColor: '#06B6D4',
  backgroundColor: '#FFFFFF',
  textColor: '#111827',
  borderRadius: 16,
  glassOpacity: 0.7,
  blurStrength: 20,
  maintenanceMode: false,
  creditsPerGeneration: 1,
  tablePaginationLimit: 10,
  stripeEnabled: true,
  stripePublishableKey: 'pk_test_51OuCU4HSqjDEGS2ZVpMCwum53GzzcuJ3XuAxJHgeJaFdG6XvU10VyfCnpzdEQu4JdefyoegMTUZXh8sB3fHiMJQY',
  stripeSecretKey: 'sk_test_51OuCU4HSqjDEGS2ZSecretKeyMock123',
  paypalEnabled: true,
  paypalClientId: 'client_id_roomai_paypal_123',
  paypalSecretKey: 'secret_key_roomai_paypal_123',
  taxes: [
    { id: 'tax-vat', name: 'VAT (Sales Tax)', rate: 0, enabled: false },
  ],
  homepageSections: DEFAULT_HOMEPAGE_SECTIONS,
};

interface SettingsContextType {
  settings: AppSettings;
  isLoading: boolean;
  toggleTheme: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  toggleTheme: async () => {},
  updateSettings: async () => {},
});

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const cleanUrl = envUrl.replace(/\/$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};
const API_BASE_URL = getApiBaseUrl();

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Apply CSS Variables to :root DOM element dynamically
  const applyThemeToDOM = useCallback((currentSettings: AppSettings) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const isDark = currentSettings.theme === 'dark';

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // In dark theme, secondary color becomes primary color, and primary color shifts to secondary
    const effectivePrimary = isDark ? currentSettings.secondaryColor : currentSettings.primaryColor;
    const effectiveSecondary = isDark ? currentSettings.primaryColor : currentSettings.secondaryColor;

    // Dynamic CSS variables injected from Database
    root.style.setProperty('--primary', effectivePrimary);
    root.style.setProperty('--secondary', effectiveSecondary);
    root.style.setProperty(
      '--secondary-lite',
      `color-mix(in srgb, ${effectiveSecondary} 14%, transparent)`
    );
    root.style.setProperty('--accent', currentSettings.accentColor);
    root.style.setProperty(
      '--background',
      isDark ? '#0F172A' : currentSettings.backgroundColor
    );
    root.style.setProperty(
      '--text',
      isDark ? '#FFFFFF' : currentSettings.textColor
    );
    root.style.setProperty('--radius', `${currentSettings.borderRadius}px`);
    root.style.setProperty('--glass-opacity', `${currentSettings.glassOpacity}`);
    root.style.setProperty('--blur-strength', `${currentSettings.blurStrength}px`);
  }, []);

  // Fetch initial settings from DB API on startup
  useEffect(() => {
    async function fetchSettings() {
      // Read locally saved theme FIRST — user's personal preference takes priority
      let localTheme: 'light' | 'dark' | null = null;
      let local: Partial<AppSettings> = {};
      if (typeof window !== 'undefined') {
        // Per-user theme stored separately from global DB settings
        const savedTheme = localStorage.getItem('user_theme_preference');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          localTheme = savedTheme;
        }
        const stored = localStorage.getItem('app_settings');
        if (stored) {
          try { local = JSON.parse(stored); } catch (e) {}
        }
      }

      try {
        const res = await fetch(`${API_BASE_URL}/settings`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            // Merge: user's local theme preference wins over global DB default
            const fetched = {
              ...DEFAULT_SETTINGS,
              ...json.data,
              ...(localTheme ? { theme: localTheme } : {}),
            } as AppSettings;
            setSettings(fetched);
            applyThemeToDOM(fetched);
            if (typeof window !== 'undefined') {
              localStorage.setItem('app_settings', JSON.stringify(fetched));
            }
            return;
          }
        }
        // Fallback: local cache + user theme preference
        const merged = {
          ...DEFAULT_SETTINGS,
          ...local,
          ...(localTheme ? { theme: localTheme } : {}),
        };
        setSettings(merged);
        applyThemeToDOM(merged);
      } catch (err) {
        console.warn('Failed to fetch DB settings, using defaults:', err);
        const fallback = { ...DEFAULT_SETTINGS, ...(localTheme ? { theme: localTheme } : {}) };
        setSettings(fallback);
        applyThemeToDOM(fallback);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [applyThemeToDOM]);

  // Update Settings API call (for admin settings panel — does NOT touch user theme)
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    applyThemeToDOM(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('app_settings', JSON.stringify(updated));
    }

    try {
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('admin_token') || localStorage.getItem('token'))
        : null;

      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newSettings),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // Preserve user's locally chosen theme — don't let DB overwrite it
          const userTheme = typeof window !== 'undefined'
            ? (localStorage.getItem('user_theme_preference') as 'light' | 'dark' | null)
            : null;
          const fresh = {
            ...DEFAULT_SETTINGS,
            ...json.data,
            ...(userTheme ? { theme: userTheme } : {}),
          } as AppSettings;
          setSettings(fresh);
          applyThemeToDOM(fresh);
          if (typeof window !== 'undefined') {
            localStorage.setItem('app_settings', JSON.stringify(fresh));
          }
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn('Settings DB persist skipped/failed:', res.status, errJson.message);
        if (res.status === 401 && typeof window !== 'undefined') {
          // If token expired/invalid, clear token and notify session listeners
          localStorage.removeItem('admin_token');
          window.dispatchEvent(new Event('user-logged-out'));
        }
      }
    } catch (err) {
      console.warn('Could not persist settings to server, settings applied locally:', err);
    }
  };

  // Toggle Theme (Light <-> Dark)
  // LOCAL-FIRST: Instantly updates state + DOM + localStorage.
  // Saved in a dedicated 'user_theme_preference' key so it is NEVER overwritten by DB sync.
  const toggleTheme = async () => {
    const nextTheme: 'light' | 'dark' = settings.theme === 'light' ? 'dark' : 'light';

    // 1. Update local state & DOM immediately — no API wait
    const updated: AppSettings = { ...settings, theme: nextTheme };
    setSettings(updated);
    applyThemeToDOM(updated);

    // 2. Persist user's theme preference separately so fetchSettings can restore it
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_theme_preference', nextTheme);
      localStorage.setItem('app_settings', JSON.stringify(updated));
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, toggleTheme, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

/**
 * Helper to retrieve dynamic homepage section content with graceful multi-tier fallbacks:
 * 1. Current language translation in DB
 * 2. English translation in DB
 * 3. Hardcoded fallback passed by the component
 */
export function getHomepageText(
  settings: AppSettings | undefined | null,
  sectionKey: string,
  fieldKey: string,
  currentLanguage: string,
  fallback: string
): string {
  if (!settings?.homepageSections) return fallback;
  const section = settings.homepageSections[sectionKey];
  if (!section?.translations) return fallback;

  // 1. Check current language
  const langVal = section.translations[currentLanguage]?.[fieldKey];
  if (langVal && typeof langVal === 'string' && langVal.trim().length > 0) {
    return langVal;
  }

  // 2. Check English fallback in DB
  const enVal = section.translations['en']?.[fieldKey];
  if (enVal && typeof enVal === 'string' && enVal.trim().length > 0) {
    return enVal;
  }

  // 3. Built-in hardcoded fallback
  return fallback;
}
