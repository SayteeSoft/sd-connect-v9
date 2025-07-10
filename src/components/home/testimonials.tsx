
'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/context/language-context";
import type { Profile } from "@/lib/data";
import { getProfiles } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";


const testimonialProfileIds = [1, 2, 4, 3, 8]; // Admin, Darianna, Mark, Kateryna, Richard

export function Testimonials() {
  const { content: siteContent } = useLanguage();
  const [testimonials, setTestimonials] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonialProfiles = async () => {
      setIsLoading(true);
      try {
        const allProfiles = await getProfiles();
        const testimonialProfiles = allProfiles
          .filter(p => testimonialProfileIds.includes(p.id))
          .sort((a, b) => testimonialProfileIds.indexOf(a.id) - testimonialProfileIds.indexOf(b.id));
        setTestimonials(testimonialProfiles);
      } catch (error) {
        console.error("Failed to fetch profiles for testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonialProfiles();
  }, []);
  
  if (!siteContent) {
    return null;
  }
  
  const TestimonialSkeleton = () => (
    <div className="p-1 h-full">
        <Card className="flex flex-col h-full">
            <CardContent className="flex flex-col p-6 flex-grow">
                <Skeleton className="h-5 w-28 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center mt-auto">
                    <Skeleton className="h-12 w-12 rounded-full mr-4" />
                    <div className="w-full">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <section className="bg-secondary py-12 md:pt-12 md:pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-12 text-center font-headline text-3xl font-bold text-primary md:text-4xl">
          {siteContent.testimonials.title}
        </h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <TestimonialSkeleton />
                    </CarouselItem>
                ))
            ) : (
                testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                    <Card className="flex flex-col h-full">
                        <CardContent className="flex flex-col p-6 flex-grow">
                        <div className="flex gap-0.5 mb-2">
                            <Star className="w-5 h-5 text-primary fill-primary" />
                            <Star className="w-5 h-5 text-primary fill-primary" />
                            <Star className="w-5 h-5 text-primary fill-primary" />
                            <Star className="w-5 h-5 text-primary fill-primary" />
                            <Star className="w-5 h-5 text-primary fill-primary" />
                        </div>
                        <p className="text-muted-foreground italic mb-4 flex-grow">"{testimonial.bio}"</p>
                        <div className="flex items-center mt-auto">
                            <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={testimonial.imageUrl} data-ai-hint={testimonial.hint} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{testimonial.role === 'daddy' ? 'Sugar Daddy' : 'Sugar Baby'}</p>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    </div>
                </CarouselItem>
                ))
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
