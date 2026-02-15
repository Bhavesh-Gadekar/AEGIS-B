'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function leaveGroup(conversationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
        .from('conversation_participants')
        .delete()
        .match({ conversation_id: conversationId, user_id: user.id });

    if (error) {
        return { error: 'Failed to leave group' };
    }

    revalidatePath('/chat');
    return { success: true };
}

export async function removeUserFromGroup(conversationId: string, targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authenticated' };

    // 1. Verify caller is the oldest member (creator)
    const { data: participants, error: fetchError } = await supabase
        .from('conversation_participants')
        .select('user_id, joined_at')
        .eq('conversation_id', conversationId)
        .order('joined_at', { ascending: true }); // Oldest first

    if (fetchError || !participants || participants.length === 0) {
        return { error: 'Failed to verify permissions' };
    }

    const creator = participants[0]; // The first joiner is the creator

    if (creator.user_id !== user.id) {
        return { error: 'Only the group creator can remove members.' };
    }

    // 2. Remove the target user
    const { error: removeError } = await supabase
        .from('conversation_participants')
        .delete()
        .match({ conversation_id: conversationId, user_id: targetUserId });

    if (removeError) {
        return { error: 'Failed to remove user' };
    }

    revalidatePath('/chat');
    return { success: true };
}
