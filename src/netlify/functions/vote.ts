
import type { Handler, HandlerEvent } from '@netlify/functions';
import { getProfilesFromStore, saveProfilesToStore } from './utils/store';
import type { Profile } from './utils/seed-data';

type Vote = {
  voterId: number;
  choice: 'met' | 'notMet';
};

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { voterId, targetId, choice } = JSON.parse(event.body || '{}');

    if (!voterId || !targetId || !['met', 'notMet'].includes(choice)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: voterId, targetId, choice' }) };
    }

    const profiles = await getProfilesFromStore();
    const targetProfileIndex = profiles.findIndex((p: Profile) => p.id === targetId);

    if (targetProfileIndex === -1) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Target profile not found' }) };
    }

    const targetProfile = profiles[targetProfileIndex];

    // Ensure votes array exists
    if (!targetProfile.votes) {
      targetProfile.votes = [];
    }

    // Check if user has already voted
    if (targetProfile.votes.some((v: Vote) => v.voterId === voterId)) {
      return { statusCode: 403, body: JSON.stringify({ error: 'You have already provided feedback for this profile.' }) };
    }
    
    // Add new vote
    targetProfile.votes.push({ voterId, choice });

    // Increment count
    if (choice === 'met') {
      targetProfile.metCount = (targetProfile.metCount || 0) + 1;
    } else {
      targetProfile.notMetCount = (targetProfile.notMetCount || 0) + 1;
    }
    
    profiles[targetProfileIndex] = targetProfile;
    await saveProfilesToStore(profiles);

    const { password, ...profileToReturn } = targetProfile;
    return { statusCode: 200, body: JSON.stringify(profileToReturn) };

  } catch (error) {
    console.error('Vote handler error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'An internal error occurred.' }) };
  }
};
