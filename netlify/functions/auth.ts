
import type { Handler, HandlerEvent } from '@netlify/functions';
import { getProfilesFromStore } from './utils/store';
import type { Profile } from './utils/seed-data';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { email, password, allProfiles } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }
    
    // Use the profile list from the request body if it exists (for post-signup login),
    // otherwise, fetch it from the store (for normal login).
    // This makes the login process faster and more reliable.
    const profilesToSearch = allProfiles || await getProfilesFromStore();

    const foundUser = profilesToSearch.find(
      (p: Profile) => p.email && p.email.toLowerCase() === email.toLowerCase() && p.password === password
    );

    if (foundUser) {
      // In a real app, you'd return a JWT here. For this prototype, returning the user is sufficient.
      const { password, ...userToReturn } = foundUser;
      return {
        statusCode: 200,
        body: JSON.stringify({ user: userToReturn }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' }),
    };
  }
};
