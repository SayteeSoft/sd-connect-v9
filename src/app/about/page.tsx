'use client';

import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';

export default function AboutUsPage() {
  const { content: siteContent } = useLanguage();
  
  if (!siteContent) return null; // Or a loading skeleton

  const { title, subtitle, mainParagraph, sections, cta } = siteContent.aboutPage;

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="font-headline text-2xl font-semibold text-foreground mt-8 mb-4">{children}</h2>
  );

  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <p className="text-muted-foreground mb-4 leading-relaxed">{children}</p>
  );

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl text-primary">
              {title}
            </CardTitle>
            <p className="text-xl text-muted-foreground mt-2">
              {subtitle}
            </p>
          </CardHeader>
          <CardContent className="max-w-3xl mx-auto">
            <Paragraph>
              {mainParagraph}
            </Paragraph>

            {sections.map((section: any) => (
              <div key={section.title}>
                <SectionTitle>{section.title}</SectionTitle>
                {section.content && <Paragraph>{section.content}</Paragraph>}
                {section.subsections && section.subsections.map((sub: any) => (
                   <div key={sub.title}>
                     <h3 className="font-semibold text-lg mt-4 mb-2">{sub.title}</h3>
                     <Paragraph>{sub.content}</Paragraph>
                   </div>
                ))}
              </div>
            ))}
            
            <div className="text-center mt-10 border-t pt-8">
                <h3 className="font-headline text-3xl text-primary">{cta.title}</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                    {cta.subtitle}
                </p>
                <Button asChild size="lg">
                    <Link href="/signup">
                        <Heart className="mr-2 h-5 w-5" />
                        {cta.buttonText}
                    </Link>
                </Button>
            </div>

          </CardContent>
        </Card>
      </main>
    </>
  );
}
