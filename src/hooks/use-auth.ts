
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Profile } from '@/lib/data';
import { getProfile, apiLogin, createProfile, updateCredits, getCredits } from '@/lib/data';

type SignupResult = { user?: Profile; error?: string };
type LoginResult = Profile | null;

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<Profile | undefined>();
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
        const loggedInUserId = localStorage.getItem('loggedInUserId');
        if (loggedInUserId) {
            const userProfile = await getProfile(parseInt(loggedInUserId, 10));
            if (userProfile) {
                setUser(userProfile);
                setIsLoggedIn(true);
                if (userProfile.role === 'daddy' && userProfile.id !== 1) {
                    const creditsData = await getCredits(userProfile.id);
                    setCredits(creditsData);
                } else {
                    setCredits(Infinity);
                }
            } else {
                localStorage.removeItem('loggedInUserId');
                setIsLoggedIn(false);
                setUser(undefined);
                setCredits(0);
            }
        } else {
            setIsLoggedIn(false);
            setUser(undefined);
            setCredits(0);
        }
    } catch (e) {
        console.error('Auth check failed', e);
        setIsLoggedIn(false);
        setUser(undefined);
        setCredits(0);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    const handleAuthChange = () => checkAuth();
    const handleCreditsChanged = async () => {
        if(user && user.role === 'daddy' && user.id !== 1) {
            const newCredits = await getCredits(user.id);
            setCredits(newCredits);
        }
    };

    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('creditsChanged', handleCreditsChanged);
    
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('creditsChanged', handleCreditsChanged);
    };
  }, [checkAuth, user]);

  const login = async (email: string, pass: string, allProfiles?: Profile[]): Promise<LoginResult> => {
    // The `allProfiles` parameter is only passed during the special signup flow.
    // For a normal login, it's undefined, and the backend function will handle fetching the profiles.
    const result = await apiLogin(email, pass, allProfiles);

    if (result && result.user) {
      localStorage.setItem('loggedInUserId', result.user.id.toString());
      window.dispatchEvent(new Event('authChanged'));
      return result.user;
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('loggedInUserId');
    window.dispatchEvent(new Event('authChanged'));
  };

  const signup = async (email: string, password: string, role: 'baby' | 'daddy'): Promise<SignupResult> => {
    const result = await createProfile(email, password, role);

    if (result.error) {
      return { error: result.error };
    }
    
    // Pass the fresh list of all profiles (including the new one) to the login function.
    const loggedInUser = await login(email, password, result.allProfiles);
    if (loggedInUser) {
      return { user: loggedInUser };
    }
    
    return { error: 'Failed to log in after signing up.' };
  };

  const spendCredits = async (amount: number) => {
    if (user?.role === 'daddy' && user.id !== 1) {
        const newCredits = await updateCredits(user.id, amount, 'spend');
        setCredits(newCredits);
        return newCredits;
    }
    return credits;
  };

  const addCredits = async (amount: number) => {
    if (user?.role === 'daddy' && user.id !== 1) {
        const newCredits = await updateCredits(user.id, amount, 'add');
        setCredits(newCredits);
        window.dispatchEvent(new Event('creditsChanged'));
    }
  };

  return { isLoggedIn, user, isLoading, credits, login, logout, signup, spendCredits, addCredits };
}
