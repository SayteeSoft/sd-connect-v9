
import type { Handler, HandlerEvent } from '@netlify/functions';
import { getCreditsForUser, setCreditsForUser } from '@/src/netlify/functions/utils/store';

export const handler: Handler = async (event: HandlerEvent) => {
  const userId = event.queryStringParameters?.userId;

  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'User ID is required' }) };
  }

  const userIdNum = parseInt(userId, 10);

  if (event.httpMethod === 'GET') {
    try {
      const credits = await getCreditsForUser(userIdNum);
      return {
        statusCode: 200,
        body: JSON.stringify({ credits }),
      };
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to get credits' }) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const { amount, action } = JSON.parse(event.body || '{}');
      if (typeof amount !== 'number' || !['add', 'spend'].includes(action)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount or action' }) };
      }

      const currentCredits = await getCreditsForUser(userIdNum);
      let newCredits;

      if (action === 'add') {
        newCredits = currentCredits + amount;
      } else { // spend
        newCredits = Math.max(0, currentCredits - amount);
      }

      await setCreditsForUser(userIdNum, newCredits);

      return {
        statusCode: 200,
        body: JSON.stringify({ credits: newCredits }),
      };
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update credits' }) };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
};
