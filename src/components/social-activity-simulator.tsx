
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/lib/data";
import { getProfiles } from "@/lib/data";
import { Button } from './ui/button';
import { Heart, Footprints } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const socialEvents = [
    { type: 'favorite', text: 'favorited your profile', icon: <Heart className="mr-2 h-4 w-4 text-pink-500 fill-current" /> },
    { type: 'visit', text: 'visited your profile', icon: <Footprints className="mr-2 h-4 w-4 text-[#f5a3f5]" /> },
];

export function SocialActivitySimulator() {
  const { toast, dismiss } = useToast();
  const router = useRouter();
  const { user: currentUser, isLoggedIn } = useAuth();

  useEffect(() => {
    // Only run this simulation on the client when logged in
    if (typeof window === 'undefined' || !isLoggedIn || !currentUser) {
        return;
    }
    
    let timeoutId: NodeJS.Timeout;

    const scheduleRandomEvent = () => {
        // Random delay between 30 and 80 seconds
        const randomDelay = Math.floor(Math.random() * (80000 - 30000 + 1)) + 30000;

        timeoutId = setTimeout(async () => {
            const allProfiles = await getProfiles();
            let potentialActors: Profile[];

            // Users with the opposite role can interact
            if (currentUser.role === 'daddy') {
                potentialActors = allProfiles.filter(p => p.role === 'baby');
            } else { // currentUser.role === 'baby'
                potentialActors = allProfiles.filter(p => p.role === 'daddy' && p.id !== currentUser.id);
            }
            
            if (potentialActors.length === 0) {
                scheduleRandomEvent();
                return;
            };

            const randomActor = potentialActors[Math.floor(Math.random() * potentialActors.length)];
            const randomEvent = socialEvents[Math.floor(Math.random() * socialEvents.length)];

            if (!randomActor) {
                scheduleRandomEvent();
                return;
            };

            const { id: toastId } = toast({
                duration: 10000,
                className: 'p-4',
                children: (
                  <div className="flex items-start gap-4 w-full">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={randomActor.imageUrl ?? 'https://placehold.co/100x100.png'} alt={randomActor.name} data-ai-hint={randomActor.hint} />
                      <AvatarFallback>{randomActor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="font-semibold text-base">{randomActor.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                          {randomEvent.icon}
                          <span className="ml-1">{`just ${randomEvent.text}!`}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                              router.push(`/profile/${randomActor.id}`);
                              dismiss(toastId);
                          }}
                        >
                          View Profile
                        </Button>
                         <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dismiss(toastId)}
                        >
                          Not Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ),
            });

            scheduleRandomEvent();
        }, randomDelay);
    };

    // Start the simulation with an initial delay to not overwhelm the user on login
    const initialDelay = setTimeout(scheduleRandomEvent, 20000);

    return () => {
        clearTimeout(initialDelay);
        clearTimeout(timeoutId);
    };
  }, [toast, router, isLoggedIn, currentUser, dismiss]);

  return null;
}
