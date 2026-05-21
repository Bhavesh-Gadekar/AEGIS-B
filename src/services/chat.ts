
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";

const supabase = createClient();

export type Conversation = Database['public']['Tables']['conversations']['Row'] & {
    participants: (Database['public']['Tables']['conversation_participants']['Row'] & {
        profiles: Database['public']['Tables']['profiles']['Row']; // Corrected property name from 'profile' to 'profiles' based on query
    })[];
    last_message?: Database['public']['Tables']['messages']['Row'];
};

export type Message = Database['public']['Tables']['messages']['Row'] & {
    sender?: Database['public']['Tables']['profiles']['Row'];
};

export const chatService = {
    // Fetch all conversations for a user
    async getConversations(userId: string): Promise<Conversation[]> {
        // 1. Get IDs of conversations the user is in
        const { data: participations, error: pError } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', userId);

        if (pError) throw pError;

        const conversationIds = participations.map(p => p.conversation_id);

        if (conversationIds.length === 0) return [];

        // 2. Fetch full conversation details including all participants and messages
        const { data: conversations, error: cError } = await supabase
            .from('conversations')
            .select(`
        *,
        conversation_participants(
          user_id,
          profiles(*)
        ),
        messages(
          id,
          content,
          created_at,
          sender_id,
          is_read
        )
      `)
            .in('id', conversationIds)
            .order('updated_at', { ascending: false });

        if (cError) throw cError;

        // 3. Process to keep only the latest message for preview
        const processedConversations = conversations.map(c => {
            // Sort messages
            const messages = c.messages as any[] || [];
            const lastMessage = messages.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            // Normalize participants structure
            const participants = c.conversation_participants.map((p: any) => ({
                ...p,
                profiles: p.profiles // Ensure this matches the type definition
            }));

            return {
                ...c,
                participants,
                messages: undefined, // remove full array from object if we only want last_message
                last_message: lastMessage
            };
        });

        return processedConversations as Conversation[];
    },

    // Fetch messages for a conversation
    async getMessages(conversationId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select(`
        *,
        sender:profiles(*)
      `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as Message[];
    },

    // Send a message
    async sendMessage(conversationId: string, senderId: string, content: string) {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content: content
            })
            .select()
            .single();

        if (error) throw error;

        // Update conversation timestamp
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return data;
    },

    // Create a new conversation (Direct or Group)
    async createConversation(creatorId: string, participantIds: string[], isGroup: boolean = false) {
        // 1. Create conversation
        const { data: conversation, error: cError } = await supabase
            .from('conversations')
            .insert({ is_group: isGroup })
            .select()
            .single();

        if (cError) throw cError;

        // 2. Add participants (include creator)
        // Ensure unique IDs
        const uniqueParticipants = Array.from(new Set([creatorId, ...participantIds]));

        const participants = uniqueParticipants.map(uid => ({
            conversation_id: conversation.id,
            user_id: uid
        }));

        const { error: pError } = await supabase
            .from('conversation_participants')
            .insert(participants);

        if (pError) throw pError;

        return conversation;
    }
};
