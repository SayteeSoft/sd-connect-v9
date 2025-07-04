'use client';
import { useLanguage } from '@/context/language-context';

export function WhatIsSugarRelationship() {
  const { content: siteContent } = useLanguage();
  if (!siteContent) return null;

  const { title, paragraph } = siteContent.whatIsSugarRelationship;

  return (
    <section className="bg-background py-12 md:pt-12 md:pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 font-headline text-3xl font-bold text-primary md:text-4xl">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {paragraph}
          </p>
        </div>
      </div>
    </section>
  );
}
