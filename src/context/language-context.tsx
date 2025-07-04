'use client';

import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import siteContent from '@/lib/site-content.json';
import { translateContent, type TranslateContentInput } from '@/ai/flows/translate-content-flow';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

type Language = 'en' | 'es' | 'fr' | 'de'; // English, Spanish, French, German
type LanguageLabel = 'English' | 'Spanish' | 'French' | 'German';

export const languages: { code: Language; label: LanguageLabel }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
];

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    content: any; // The structure of site-content.json
    isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [content, setContent] = useState<any>(siteContent);
    const [isTranslating, setIsTranslating] = useState(false);
    const { toast, dismiss } = useToast();

    const setLanguage = async (lang: Language) => {
        if (lang === language) return;

        setLanguageState(lang);

        if (lang === 'en') {
            setContent(siteContent);
            return;
        }

        try {
            const cachedContent = sessionStorage.getItem(`content_${lang}`);
            if (cachedContent) {
                setContent(JSON.parse(cachedContent));
                return;
            }
        } catch (e) {
            console.error("Could not read from sessionStorage", e);
        }

        setIsTranslating(true);
        const toastId = toast({
            description: (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Translating to {languages.find(l => l.code === lang)?.label}...</span>
              </div>
            ),
            duration: 999999,
        }).id;

        try {
            const input: TranslateContentInput = {
                jsonContent: siteContent,
                targetLanguage: languages.find(l => l.code === lang)?.label as string,
            };
            const translated = await translateContent(input);
            setContent(translated);
            try {
                sessionStorage.setItem(`content_${lang}`, JSON.stringify(translated));
            } catch (e) {
                console.error("Could not write to sessionStorage", e);
            }
            dismiss(toastId);
            toast({
                description: `Translation complete!`,
                duration: 3000
            });
        } catch (error) {
            console.error('Translation failed:', error);
            dismiss(toastId);
            toast({
                variant: 'destructive',
                title: 'Translation Failed',
                description: 'Could not translate the content. Reverting to English.',
            });
            // Revert to English on failure
            setLanguageState('en');
            setContent(siteContent);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, content, isTranslating }}>
            {isTranslating && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Translating...</span>
                    </div>
                </div>
            )}
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
