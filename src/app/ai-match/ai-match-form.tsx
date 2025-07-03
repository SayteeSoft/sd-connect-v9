
'use client';

import { useState, useEffect } from 'react';
import type { Profile } from '@/lib/data';
import { getProfiles } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Eye, Footprints, MessageSquare, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileListItem = ({ profile, onRemove }: { profile: Profile; onRemove: (profileId: number) => void; }) => {
  const router = useRouter();

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/messages');
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(profile.id);
  };
  
  return (
    <Card className="w-full hover:bg-muted/50 transition-colors">
      <CardContent className="flex items-center p-4 gap-4">
        <Avatar className="h-16 w-16 border">
          <AvatarImage src={profile.imageUrl ?? 'https://placehold.co/100x100.png'} alt={profile.name} data-ai-hint={profile.hint} />
          <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">
                {profile.name}, {profile.age}
            </h3>
             {profile.online && (
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{profile.location}</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={handleChat}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRemoveClick} className="hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
            <Trash2 className="h-4 w-4 text-red-500" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


const ProfilesList = ({ profiles, onRemove }: { profiles: Profile[]; onRemove: (profileId: number) => void; }) => {
  if (profiles.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No profiles to display.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {profiles.map((profile) => (
        <ProfileListItem key={profile.id} profile={profile} onRemove={onRemove} />
      ))}
    </div>
  );
};

export function MatchesTabs() {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Profile[]>([]);
  const [visitors, setVisitors] = useState<Profile[]>([]);
  const [viewed, setViewed] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProfiles().then(allProfiles => {
      setFavorites(allProfiles.slice(0, 4));
      setVisitors(allProfiles.slice(4, 8));
      setViewed(allProfiles.slice(8, 12));
      setIsLoading(false);
    });
  }, []);
  
  const handleRemove = (profileId: number, listType: 'favorites' | 'visitors' | 'viewed') => {
    let profileName = '';
    
    if (listType === 'favorites') {
      profileName = favorites.find(p => p.id === profileId)?.name || 'Profile';
      setFavorites(prev => prev.filter(p => p.id !== profileId));
    } else if (listType === 'visitors') {
      profileName = visitors.find(p => p.id === profileId)?.name || 'Profile';
      setVisitors(prev => prev.filter(p => p.id !== profileId));
    } else if (listType === 'viewed') {
      profileName = viewed.find(p => p.id === profileId)?.name || 'Profile';
      setViewed(prev => prev.filter(p => p.id !== profileId));
    }

    setTimeout(() => {
        toast({
          title: "Profile Removed",
          description: `${profileName} has been removed from your ${listType} list.`,
        });
    }, 500);
  };
  
  if (isLoading) {
    return (
        <div className="w-full">
            <div className="grid w-full lg:w-1/3 grid-cols-3 mx-auto gap-1">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
            </div>
            <div className="space-y-3 max-w-3xl mx-auto mt-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    );
  }

  return (
    <Tabs defaultValue="favorites" className="w-full">
      <TabsList className="grid w-full lg:w-1/3 grid-cols-3 mx-auto">
        <TabsTrigger value="favorites">
          <Heart className="mr-2 h-4 w-4" />
          Favorites
        </TabsTrigger>
        <TabsTrigger value="visitors">
          <Footprints className="mr-2 h-4 w-4" />
          Visitors
        </TabsTrigger>
        <TabsTrigger value="viewed">
          <Eye className="mr-2 h-4 w-4" />
          Viewed
        </TabsTrigger>
      </TabsList>
      <TabsContent value="favorites" className="mt-6">
        <ProfilesList profiles={favorites} onRemove={(id) => handleRemove(id, 'favorites')} />
      </TabsContent>
      <TabsContent value="visitors" className="mt-6">
        <ProfilesList profiles={visitors} onRemove={(id) => handleRemove(id, 'visitors')} />
      </TabsContent>
      <TabsContent value="viewed" className="mt-6">
        <ProfilesList profiles={viewed} onRemove={(id) => handleRemove(id, 'viewed')} />
      </TabsContent>
    </Tabs>
  );
}
