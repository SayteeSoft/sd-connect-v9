
'use client';

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


const testimonials = [
    {
        quote: "I found a genuine connection here that I never expected. The platform is discreet, easy to use, and full of interesting people. Highly recommended!",
        name: "Jessica",
        role: "Sugar Baby",
        avatar: "https://placehold.co/100x100.png",
        hint: "woman smiling",
    },
    {
        quote: "As a busy professional, I don't have time for traditional dating. SD Connect allowed me to be upfront about my needs and find a wonderful partner who complements my life perfectly.",
        name: "Mark",
        role: "Sugar Daddy",
        avatar: "https://placehold.co/100x100.png",
        hint: "man suit",
    },
    {
        quote: "This site changed my life. I met a mentor who not only supports my goals but also challenges me to be better. It's more than just an arrangement; it's a true partnership.",
        name: "Sophia",
        role: "Sugar Baby",
        avatar: "https://placehold.co/100x100.png",
        hint: "woman graduate",
    },
    {
        quote: "The quality of profiles on SD Connect is unmatched. I've been on other sites, and none compare to the level of ambitious and intelligent individuals I've met here.",
        name: "David",
        role: "Sugar Daddy",
        avatar: "https://placehold.co/100x100.png",
        hint: "man outdoor",
    },
    {
        quote: "I was hesitant at first, but the community is so respectful and focused on transparency. It made me feel safe and empowered to find what I was looking for.",
        name: "Emily",
        role: "Sugar Baby",
        avatar: "https://placehold.co/100x100.png",
        hint: "woman professional",
    }
];


export function Testimonials() {
  const { content: siteContent } = useLanguage();
  
  if (!siteContent) {
    return null;
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
