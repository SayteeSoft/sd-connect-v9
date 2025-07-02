
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/lib/data";
import { getProfiles } from "@/lib/data";
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';

const predefinedMessages = [
    "Hey, I was just looking at your profile, I'm really impressed!",
    "Hi there! You have a great smile. 😊",
    "Your profile caught my eye. I'd love to chat sometime.",
    "I'm new here and your profile stood out. Hope you're having a good day!",
    "Wow, you seem like a really interesting person. What are you passionate about?",
    "I love your taste in travel destinations. Where's your next adventure?",
    "Just wanted to say hi and that I think you have a really kind face.",
    "You seem very genuine and kind. I'd be interested in getting to know you.",
    "I'm intrigued by your bio. What's one thing you're looking for in a connection?",
    "Hello! Hope you don't mind me reaching out. Your profile is lovely.",
];

export function MessageSimulator() {
  const { toast } = useToast();
  const router = useRouter();
  const { user: currentUser, isLoggedIn } = useAuth();

  useEffect(() => {
    // Only run this simulation on the client when logged in
    if (typeof window === 'undefined' || !isLoggedIn || !currentUser) {
      return;
    }
    
    let timeoutId: NodeJS.Timeout;

    const scheduleRandomMessage = async () => {
        // Random delay between 25 and 75 seconds
        const randomDelay = Math.floor(Math.random() * (75000 - 25000 + 1)) + 25000;

        timeoutId = setTimeout(async () => {
            const allProfiles = await getProfiles();
            let potentialSenders: Profile[];

            if (currentUser.role === 'daddy') {
                potentialSenders = allProfiles.filter(p => p.role === 'baby');
            } else { // currentUser.role === 'baby'
                potentialSenders = allProfiles.filter(p => p.role === 'daddy' && p.id !== currentUser.id);
            }
            
            if (potentialSenders.length === 0) {
                scheduleRandomMessage(); // Reschedule
                return;
            };
            
            const randomSender = potentialSenders[Math.floor(Math.random() * potentialSenders.length)];
            const randomMessage = predefinedMessages[Math.floor(Math.random() * predefinedMessages.length)];

            if (!randomSender) {
                scheduleRandomMessage(); // Reschedule
                return;
            };

            toast({
                title: `New message from ${randomSender.name}`,
                description: randomMessage,
                action: (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/messages?chatWith=${randomSender.id}`)}
                    >
                        Reply
                    </Button>
                ),
            });

            scheduleRandomMessage(); // Reschedule for the next one
        }, randomDelay);
    };

    // Start the simulation with an initial delay
    const initialDelay = setTimeout(scheduleRandomMessage, 15000);

    return () => {
        clearTimeout(initialDelay);
        clearTimeout(timeoutId);
    };
  }, [toast, router, isLoggedIn, currentUser]);

  return null;
}
