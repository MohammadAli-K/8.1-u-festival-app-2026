import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { createTranslator, catalogs } from '../i18n/index.js';

const STORAGE_KEY = 'u-festival-lang';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return 'nl';
    const stored =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('u-festival-locale');
    if (stored === 'en' || stored === 'nl') return stored;
    return 'nl';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((/** @type {'nl' | 'en'} */ next) => {
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((l) => (l === 'nl' ? 'en' : 'nl'));
  }, []);

  const t = useMemo(
    () => createTranslator(catalogs[language] ?? catalogs.nl),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLanguage must be used within LangProvider');
  return ctx;
}
