
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

    const existingVoteIndex = targetProfile.votes.findIndex((v: Vote) => v.voterId === voterId);

    if (existingVoteIndex !== -1) {
      const existingVote = targetProfile.votes[existingVoteIndex];
      // If user has already voted 'met', they cannot change their vote.
      if (existingVote.choice === 'met') {
        return { statusCode: 403, body: JSON.stringify({ error: 'You have already confirmed that you met this user.' }) };
      }
      
      // If they previously voted 'notMet', they can change to 'met'.
      if (existingVote.choice === 'notMet' && choice === 'met') {
        // Update their vote
        targetProfile.votes[existingVoteIndex].choice = 'met';
        // Adjust counts: decrement notMet, increment met
        targetProfile.notMetCount = (targetProfile.notMetCount || 1) - 1;
        targetProfile.metCount = (targetProfile.metCount || 0) + 1;
      } else {
        // If they try to vote 'notMet' again, do nothing.
         return { statusCode: 200, body: JSON.stringify(targetProfile) };
      }

    } else {
      // It's a new vote
      targetProfile.votes.push({ voterId, choice });
      if (choice === 'met') {
        targetProfile.metCount = (targetProfile.metCount || 0) + 1;
      } else {
        targetProfile.notMetCount = (targetProfile.notMetCount || 0) + 1;
      }
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
