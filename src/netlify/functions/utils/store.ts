
import { getStore } from '@netlify/blobs';
import { featuredProfiles, rawConversationsData } from './seed-data';
import type { Profile } from './types';

const PROFILES_STORE_NAME = 'profiles_data';
const CONVERSATIONS_STORE_NAME = 'conversations_data';
const CREDITS_STORE_NAME = 'credits_data';

const PROFILES_KEY = 'all_profiles';
const CONVERSATIONS_KEY = 'all_conversations';

// A simple in-memory cache for local development fallback
let localProfilesCache: Profile[] | null = null;
let localConversationsCache: any[] | null = null;
const localCreditsCache = new Map<number, number>();

// This environment variable is set by `netlify dev` when a site is linked.
const isNetlifyLinked = () => !!process.env.NETLIFY_SITE_ID;

const logWarning = () => {
    // This warning is only logged once per session to avoid spamming the console.
    if (!(global as any).hasLoggedNetlifyWarning) {
        console.warn('Netlify Blob Store not available. Falling back to a temporary in-memory store. Run `netlify link` to connect to a live blob store for persistent data during local development.');
        (global as any).hasLoggedNetlifyWarning = true;
    }
}

// ====== PROFILES ======

export const getProfilesFromStore = async (): Promise<Profile[]> => {
    if (!isNetlifyLinked()) {
        logWarning();
        if (localProfilesCache === null) {
            localProfilesCache = structuredClone(featuredProfiles);
        }
        // Return a clone to prevent mutation of the cache
        return structuredClone(localProfilesCache);
    }

    const store = getStore(PROFILES_STORE_NAME);
    let profiles: Profile[] | null = await store.get(PROFILES_KEY, { type: 'json' });
    if (!profiles) {
        console.log('Seeding profiles data to Netlify Blobs...');
        await store.setJSON(PROFILES_KEY, featuredProfiles);
        profiles = structuredClone(featuredProfiles);
    }
    return profiles || [];
};

export const getProfileByIdFromStore = async (id: number): Promise<Profile | undefined> => {
    const profiles = await getProfilesFromStore();
    return profiles.find((p: Profile) => p.id === id);
};

export const saveProfilesToStore = async (data: Profile[]): Promise<void> => {
    if (!isNetlifyLinked()) {
        logWarning();
        // Create a deep copy to ensure the cache is not pointing to a mutated object
        localProfilesCache = structuredClone(data);
        return;
    }
    const store = getStore(PROFILES_STORE_NAME);
    await store.setJSON(PROFILES_KEY, data);
};

export const getNextId = async (profiles: Profile[]): Promise<number> => {
    if (profiles.length === 0) return 1;
    return Math.max(...profiles.map(p => p.id)) + 1;
};

// ====== CONVERSATIONS ======

export const getConversationsFromStore = async (): Promise<any[]> => {
    if (!isNetlifyLinked()) {
        logWarning();
        if (localConversationsCache === null) {
            localConversationsCache = structuredClone(rawConversationsData);
        }
        return structuredClone(localConversationsCache);
    }

    const store = getStore(CONVERSATIONS_STORE_NAME);
    let conversations = await store.get(CONVERSATIONS_KEY, { type: 'json' });
    if (!conversations) {
        console.log('Seeding conversations data to Netlify Blobs...');
        await store.setJSON(CONVERSATIONS_KEY, rawConversationsData);
        conversations = structuredClone(rawConversationsData);
    }
    return conversations || [];
};

export const saveConversationsToStore = async (data: any[]): Promise<void> => {
    if (!isNetlifyLinked()) {
        logWarning();
        localConversationsCache = structuredClone(data);
        return;
    }
    const store = getStore(CONVERSATIONS_STORE_NAME);
    await store.setJSON(CONVERSATIONS_KEY, data);
};

// ====== CREDITS ======

export const getCreditsForUser = async (userId: number): Promise<number> => {
    if (!isNetlifyLinked()) {
        logWarning();
        if (!localCreditsCache.has(userId)) {
             // Give new daddies 10 credits on first check
            localCreditsCache.set(userId, 10);
        }
        return localCreditsCache.get(userId) as number;
    }
    const store = getStore(CREDITS_STORE_NAME);
    const credits: number | null = await store.get(String(userId), { type: 'json' });
    
    // Give new daddies 10 credits on first check
    if (credits === null) {
        await store.setJSON(String(userId), 10);
        return 10;
    }
    return credits;
};

export const setCreditsForUser = async (userId: number, amount: number): Promise<void> => {
    if (!isNetlifyLinked()) {
        logWarning();
        localCreditsCache.set(userId, amount);
        return;
    }
    const store = getStore(CREDITS_STORE_NAME);
    await store.setJSON(String(userId), amount);
};
