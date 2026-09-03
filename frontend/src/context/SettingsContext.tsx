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
}

const DEFAULT_SETTINGS: AppSettings = {
  applicationName: 'RoomAI',
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

    // Dynamic CSS variables injected from Database
    root.style.setProperty('--primary', currentSettings.primaryColor);
    root.style.setProperty('--secondary', currentSettings.secondaryColor);
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
      try {
        let local: Partial<AppSettings> = {};
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('app_settings');
          if (stored) {
            try {
              local = JSON.parse(stored);
            } catch (e) {}
          }
        }

        const res = await fetch(`${API_BASE_URL}/settings`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const fetched = { ...DEFAULT_SETTINGS, ...json.data } as AppSettings;
            setSettings(fetched);
            applyThemeToDOM(fetched);
            if (typeof window !== 'undefined') {
              localStorage.setItem('app_settings', JSON.stringify(fetched));
            }
            return;
          }
        }
        const merged = { ...DEFAULT_SETTINGS, ...local };
        setSettings(merged);
        applyThemeToDOM(merged);
      } catch (err) {
        console.warn('Failed to fetch DB settings, using defaults:', err);
        applyThemeToDOM(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [applyThemeToDOM]);

  // Update Settings API call
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
          const fresh = { ...DEFAULT_SETTINGS, ...json.data } as AppSettings;
          setSettings(fresh);
          if (typeof window !== 'undefined') {
            localStorage.setItem('app_settings', JSON.stringify(fresh));
          }
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.error('Settings DB persist failed:', res.status, errJson.message);
        throw new Error(errJson.message || `Server returned ${res.status} when saving settings.`);
      }
    } catch (err) {
      console.error('Error persisting settings to DB:', err);
      throw err;
    }
  };

  // Toggle Theme (Light <-> Dark)
  const toggleTheme = async () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    await updateSettings({ theme: nextTheme });
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
