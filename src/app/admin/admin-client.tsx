
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Profile } from '@/lib/data';
import { getProfiles, deleteProfile } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminClient() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    const profilesData = await getProfiles();
    setProfiles(profilesData);
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    fetchProfiles();
    window.addEventListener('profileUpdated', fetchProfiles);
    return () => {
      window.removeEventListener('profileUpdated', fetchProfiles);
    };
  }, [fetchProfiles]);

  const handleView = (id: number) => {
    router.push(`/profile/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/profile/${id}?edit=true`);
  };

  const handleDelete = async (id: number) => {
    const profileToDelete = profiles.find(p => p.id === id);
    const success = await deleteProfile(id);

    if (success) {
        toast({
            title: "Profile Deleted",
            description: `${profileToDelete?.name || 'User'} has been removed.`,
            variant: "destructive"
        });
        // Optimistically update UI or re-fetch
        setProfiles(prev => prev.filter(p => p.id !== id));
    } else {
        toast({
            title: "Error",
            description: "Failed to delete the profile.",
            variant: "destructive"
        });
    }
  };

  if (isLoading) {
    return (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden md:table-cell">Email</TableHead>
                                <TableHead className="hidden sm:table-cell">Age</TableHead>
                                <TableHead className="hidden lg:table-cell">Location</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-8" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
          <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Age</TableHead>
                    <TableHead className="hidden lg:table-cell">Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map(profile => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={profile.imageUrl ?? 'https://placehold.co/100x100.png'} alt={profile.name} data-ai-hint={profile.hint}/>
                          <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {profile.name}
                           {profile.id === 1 ? (
                            <Badge>Admin</Badge>
                          ) : profile.role === 'daddy' ? (
                            <Badge variant="secondary">Daddy</Badge>
                          ) : (
                            <Badge variant="outline">Baby</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {profile.email}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{profile.age}</TableCell>
                      <TableCell className="hidden lg:table-cell">{profile.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(profile.id)} className="hover:bg-transparent hover:text-foreground">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(profile.id)} className="hover:bg-transparent hover:text-foreground">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-transparent hover:text-destructive" disabled={profile.id === 1}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the user account
                                          and remove their data from our servers.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(profile.id)} className="bg-destructive hover:bg-destructive/90">
                                          Delete
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
        </CardContent>
    </Card>
  );
}
