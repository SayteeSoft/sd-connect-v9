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
    
    window.addEventListener('authChanged', checkAuth);
    return () => {
      window.removeEventListener('authChanged', checkAuth);
    };
  }, [checkAuth]);

  const login = async (email: string, pass: string): Promise<LoginResult> => {
    const result = await apiLogin(email, pass);

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
    const newUser = await createProfile(email, password, role);

    if ('error' in newUser) {
      return { error: newUser.error };
    }
    
    const loggedInUser = await login(email, password);
    if (loggedInUser) {
      return { user: loggedInUser };
    }
    
    return { error: 'Failed to log in after signing up.' };
  };

  const spendCredits = async (amount: number) => {
    if (user?.role === 'daddy' && user.id !== 1) {
        const newCredits = await updateCredits(user.id, amount, 'spend');
        setCredits(newCredits); // Optimistically update UI
        return newCredits;
    }
    return credits;
  };

  const addCredits = async (amount: number) => {
    if (user?.role === 'daddy' && user.id !== 1) {
        const newCredits = await updateCredits(user.id, amount, 'add');
        setCredits(newCredits); // Optimistically update UI
        window.dispatchEvent(new Event('authChanged')); // Ensure header updates
    }
  };

  return { isLoggedIn, user, isLoading, credits, login, logout, signup, spendCredits, addCredits };
}
