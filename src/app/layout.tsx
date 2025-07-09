
import type {Metadata} from 'next';
import './globals.css';
import { Alegreya, Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ClientProviders } from '@/components/client-providers';


export const metadata: Metadata = {
  title: 'SD Connect',
  description: 'An exclusive platform for ambitious and attractive individuals',
};

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontAlegreya = Alegreya({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-alegreya',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💖</text></svg>" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💖</text></svg>" />
        <link
          rel="preload"
          href="https://web-developer.one/imgs/sugar-daddy-002.jpg"
          as="image"
        />
      </head>
      <body
        className={cn(
          'font-body antialiased',
          fontInter.variable,
          fontAlegreya.variable
        )}
      >
        <ClientProviders>
            {children}
        </ClientProviders>
      </body>
    </html>
  );
}
