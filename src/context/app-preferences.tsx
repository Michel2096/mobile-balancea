import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language } from '@/i18n/translations';

type ColorScheme = 'light' | 'dark';

type AppPreferencesContextValue = {
  scheme: ColorScheme;
  isDark: boolean;
  toggleScheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const THEME_KEY = '@balancea/theme';
const LANGUAGE_KEY = '@balancea/language';

const AppPreferencesContext = createContext<AppPreferencesContextValue | undefined>(undefined);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<ColorScheme>('light');
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    (async () => {
      const [storedScheme, storedLanguage] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(LANGUAGE_KEY),
      ]);
      if (storedScheme === 'light' || storedScheme === 'dark') setScheme(storedScheme);
      if (storedLanguage === 'es' || storedLanguage === 'en') setLanguage(storedLanguage);
    })();
  }, []);

  function toggleScheme() {
    setScheme((prev) => {
      const next: ColorScheme = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }

  function toggleLanguage() {
    setLanguage((prev) => {
      const next: Language = prev === 'es' ? 'en' : 'es';
      AsyncStorage.setItem(LANGUAGE_KEY, next);
      return next;
    });
  }

  const t = useMemo(() => {
    const dict = translations[language];
    return (key: string, params?: Record<string, string | number>) => {
      let text = dict[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    };
  }, [language]);

  const value = useMemo(
    () => ({ scheme, isDark: scheme === 'dark', toggleScheme, language, toggleLanguage, t }),
    [scheme, language, t]
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  return ctx;
}
