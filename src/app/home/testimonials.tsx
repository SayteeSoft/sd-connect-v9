
'use client';

import { useState, useEffect } from "react";
import { getProfiles } from "@/lib/data";
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
import { Skeleton } from "@/components/ui/skeleton";
import siteContent from '@/lib/site-content.json';


const formatRole = (role: 'baby' | 'daddy') => {
  return role === 'baby' ? 'Sugar Baby' : 'Sugar Daddy';
};

const extractQuoteFromBio = (bio?: string) => {
  if (!bio) {
    return "This user has a fantastic profile. I'm excited to connect with them and see where things go!";
  }
  const firstSentence = bio.match(/[^.!?]+[.!?]/);
  return firstSentence ? firstSentence[0] : `"${bio.slice(0, 150)}..."`;
};


export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProfiles().then(allProfiles => {
        const testimonialProfiles = allProfiles.filter(p => p.id !== 1).slice(0, 5);
        
        const generatedTestimonials = testimonialProfiles.map(profile => ({
          quote: extractQuoteFromBio(profile.bio),
          name: profile.name,
          role: formatRole(profile.role),
          avatar: profile.imageUrl,
          hint: profile.hint,
        }));

        setTestimonials(generatedTestimonials);
        setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <section className="bg-secondary py-12 md:pt-12 md:pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-12 text-center font-headline text-3xl font-bold text-primary md:text-4xl">
            {siteContent.testimonials.title}
          </h2>
          <div className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto">
             <div className="flex gap-4">
              <Skeleton className="h-56 w-full basis-full md:basis-1/2 lg:basis-1/3" />
              <Skeleton className="h-56 w-full basis-full hidden md:block md:basis-1/2 lg:basis-1/3" />
              <Skeleton className="h-56 w-full basis-full hidden lg:block lg:basis-1/3" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  
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
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
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
                      <p className="text-muted-foreground italic mb-4 flex-grow">"{testimonial.quote}"</p>
                      <div className="flex items-center mt-auto">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={testimonial.avatar} data-ai-hint={testimonial.hint} alt={testimonial.name} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
