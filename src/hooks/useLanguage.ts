import { useState, useCallback } from 'react';
import { LocalizedString } from '../types/agents';

type Language = 'pt-BR' | 'pt' | 'en';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('pt-BR');

  const changeLanguage = useCallback((language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('olga-language', language);
  }, []);

  const t = useCallback((text: LocalizedString): string => {
    return text[currentLanguage] || text['pt-BR'] || text['en'] || '';
  }, [currentLanguage]);

  const getLanguageFlag = useCallback((lang: Language): string => {
    const flags = {
      'pt-BR': '🇧🇷',
      'pt': '🇵🇹',
      'en': '🇺🇸'
    };
    return flags[lang];
  }, []);

  const getLanguageName = useCallback((lang: Language): string => {
    const names = {
      'pt-BR': 'Português (BR)',
      'pt': 'Português (PT)',
      'en': 'English'
    };
    return names[lang];
  }, []);

  return {
    currentLanguage,
    changeLanguage,
    t,
    getLanguageFlag,
    getLanguageName,
    availableLanguages: ['pt-BR', 'pt', 'en'] as Language[]
  };
};