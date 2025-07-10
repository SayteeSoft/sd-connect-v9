
import type { Handler, HandlerEvent } from '@netlify/functions';
import { getConversationsFromStore, saveConversationsToStore, getProfilesFromStore } from '@/src/netlify/functions/utils/store';
import type { Message, Profile, Conversation } from '@/src/netlify/functions/utils/seed-data';

// The raw conversation format stored in the database
type RawConversation = {
    id: number;
    participantId: number;
    messages: Message[];
    unreadCount: number;
};

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod === 'GET') {
        try {
            // Fetch both conversations and profiles
            const [rawConversations, profiles] = await Promise.all([
                getConversationsFromStore(),
                getProfilesFromStore()
            ]);

            // Create a map for quick profile lookups
            const profileMap = new Map(profiles.map((p: Profile) => [p.id, p]));

            // Join the participant profile into each conversation
            const joinedConversations: Conversation[] = rawConversations
                .map((rawConvo: RawConversation) => {
                    const participant = profileMap.get(rawConvo.participantId);
                    if (!participant) return null; // Skip if participant not found

                    // Remove password before sending to client
                    const { password, ...participantToReturn } = participant;

                    return {
                        id: rawConvo.id,
                        participant: participantToReturn,
                        messages: rawConvo.messages,
                        unreadCount: rawConvo.unreadCount,
                    };
                })
                .filter((c): c is Conversation => c !== null); // Filter out any nulls

            return {
                statusCode: 200,
                body: JSON.stringify(joinedConversations),
            };
        } catch (error) {
            console.error('Error fetching joined conversations:', error);
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
