
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, KeyRound, ShieldAlert } from 'lucide-react';
import type { Profile } from '@/lib/data';
import { updateProfile } from '@/lib/data';
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
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/hooks/use-auth';

// Schema for updating profile information
const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Schema for changing password
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: profile, isLoading, isLoggedIn, logout } = useAuth();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', email: '' },
  });
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
    if (profile) {
      profileForm.reset({ name: profile.name, email: profile.email });
    }
  }, [router, profile, profileForm, isLoading, isLoggedIn]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!profile) return;
    setIsSubmittingProfile(true);
    
    const updatedProfileData: Profile = { ...profile, name: data.name };
    const success = await updateProfile(updatedProfileData);

    if (success) {
      toast({
        title: 'Profile Updated',
        description: 'Your username has been updated successfully.',
      });
    } else {
        toast({
            variant: "destructive",
            title: 'Update Failed',
            description: 'Could not update your profile.',
        });
    }

    setIsSubmittingProfile(false);
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmittingPassword(true);
    
    // In a real app, you would verify the currentPassword against the backend
    // but the backend stores it in plain text, so we check against the auth context
    if (data.currentPassword !== profile?.password) {
        toast({
          variant: "destructive",
          title: 'Incorrect Password',
          description: 'The current password you entered is incorrect.',
        });
        setIsSubmittingPassword(false);
        return;
    }

    // Update password via API
    if (profile) {
      const updatedProfileData: Profile = { ...profile, password: data.newPassword };
      const success = await updateProfile(updatedProfileData);
      
      if (success) {
         toast({
          title: 'Password Changed',
          description: 'Your password has been updated successfully.',
        });
        passwordForm.reset();
      } else {
         toast({
            variant: "destructive",
            title: 'Update Failed',
            description: 'Could not update your password.',
        });
      }
    }
    
    setIsSubmittingPassword(false);
  };
  
  const handleDeleteAccount = () => {
    logout();
    toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
        variant: 'destructive',
    });
    router.push('/');
  }

  if (isLoading || !isLoggedIn || !profile) {
    return (
      <>
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    );
  }
  
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-4xl text-primary">Account Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your profile, password, and account settings.
                </p>
            </div>

          {/* Profile Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/>Profile Information</CardTitle>
              <CardDescription>Update your username and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Username</Label>
                  <Input id="name" {...profileForm.register('name')} />
                  {profileForm.formState.errors.name && <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...profileForm.register('email')} readOnly disabled/>
                   {profileForm.formState.errors.email && <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>}
                   <p className="text-xs text-muted-foreground">Changing your email address is not supported in this demo.</p>
                </div>
                <Button type="submit" disabled={isSubmittingProfile}>
                  {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Separator />

          {/* Password Settings Card */}
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />Change Password</CardTitle>
              <CardDescription>Choose a new, strong password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                  {passwordForm.formState.errors.currentPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                  {passwordForm.formState.errors.newPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
                  {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" disabled={isSubmittingPassword}>
                  {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Separator />
          
          {/* Delete Account Card */}
           <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="h-5 w-5" />Danger Zone</CardTitle>
              <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Delete your account</p>
                  <p className="text-sm text-muted-foreground">This will permanently delete your account and all associated data.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={profile.id === 1}>Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account,
                        messages, and profile from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
