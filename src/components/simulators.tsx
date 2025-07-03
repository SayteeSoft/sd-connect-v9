
'use client';

import dynamic from 'next/dynamic';

// Dynamically import the simulators with SSR turned off
const MessageSimulator = dynamic(() => import('@/components/message-simulator').then(mod => mod.MessageSimulator), { ssr: false });
const SocialActivitySimulator = dynamic(() => import('@/components/social-activity-simulator').then(mod => mod.SocialActivitySimulator), { ssr: false });

export function Simulators() {
  return (
    <>
      <MessageSimulator />
      <SocialActivitySimulator />
    </>
  );
}
