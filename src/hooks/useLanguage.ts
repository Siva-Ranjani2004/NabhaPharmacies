import { useState, useEffect, createContext, useContext } from 'react';

type Language = 'en' | 'hi' | 'pa';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export function useLanguageProvider() {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('nabha-language') as Language;
    if (saved && ['en', 'hi', 'pa'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nabha-language', lang);
    document.documentElement.lang = lang;
  };

  return {
    language,
    setLanguage
  };
}

export { LanguageContext };