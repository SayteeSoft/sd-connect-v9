
import { getStore } from '@netlify/blobs';
import { featuredProfiles, rawConversationsData } from './seed-data';
import type { Profile } from './seed-data';

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
    if (isNetlifyLinked() || (global as any).__has_warned_blob_fallback) return;
    console.warn('Netlify Blob Store not available. Falling back to a temporary in-memory store. Run `netlify link` to connect to a live blob store for persistent data during local development.');
    (global as any).__has_warned_blob_fallback = true;
}

// ====== PROFILES ======

export const getProfilesFromStore = async (): Promise<Profile[]> => {
    if (!isNetlifyLinked()) {
        logWarning();
        if (!localProfilesCache) {
            // Seed the cache only once
            localProfilesCache = structuredClone(featuredProfiles);
        }
        // Always return a fresh clone to prevent mutation across function calls
        return structuredClone(localProfilesCache!);
    }

    const store = getStore(PROFILES_STORE_NAME);
    let profiles: Profile[] | null = await store.get(PROFILES_KEY, { type: 'json' });
    if (!profiles) {
        console.log('Seeding profiles data to Netlify Blobs...');
        await store.setJSON(PROFILES_KEY, featuredProfiles);
        profiles = featuredProfiles;
    }
    return profiles || [];
};

export const getProfileByIdFromStore = async (id: number): Promise<Profile | undefined> => {
    const profiles = await getProfilesFromStore();
    return profiles.find((p: Profile) => p.id === id);
};

export const saveProfilesToStore = async (data: Profile[]): Promise<void> => {
    if (!isNetlifyLinked()) {
        localProfilesCache = data;
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
        if (!localConversationsCache) {
            localConversationsCache = structuredClone(rawConversationsData);
        }
        return structuredClone(localConversationsCache!);
    }

    const store = getStore(CONVERSATIONS_STORE_NAME);
    let conversations = await store.get(CONVERSATIONS_KEY, { type: 'json' });
    if (!conversations) {
        console.log('Seeding conversations data to Netlify Blobs...');
        await store.setJSON(CONVERSATIONS_KEY, rawConversationsData);
        conversations = rawConversationsData;
    }
    return conversations || [];
};

export const saveConversationsToStore = async (data: any[]): Promise<void> => {
    if (!isNetlifyLinked()) {
        localConversationsCache = data;
        return;
    }
    const store = getStore(CONVERSATIONS_STORE_NAME);
    await store.setJSON(CONVERSATIONS_KEY, data);
};

// ====== CREDITS ======

export const getCreditsForUser = async (userId: number): Promise<number> => {
    if (!isNetlifyLinked()) {
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
        localCreditsCache.set(userId, amount);
        return;
    }
    const store = getStore(CREDITS_STORE_NAME);
    await store.setJSON(String(userId), amount);
};
