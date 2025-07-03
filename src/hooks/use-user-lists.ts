'use client';

import { useState, useEffect, useCallback } from 'react';

// This utility creates a hook that is synchronized with localStorage.
const createPersistentState = (key: string) => {
  const isClient = typeof window !== 'undefined';

  const usePersistentState = () => {
    // We use a state to trigger re-renders when the list changes.
    const [state, setState] = useState<number[]>(() => {
        if (!isClient) return [];
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return [];
        }
    });

    // This effect listens for changes in localStorage that might happen in other tabs.
    useEffect(() => {
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === key || (event.key === null && isClient)) {
           try {
                const item = window.localStorage.getItem(key);
                setState(item ? JSON.parse(item) : []);
            } catch (error) {
                console.error(`Error reading localStorage key “${key}”:`, error);
                setState([]);
            }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []);

    const setList = useCallback((newState: number[]) => {
      try {
        setState(newState);
        if (isClient) {
          window.localStorage.setItem(key, JSON.stringify(newState));
          // This dispatches an event so other components on the same page can update.
          window.dispatchEvent(new StorageEvent('storage', { key }));
        }
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    }, [isClient]);

    const addItem = useCallback((id: number) => {
        const currentItems = JSON.parse(window.localStorage.getItem(key) || '[]');
        setList([...new Set([...currentItems, id])]);
    }, [setList]);

    const removeItem = useCallback((id: number) => {
        const currentItems = JSON.parse(window.localStorage.getItem(key) || '[]');
        setList(currentItems.filter((itemId: number) => itemId !== id));
    }, [setList]);
    
    const toggleItem = useCallback((id: number) => {
        const currentItems = JSON.parse(window.localStorage.getItem(key) || '[]');
        if (currentItems.includes(id)) {
            removeItem(id);
        } else {
            addItem(id);
        }
    }, [addItem, removeItem]);

    const isItemInList = useCallback((id: number) => {
        const currentItems = JSON.parse(window.localStorage.getItem(key) || '[]');
        return currentItems.includes(id);
    }, []);

    return { list: state, addItem, removeItem, toggleItem, isItemInList, setList };
  };

  return usePersistentState;
};

export const useFavorites = createPersistentState('sugarconnect_favorites');
export const useBlocked = createPersistentState('sugarconnect_blocked');
