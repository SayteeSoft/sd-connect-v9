
'use client';

import * as React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/language-context';
import { Toaster } from '@/components/ui/toaster';
import { CookieBanner } from '@/components/cookie-banner';
import { Simulators } from '@/components/simulators';
import { Footer } from './layout/footer';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <LanguageProvider>
        <div className="flex flex-col min-h-screen bg-background">
          {children}
          <Footer />
        </div>
        <Toaster />
        <CookieBanner />
        <Simulators />
      </LanguageProvider>
    </ThemeProvider>
  );
}
