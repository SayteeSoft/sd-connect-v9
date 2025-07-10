
'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Profile } from "@/lib/data";
import { getProfiles } from "@/lib/data";
import { ProfileCard } from "@/components/profile-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

// Define specific IDs for curated featured profiles
const featuredBabyIds = [2, 3, 5, 7]; // Darianna, Kateryna, Sofia, Vanessa
const featuredDaddyIds = [4, 6, 8, 10]; // Mark, James, Richard, William

export function FeaturedProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { user: loggedInUser, isLoading: isAuthLoading, isLoggedIn } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(true);

  const fetchAllProfiles = useCallback(() => {
    setIsDataLoading(true);
    getProfiles().then(profilesData => {
        if (Array.isArray(profilesData)) {
            setProfiles(profilesData);
        }
        setIsDataLoading(false);
    }).catch(() => setIsDataLoading(false));
  }, []);

  useEffect(() => {
    fetchAllProfiles();
    window.addEventListener('profileUpdated', fetchAllProfiles);
    return () => {
      window.removeEventListener('profileUpdated', fetchAllProfiles);
    };
  }, [fetchAllProfiles]);

  const isComponentLoading = isAuthLoading || isDataLoading;

  const displayedProfiles = useMemo(() => {
    if (!profiles.length) return [];

    let relevantIds: number[];

    if (!isLoggedIn) {
      // If logged out, default to showing featured 'baby' profiles.
      relevantIds = featuredBabyIds;
    } else if (loggedInUser) {
      // If logged in as a 'daddy', show featured 'babies'.
      if (loggedInUser.role === 'daddy') {
        relevantIds = featuredBabyIds;
      }
      // If logged in as a 'baby', show featured 'daddies'.
      else {
        relevantIds = featuredDaddyIds;
      }
    } else {
        // Fallback for when isLoggedIn is false, or user object isn't available yet
        relevantIds = featuredBabyIds;
    }
    
    return profiles
      .filter(profile => relevantIds.includes(profile.id))
      // Ensure the order is consistent with the defined IDs
      .sort((a, b) => relevantIds.indexOf(a.id) - relevantIds.indexOf(b.id));

  }, [isLoggedIn, loggedInUser, profiles]);


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
