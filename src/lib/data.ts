
// This file now acts as a client-side SDK for interacting with the backend API.
// It no longer contains direct data or localStorage logic.

export type Profile = {
  id: number;
  name: string;
  email: string;
  password?: string;
  age: number;
  location: string;
  imageUrl: string;
  role: 'baby' | 'daddy';
  online: boolean;
  hint: string;
  verified?: boolean;
  bio?: string;
  wants?: string[];
  interests?: string[];
  gallery?: string[];
  attributes?: {
    [key: string]: string;
  };
  metCount?: number;
  notMetCount?: number;
  votes?: {
    voterId: number;
    choice: 'met' | 'notMet';
  }[];
};

export type Message = {
  id: number;
  senderId: number; // Corresponds to a Profile ID
  text: string;
  timestamp: string; // ISO string for simplicity
};

export type Conversation = {
  id: number;
  participant: Profile;
  messages: Message[];
  unreadCount: number;
};

// This is what the API will now return
export type ConversationWithParticipantId = {
  id: number;
  participantId: number;
  messages: Message[];
  unreadCount: number;
};


// Static options can remain here as they are part of the client-side UI definition.
export const wantsOptions = [
  'Mentorship', 'Discreet', 'Long-term', 'Travel Partner', 
  'Casual', 'No Strings Attached', 'Friendship', 'Networking'
];

export const interestsOptions = [
  'Art', 'Travel', 'Fine Dining', 'Theatre', 'Wine Tasting',
  'Sports', 'Music', 'Movies', 'Reading', 'Cooking', 'Fitness'
];

export const bodyTypeOptions = ['Slim', 'Athletic', 'Average', 'Curvy', 'A few extra pounds'];
export const ethnicityOptions = ["Black/African Descent", "North/African Descent", "East Asian", "South Asian", "Hispanic/Latino", "Middle Eastern", "Native American/Indigenous", "White"];
export const hairColorOptions = ["Brown", "Black", "Blonde", "Chestnut", "Grey", "Auburn", "Red"];
export const eyeColorOptions = ["Blue", "Brown", "Green", "Grey", "Hazel"];
export const smokerDrinkerOptions = ['Yes', 'Socially', 'Sometimes', 'No'];
export const yesNoOptions = [{value: 'Yes', label: 'Yes'}, {value: 'No', label: 'No'}];

export const attributeKeys = [
  'Height',
  'Body Type',
  'Ethnicity',
  'Hair Color',
  'Eye Color',
  'Smoker',
  'Drinker',
  'Piercings',
  'Tattoos',
];

// --- API Functions ---

const API_BASE_PATH = '/.netlify/functions';

/**
 * Fetches all profiles from the backend.
 * @returns {Promise<Profile[]>} An array of profiles.
 */
export async function getProfiles(): Promise<Profile[]> {
  try {
    const response = await fetch(`${API_BASE_PATH}/profiles?_=${new Date().getTime()}`);
    if (!response.ok) throw new Error('Failed to fetch profiles');
    return await response.json();
  } catch (error) {
    console.error('getProfiles error:', error);
    return [];
  }
}

/**
 * Fetches a single profile by ID from the backend.
 * @param {number} id - The ID of the profile to retrieve.
 * @returns {Promise<Profile | undefined>} The profile object or undefined if not found.
 */
export async function getProfile(id: number): Promise<Profile | undefined> {
  try {
    const response = await fetch(`${API_BASE_PATH}/profiles?id=${id}&_=${new Date().getTime()}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Failed to fetch profile ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`getProfile(${id}) error:`, error);
    return undefined;
  }
}

/**
 * Creates a new user profile via the backend API.
 * @param {string} email - The new user's email.
 * @param {string} password - The new user's password.
 * @param {'baby' | 'daddy'} role - The new user's role.
 * @returns {Promise<{ user: Profile } | { error: string }>} The new profile object or an error object.
 */
export async function createProfile(email: string, password: string, role: 'baby' | 'daddy'): Promise<{ user: Profile } | { error: string }> {
  try {
    const response = await fetch(`${API_BASE_PATH}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || 'Failed to create profile' };
    }
    window.dispatchEvent(new Event('profileUpdated'));
    return data;
  } catch (error) {
    console.error('createProfile error:', error);
    return { error: 'An unexpected error occurred.' };
  }
}

/**
 * Updates a profile via the backend API.
 * @param {Profile} updatedProfile - The profile object with updated data.
 * @returns {Promise<boolean>} True if the update was successful, false otherwise.
 */
export async function updateProfile(updatedProfile: Profile): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_PATH}/profiles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProfile),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    window.dispatchEvent(new Event('authChanged'));
    window.dispatchEvent(new Event('profileUpdated'));
    return true;
  } catch (error) {
    console.error('updateProfile error:', error);
    return false;
  }
}

/**
 * Deletes a profile via the backend API.
 * @param {number} profileId - The ID of the profile to delete.
 * @returns {Promise<boolean>} True if the deletion was successful, false otherwise.
 */
export async function deleteProfile(profileId: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_PATH}/profiles?id=${profileId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete profile');
    window.dispatchEvent(new Event('profileUpdated'));
    return true;
  } catch (error) {
    console.error('deleteProfile error:', error);
    return false;
  }
}

/**
 * Fetches all conversations from the backend.
 * @returns {Promise<ConversationWithParticipantId[]>} An array of conversation objects with participant IDs.
 */
export async function getConversations(): Promise<ConversationWithParticipantId[]> {
    try {
        const response = await fetch(`${API_BASE_PATH}/conversations?_=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Failed to fetch conversations');
        return await response.json();
    } catch (error) {
        console.error('getConversations error:', error);
        return [];
    }
}

/**
 * Saves a new message to a conversation via the backend API.
 * @param {number} conversationId - The ID of the conversation to update.
 * @param {Message} message - The new message object to add.
 * @returns {Promise<boolean>} True if the save was successful, false otherwise.
 */
export async function saveMessage(conversationId: number, message: Message): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_PATH}/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId, message }),
        });
        return response.ok;
    } catch (error) {
        console.error('saveMessage error:', error);
        return false;
    }
}

/**
 * Handles user login via the backend API.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{ user: Profile } | null>} The user object or null.
 */
export async function apiLogin(email: string, password: string): Promise<{ user: Profile } | null> {
    try {
        const response = await fetch(`${API_BASE_PATH}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('apiLogin error:', error);
        return null;
    }
}

/**
 * Fetches the credit balance for a user.
 * @param {number} userId
 * @returns {Promise<number>} The user's credit balance.
 */
export async function getCredits(userId: number): Promise<number> {
    try {
        const response = await fetch(`${API_BASE_PATH}/credits?userId=${userId}&_=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Failed to fetch credits');
        const data = await response.json();
        return data.credits;
    } catch (error) {
        console.error('getCredits error:', error);
        return 0; // Fallback to 0 on error
    }
}


/**
 * Updates a user's credits via the backend API.
 * @param {number} userId
 * @param {number} amount
 * @param {'add' | 'spend'} action
 * @returns {Promise<number>} The new credit balance.
 */
export async function updateCredits(userId: number, amount: number, action: 'add' | 'spend'): Promise<number> {
    try {
        const response = await fetch(`${API_BASE_PATH}/credits?userId=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, action }),
        });
        if (!response.ok) throw new Error('Failed to update credits');
        const data = await response.json();
        return data.credits;
    } catch (error) {
        console.error('updateCredits error:', error);
        // Fallback to a safe value
        const currentCredits = await getCredits(userId);
        return currentCredits;
    }
}

/**
 * Submits a vote for a user profile.
 * @param {number} voterId - The ID of the user casting the vote.
 * @param {number} targetId - The ID of the user profile being voted on.
 * @param {'met' | 'notMet'} choice - The vote choice.
 * @returns {Promise<Profile | { error: string }>} The updated profile or an error object.
 */
export async function castVote(voterId: number, targetId: number, choice: 'met' | 'notMet'): Promise<Profile | { error: string }> {
  try {
    const response = await fetch(`${API_BASE_PATH}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId, targetId, choice }),
    });
    const data = await response.json();
    if (!response.ok) {
        return { error: data.error || 'Failed to cast vote.' };
    }
    return data;
  } catch (error) {
    console.error('castVote error:', error);
    return { error: 'An unexpected error occurred.' };
  }
}
