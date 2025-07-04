'use client';

import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';

// Import pre-translated content
import enContent from '@/lib/content/en.json';
import esContent from '@/lib/content/es.json';
import frContent from '@/lib/content/fr.json';
import deContent from '@/lib/content/de.json';


export type Language = 'en' | 'es' | 'fr' | 'de'; // English, Spanish, French, German
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
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [content, setContent] = useState<any>(enContent);

    useEffect(() => {
        // This runs on the client and sets the language from localStorage on initial load.
        const storedLang = localStorage.getItem('sugarconnect_language') as Language | null;
        if (storedLang && languages.some(l => l.code === storedLang)) {
            setLanguageState(storedLang);
            setContent(contentMap[storedLang]);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        if (!languages.some(l => l.code === lang)) return;
        
        try {
            // Persist the new language choice to localStorage.
            localStorage.setItem('sugarconnect_language', lang);
            // Update the state to re-render the application with the new content.
            setLanguageState(lang);
            setContent(contentMap[lang]);
        } catch (error) {
            console.error("Failed to set language in localStorage", error);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, content }}>
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
