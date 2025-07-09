import type { Handler, HandlerEvent } from '@netlify/functions';
import { getProfilesFromStore, getProfileByIdFromStore, saveProfilesToStore, getNextId } from './utils/store';
import type { Profile } from './utils/seed-data';

export const handler: Handler = async (event: HandlerEvent) => {
  const id = event.queryStringParameters?.id;

  switch (event.httpMethod) {
    case 'GET':
      try {
        if (id) {
          const profile = await getProfileByIdFromStore(parseInt(id, 10));
          if (profile) {
            const { password, ...userToReturn } = profile;
            return { statusCode: 200, body: JSON.stringify(userToReturn) };
          }
          return { statusCode: 404, body: JSON.stringify({ error: 'Profile not found' }) };
        } else {
          const profiles = await getProfilesFromStore();
          const profilesToReturn = profiles.map((p: any) => {
            const { password, ...rest } = p;
            return rest;
          });
          return { statusCode: 200, body: JSON.stringify(profilesToReturn) };
        }
      } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch profiles' }) };
      }

    case 'POST': // Create new profile (signup)
      try {
        const { email, password, role } = JSON.parse(event.body || '{}');
        const profiles = await getProfilesFromStore();
        
        if (profiles.some((p: Profile) => p.email.toLowerCase() === email.toLowerCase())) {
          return { statusCode: 409, body: JSON.stringify({ error: 'A user with this email address already exists.' }) };
        }

        const newId = await getNextId(profiles);
        const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

        const newProfile: Profile = {
          id: newId,
          name,
          email,
          password,
          age: 18,
          location: '',
          imageUrl: `https://placehold.co/${600 + newId}x${600 + newId}.png`,
          hint: role === 'baby' ? 'woman smiling' : 'man suit',
          role,
          online: true,
          verified: false,
          bio: '',
          wants: [],
          interests: [],
          gallery: [],
          attributes: {},
          metCount: 0,
          notMetCount: 0,
          votes: [],
        };

        const updatedProfiles = [...profiles, newProfile];
        await saveProfilesToStore(updatedProfiles);
        
        const { password: p, ...userToReturn } = newProfile;
        
        // Return the new user object and the complete list of profiles
        return { statusCode: 201, body: JSON.stringify({ user: userToReturn, profiles: updatedProfiles }) };
      } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to create profile' }) };
      }

    case 'PUT': // Update profile
      try {
        const updatedProfile: Profile = JSON.parse(event.body || '{}');
        const profiles = await getProfilesFromStore();
        const index = profiles.findIndex((p: Profile) => p.id === updatedProfile.id);

        if (index === -1) {
          return { statusCode: 404, body: JSON.stringify({ error: 'Profile not found' }) };
        }
        
        // Preserve original password if not included in update
        if (!updatedProfile.password) {
            updatedProfile.password = profiles[index].password;
        }

        profiles[index] = updatedProfile;
        await saveProfilesToStore(profiles);

        const { password, ...userToReturn } = updatedProfile;
        return { statusCode: 200, body: JSON.stringify(userToReturn) };
      } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update profile' }) };
      }

    case 'DELETE':
      try {
        if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Profile ID is required' }) };
        
        let profiles = await getProfilesFromStore();
        const initialLength = profiles.length;
        profiles = profiles.filter((p: Profile) => p.id !== parseInt(id, 10));

        if (profiles.length === initialLength) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Profile not found' }) };
        }

        await saveProfilesToStore(profiles);
        return { statusCode: 204, body: '' }; // No Content
      } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to delete profile' }) };
      }

    default:
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
};
