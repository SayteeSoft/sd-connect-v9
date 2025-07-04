'use client';

import React, { createContext, useState, useContext, type ReactNode, useEffect, useCallback } from 'react';
import { translateContent } from '@/ai/flows/translate-content-flow';
import enContent from '@/lib/content/en.json';

export type Language = 'en' | 'es' | 'fr' | 'de';
type LanguageLabel = 'English' | 'Spanish' | 'French' | 'German';

export const languages: { code: Language; label: LanguageLabel }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
];

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<boolean>;
    content: any;
    isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [content, setContent] = useState<any>(enContent);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedLang = localStorage.getItem('sugarconnect_language') as Language | null;
        if (storedLang && storedLang !== 'en' && languages.some(l => l.code === storedLang)) {
            const cachedContent = sessionStorage.getItem(`sugarconnect_content_${storedLang}`);
            if (cachedContent) {
                setLanguageState(storedLang);
                setContent(JSON.parse(cachedContent));
            } else {
                setLanguage(storedLang);
            }
        } else {
             setLanguageState('en');
             setContent(enContent);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setLanguage = useCallback(async (lang: Language): Promise<boolean> => {
        if (!isMounted || !languages.some(l => l.code === lang)) return false;

        if (lang === 'en') {
            localStorage.setItem('sugarconnect_language', lang);
            setLanguageState(lang);
            setContent(enContent);
            return true;
        }

        const cachedContent = sessionStorage.getItem(`sugarconnect_content_${lang}`);
        if (cachedContent) {
            localStorage.setItem('sugarconnect_language', lang);
            setLanguageState(lang);
            setContent(JSON.parse(cachedContent));
            return true;
        }

        setIsTranslating(true);
        try {
            const targetLanguageLabel = languages.find(l => l.code === lang)?.label;
            if (!targetLanguageLabel) throw new Error("Invalid language selected");

            const translatedContent = await translateContent({
                jsonContent: enContent,
                targetLanguage: targetLanguageLabel,
            });

            sessionStorage.setItem(`sugarconnect_content_${lang}`, JSON.stringify(translatedContent));
            localStorage.setItem('sugarconnect_language', lang);
            setLanguageState(lang);
            setContent(translatedContent);
            return true;
        } catch (error) {
            console.error("AI Translation Error:", error);
            setLanguageState('en');
            setContent(enContent);
            localStorage.setItem('sugarconnect_language', 'en');
            return false;
        } finally {
            setIsTranslating(false);
        }
    }, [isMounted]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, content, isTranslating }}>
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
