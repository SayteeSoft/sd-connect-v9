'use client';

import React, { createContext, useState, useContext, type ReactNode, useEffect, useCallback } from 'react';

// Import all language files directly
import enContent from '@/lib/content/en.json';
import esContent from '@/lib/content/es.json';
import frContent from '@/lib/content/fr.json';
import deContent from '@/lib/content/de.json';

export type Language = 'en' | 'es' | 'fr' | 'de';
type LanguageLabel = 'English' | 'Spanish' | 'French' | 'German';

export const languages: { code: Language; label: LanguageLabel }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
];

// Map language codes to their content
const contentMap = {
    en: enContent,
    es: esContent,
    fr: frContent,
    de: deContent,
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => boolean; // No longer async
    content: any;
    isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [content, setContent] = useState<any>(enContent);

    // This effect runs once on mount to load the user's preference from localStorage
    useEffect(() => {
        const storedLang = localStorage.getItem('sugarconnect_language') as Language | null;
        if (storedLang && languages.some(l => l.code === storedLang)) {
            setLanguageState(storedLang);
            setContent(contentMap[storedLang]);
        }
    }, []);

    const setLanguage = useCallback((lang: Language): boolean => {
        if (!languages.some(l => l.code === lang)) return false;

        localStorage.setItem('sugarconnect_language', lang);
        setLanguageState(lang);
        setContent(contentMap[lang]);
        return true;
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, content, isTranslating: false }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
