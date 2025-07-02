
'use client';

import { useState, useEffect } from "react";
import type { Profile } from "@/lib/data";
import { getProfiles } from "@/lib/data";
import { ProfileCard } from "@/components/profile-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export function FeaturedProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { user: loggedInUser, isLoading, isLoggedIn } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    getProfiles().then(profilesData => {
        if (Array.isArray(profilesData)) {
            setProfiles(profilesData);
        }
        setIsDataLoading(false);
    })
  }, []);

  const isComponentLoading = isLoading || isDataLoading;

  const displayedProfiles = isComponentLoading ? [] : profiles
    .filter(profile => {
      // Don't show the admin account on the homepage
      if (profile.id === 1) return false;
      
      if (loggedInUser) {
        // Don't show the user their own profile on the homepage
        if (profile.id === loggedInUser.id) {
          return false;
        }
        // If logged in, show opposite roles. This now applies to the admin as well.
        if (profile.role === loggedInUser.role) {
          return false;
        }
      }
      return true;
    })
    .slice(0, 4);

  return (
    <section className="bg-background py-12 md:pt-12 md:pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-8 text-center font-headline text-3xl font-bold text-primary md:text-4xl">
          Featured Profiles
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isComponentLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="rounded-lg aspect-[4/5] w-full" />
            ))
          ) : (
            displayedProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} loggedInUser={loggedInUser} isLoggedIn={isLoggedIn} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
