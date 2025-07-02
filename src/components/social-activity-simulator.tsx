
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/lib/data";
import { getProfiles } from "@/lib/data";
import { Button } from './ui/button';
import { Heart, Footprints } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const socialEvents = [
    { type: 'favorite', text: 'favorited your profile', icon: <Heart className="mr-2 h-4 w-4 text-pink-500 fill-current" /> },
    { type: 'visit', text: 'visited your profile', icon: <Footprints className="mr-2 h-4 w-4 text-[#f5a3f5]" /> },
];

export function SocialActivitySimulator() {
  const { toast } = useToast();
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

            toast({
                title: randomActor.name,
                description: (
                    <div className="flex items-center">
                        {randomEvent.icon}
                        <span className="ml-1">{`just ${randomEvent.text}!`}</span>
                    </div>
                ),
                action: (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/profile/${randomActor.id}`)}
                    >
                        View Profile
                    </Button>
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
  }, [toast, router, isLoggedIn, currentUser]);

  return null;
}
