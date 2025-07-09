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
    // No change in isLoading here to prevent flashes of loading state
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
                // If user is not found, clear auth state
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
        const loggedInUserId = localStorage.getItem('loggedInUserId');
        if(loggedInUserId) {
            const newCredits = await getCredits(parseInt(loggedInUserId, 10));
            setCredits(newCredits);
        }
    };

    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('creditsChanged', handleCreditsChanged);
    
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('creditsChanged', handleCreditsChanged);
    };
  }, [checkAuth]);

  const login = async (email: string, pass: string, profiles?: Profile[]): Promise<LoginResult> => {
    const result = await apiLogin(email, pass, profiles);

    if (result && result.user) {
      localStorage.setItem('loggedInUserId', result.user.id.toString());
      window.dispatchEvent(new Event('authChanged')); // Triggers re-check
      return result.user;
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('loggedInUserId');
    window.dispatchEvent(new Event('authChanged')); // Triggers re-check
  };

  const signup = async (email: string, password: string, role: 'baby' | 'daddy'): Promise<SignupResult> => {
    const creationResult = await createProfile(email, password, role);

    if (creationResult.error || !creationResult.user || !creationResult.profiles) {
        return { error: creationResult.error || 'Failed to create user.' };
    }
    
    // After successful creation, log the user in using the fresh user list
    const loggedInUser = await login(email, password, creationResult.profiles);
    if (loggedInUser) {
        return { user: loggedInUser };
    }
    
    return { error: 'Failed to log in after signing up. Please try logging in manually.' };
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
