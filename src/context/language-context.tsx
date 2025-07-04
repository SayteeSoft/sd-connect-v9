'use client';

import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// Import pre-translated content
import enContent from '@/lib/content/en.json';
import esContent from '@/lib/content/es.json';
import frContent from '@/lib/content/fr.json';
import deContent from '@/lib/content/de.json';


type Language = 'en' | 'es' | 'fr' | 'de'; // English, Spanish, French, German
type LanguageLabel = 'English' | 'Spanish' | 'French' | 'German';

export const languages: { code: Language; label: LanguageLabel }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
];

const contentMap = {
    en: enContent,
    es: esContent,
    fr: frContent,
    de: deContent,
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    content: any; // The structure of the content JSON
    isTranslating: boolean; // Kept for compatibility, but will always be false
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [content, setContent] = useState<any>(enContent);

    const setLanguage = (lang: Language) => {
        if (lang === language) return;
        setLanguageState(lang);
        setContent(contentMap[lang]);
    };

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
