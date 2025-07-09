
'use client';

import Image from "next/image";
import Link from "next/link";
import type { Profile } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, Trash2, Heart, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/use-user-lists";

interface ProfileCardProps {
  profile: Profile;
  onRemove?: (profileId: number) => void;
  loggedInUser?: Profile;
  isLoggedIn?: boolean;
}

export function ProfileCard({ profile, onRemove, loggedInUser, isLoggedIn = true }: ProfileCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isItemInList, toggleItem: toggleFavorite } = useFavorites();
  const canChat = loggedInUser && loggedInUser.role !== profile.role;
  const isFavorited = isItemInList(profile.id);

  const handleChat = () => {
    router.push(`/messages?chatWith=${profile.id}`);
  };

  const handleFavorite = () => {
    toggleFavorite(profile.id);
    toast({
      title: !isFavorited ? 'Added to Favorites' : 'Removed from Favorites',
      description: `${profile.name} has been updated in your favorites.`,
    });
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(profile.id);
    }
  };

  return (
    <Link href={isLoggedIn ? `/profile/${profile.id}` : '/signup'} className="block">
      <Card className="group overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:-translate-y-2">
        <div className="relative aspect-square w-full">
          <Image
            src={profile.imageUrl ?? 'https://placehold.co/600x600.png'}
            alt={`Profile of ${profile.name}`}
            data-ai-hint={profile.hint}
            width={600}
            height={600}
            className={cn(
              "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
              !isLoggedIn && "blur-sm"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {isLoggedIn && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 border-none text-white"
                      onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canChat && (
                    <DropdownMenuItem onSelect={handleChat}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Chat</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={handleFavorite}>
                    <Heart className={cn("mr-2 h-4 w-4", isFavorited && "text-pink-500 fill-pink-500")} />
                    <span>{isFavorited ? 'Unfavorite' : 'Favorite'}</span>
                  </DropdownMenuItem>
                  {onRemove && (
                    <DropdownMenuItem onSelect={handleRemove} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Remove</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="absolute bottom-0 left-0 p-4 text-white">
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-xl font-bold flex items-center gap-1.5">
                {profile.name}, {profile.age}
                {isLoggedIn && profile.metCount && profile.metCount > 5 && (
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                )}
              </h3>
              {profile.online && isLoggedIn && (
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              )}
            </div>
            <p className="text-sm text-gray-300">{profile.location}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
