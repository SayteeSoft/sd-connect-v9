import { getStore } from '@netlify/blobs';
import { featuredProfiles, rawConversationsData, type Profile } from './seed-data';

const PROFILES_STORE_NAME = 'profiles_data';
const CONVERSATIONS_STORE_NAME = 'conversations_data';
const CREDITS_STORE_NAME = 'credits_data';

const PROFILES_KEY = 'all_profiles';
const CONVERSATIONS_KEY = 'all_conversations';

// ====== PROFILES ======

export const getProfilesFromStore = async (): Promise<Profile[]> => {
    const store = getStore(PROFILES_STORE_NAME);
    let profiles: Profile[] | null = await store.get(PROFILES_KEY, { type: 'json' });
    if (!profiles) {
        console.log('Seeding profiles data...');
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
    const store = getStore(PROFILES_STORE_NAME);
    await store.setJSON(PROFILES_KEY, data);
};

export const getNextId = async (profiles: Profile[]): Promise<number> => {
    if (profiles.length === 0) return 1;
    return Math.max(...profiles.map(p => p.id)) + 1;
};

// ====== CONVERSATIONS ======

export const getConversationsFromStore = async (): Promise<any[]> => {
    const store = getStore(CONVERSATIONS_STORE_NAME);
    let conversations = await store.get(CONVERSATIONS_KEY, { type: 'json' });
    if (!conversations) {
        console.log('Seeding conversations data...');
        await store.setJSON(CONVERSATIONS_KEY, rawConversationsData);
        conversations = rawConversationsData;
    }
    return conversations || [];
};

export const saveConversationsToStore = async (data: any[]): Promise<void> => {
    const store = getStore(CONVERSATIONS_STORE_NAME);
    await store.setJSON(CONVERSATIONS_KEY, data);
};

// ====== CREDITS ======

export const getCreditsForUser = async (userId: number): Promise<number> => {
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
    const store = getStore(CREDITS_STORE_NAME);
    await store.setJSON(String(userId), amount);
};
