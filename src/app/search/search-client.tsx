
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Profile } from '@/lib/data';
import { getProfiles } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileCard } from '@/components/profile-card';
import { Filter, Sparkles, Wifi, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

const formatHeight = (cm: number) => {
  if (cm === 0) return "N/A";
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
};

const parseHeight = (heightStr: string | undefined): number => {
    if (!heightStr) return 0;
    const feetMatch = heightStr.match(/(\d+)'/);
    const inchesMatch = heightStr.match(/(\d+)"/);
    const feet = feetMatch ? parseInt(feetMatch[1], 10) : 0;
    const inches = inchesMatch ? parseInt(inchesMatch[1], 10) : 0;
    return Math.round((feet * 12 + inches) * 2.54);
};

const defaultFilters = {
    isNew: false,
    isOnline: false,
    withPhoto: true,
    ageRange: [18, 65] as [number, number],
    heightRange: [150, 200] as [number, number],
    location: '',
};

export function SearchClient() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { user: loggedInUser, isLoading: isAuthLoading } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [uiFilters, setUiFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  
  const fetchAllProfiles = useCallback(() => {
    if (!isAuthLoading) {
      setIsDataLoading(true);
      getProfiles().then(profilesData => {
        setProfiles(profilesData);
        setIsDataLoading(false);
      });
    }
  }, [isAuthLoading]);
  
  useEffect(() => {
    fetchAllProfiles();
    window.addEventListener('profileUpdated', fetchAllProfiles);
    return () => {
      window.removeEventListener('profileUpdated', fetchAllProfiles);
    };
  }, [fetchAllProfiles]);
  
  const handleClearFilters = () => {
    setUiFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(uiFilters);
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const profileHeightCm = parseHeight(profile.attributes?.Height);

      // Filter by user criteria
      if (appliedFilters.isOnline && !profile.online) return false;
      if (appliedFilters.isNew && profile.id <= 8) return false; // Mocking "new" profiles
      if (appliedFilters.withPhoto && !profile.imageUrl) return false;
      if (profile.age < appliedFilters.ageRange[0] || profile.age > appliedFilters.ageRange[1]) return false;
      if (profileHeightCm > 0 && (profileHeightCm < appliedFilters.heightRange[0] || profileHeightCm > appliedFilters.heightRange[1])) return false;
      if (appliedFilters.location && !profile.location.toLowerCase().includes(appliedFilters.location.toLowerCase())) return false;
      
      // Filter by platform rules
      if (loggedInUser) {
        // Don't show the logged-in user in search results
        if (profile.id === loggedInUser.id) return false;
        
        // Apply role-based viewing rules (daddy sees baby, baby sees daddy).
        // This will apply to all users, including the admin, based on their profile's role.
        if (loggedInUser.role === 'daddy' && profile.role !== 'baby') return false;
        if (loggedInUser.role === 'baby' && profile.role !== 'daddy') return false;
      }

      return true;
    });
  }, [profiles, appliedFilters, loggedInUser]);

  const isLoading = isAuthLoading || isDataLoading;

  return (
    <div className="grid lg:grid-cols-4 gap-8 items-start">
      {/* Left Sidebar */}
      <aside className="lg:col-span-1 lg:sticky lg:top-24">
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Filter className="w-5 h-5" />
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 space-y-6">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                <Label htmlFor="new-profiles" className="flex items-center gap-2 text-base">
                  <Sparkles className="w-4 h-4 text-primary" /> New
                </Label>
                <Switch id="new-profiles" checked={uiFilters.isNew} onCheckedChange={(c) => setUiFilters(f => ({...f, isNew: c}))}/>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="online-now" className="flex items-center gap-2 text-base">
                  <Wifi className="w-4 h-4 text-primary" /> Online
                </Label>
                <Switch id="online-now" checked={uiFilters.isOnline} onCheckedChange={(c) => setUiFilters(f => ({...f, isOnline: c}))}/>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="with-photo" className="flex items-center gap-2 text-base">
                  <ImageIcon className="w-4 h-4 text-primary" /> With Photo
                </Label>
                <Switch id="with-photo" checked={uiFilters.withPhoto} onCheckedChange={(c) => setUiFilters(f => ({...f, withPhoto: c}))} />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex justify-between items-center text-base">
                <Label>Age Range</Label>
                <span className="text-muted-foreground font-medium">{uiFilters.ageRange[0]} - {uiFilters.ageRange[1]}</span>
              </div>
              <Slider 
                min={18}
                max={65}
                step={1}
                value={uiFilters.ageRange}
                onValueChange={(v) => setUiFilters(f => ({...f, ageRange: v as [number, number]}))}
              />
            </div>
             <Separator />
            <div className="space-y-4">
              <div className="flex justify-between items-center text-base">
                <Label>Height</Label>
                <span className="text-muted-foreground font-medium">
                    {formatHeight(uiFilters.heightRange[0])} - {formatHeight(uiFilters.heightRange[1])}
                </span>
              </div>
              <Slider 
                min={150}
                max={200}
                step={1}
                value={uiFilters.heightRange}
                onValueChange={(v) => setUiFilters(f => ({...f, heightRange: v as [number, number]}))}
              />
            </div>
             <Separator />
             <div className="space-y-2">
                <Label htmlFor="location" className="text-base">Location</Label>
                <Input id="location" placeholder="e.g. London" value={uiFilters.location} onChange={(e) => setUiFilters(f => ({...f, location: e.target.value}))} />
             </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 p-4">
            <Button onClick={handleApplyFilters} className="w-full">Apply Filters</Button>
            <Button onClick={handleClearFilters} variant="ghost" className="w-full">Clear Filters</Button>
          </CardFooter>
        </Card>
      </aside>

      {/* Right Content */}
      <section className="lg:col-span-3">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="rounded-lg aspect-[4/5] w-full" />
              ))}
          </div>
        ) : (
          <>
            <div className="mb-4">
                <h2 className="text-xl font-semibold">{filteredProfiles.length} Profiles found</h2>
            </div>
            {filteredProfiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProfiles.map(profile => (
                    <ProfileCard key={profile.id} profile={profile} loggedInUser={loggedInUser} />
                  ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center bg-card p-10 rounded-lg border">
                    <h3 className="text-xl font-semibold">No Profiles Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters to find more results.</p>
                </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
