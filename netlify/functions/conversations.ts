import type { Handler, HandlerEvent } from '@netlify/functions';
import { getConversationsFromStore, saveConversationsToStore } from './utils/store';
import type { Message } from './utils/seed-data';

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod === 'GET') {
        try {
            // Return raw conversation data directly.
            // The client will be responsible for joining profile data.
            const rawConversations = await getConversationsFromStore();
            return {
                statusCode: 200,
                body: JSON.stringify(rawConversations),
            };
        } catch (error) {
            return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch conversations' }) };
        }
    }

    if (event.httpMethod === 'POST') {
        try {
            const { conversationId, message } = JSON.parse(event.body || '{}');
            if (!conversationId || !message) {
                return { statusCode: 400, body: JSON.stringify({ error: 'Missing conversationId or message' }) };
            }

            const conversations = await getConversationsFromStore();
            const convoIndex = conversations.findIndex((c: any) => c.id === conversationId);

            if (convoIndex === -1) {
                return { statusCode: 404, body: JSON.stringify({ error: `Conversation with id ${conversationId} not found.` }) };
            }

            conversations[convoIndex].messages.push(message as Message);
            await saveConversationsToStore(conversations);

            return {
                statusCode: 200,
                body: JSON.stringify({ success: true }),
            };
        } catch (error) {
            return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save message' }) };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
};
