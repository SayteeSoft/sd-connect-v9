import type { Handler, HandlerEvent } from '@netlify/functions';
import { getConversationsFromStore, saveConversationsToStore, getProfilesFromStore } from './utils/store';
import type { Message, Conversation, Profile } from './utils/seed-data';

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod === 'GET') {
        try {
            const rawConversations = await getConversationsFromStore();
            const profiles = await getProfilesFromStore();
            
            const profileMap = new Map(profiles.map((p: Profile) => [p.id, p]));

            const conversations: Conversation[] = rawConversations.map((convo: any) => {
                const participant = profileMap.get(convo.participantId);
                if (!participant) return null;
                return {
                    id: convo.id,
                    participant,
                    messages: convo.messages,
                    unreadCount: convo.unreadCount,
                };
            }).filter((c: any): c is Conversation => c !== null);

            // Sort by most recent message
            conversations.sort((a, b) => {
                const lastMessageA = new Date(a.messages[a.messages.length - 1].timestamp).getTime();
                const lastMessageB = new Date(b.messages[b.messages.length - 1].timestamp).getTime();
                return lastMessageB - lastMessageA;
            });
            
            return {
                statusCode: 200,
                body: JSON.stringify(conversations),
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
