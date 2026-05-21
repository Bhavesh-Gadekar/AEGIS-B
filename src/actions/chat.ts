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

    // 1. Verify caller is the oldest member (creator/admin)
    const { data: participants, error: fetchError } = await supabase
        .from('conversation_participants')
        .select('user_id, joined_at')
        .eq('conversation_id', conversationId)
        .order('joined_at', { ascending: true });

    if (fetchError || !participants || participants.length === 0) {
        return { error: 'Failed to verify permissions' };
    }

    const creator = participants[0];

    if (creator.user_id !== user.id) {
        return { error: 'Only the group creator can remove members.' };
    }

    // 2. Remove the target user
    const { error: removeError } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', targetUserId);

    if (removeError) {
        console.error("Remove err:", removeError);
        return { error: 'Failed to remove user. Check permissions.' };
    }

    revalidatePath('/chat');
    return { success: true };
}

export async function addParticipants(conversationId: string, userIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authenticated' };

    // 1. Verify caller is a member
    const { data: membership, error: checkError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .single();

    if (checkError || !membership) {
        return { error: 'You are not a member of this chat' };
    }

    // 2. Filter out existing members
    const { data: currentMembers } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId);

    const currentMemberIds = new Set(currentMembers?.map(m => m.user_id) || []);
    const newMembers = userIds.filter(id => !currentMemberIds.has(id));

    if (newMembers.length === 0) return { success: true };

    // 3. Insert new members
    const { error: insertError } = await supabase
        .from('conversation_participants')
        .insert(newMembers.map(id => ({
            conversation_id: conversationId,
            user_id: id
        })));

    if (insertError) return { error: 'Failed to add participants' };

    // 4. Update conversation to be a group
    await supabase
        .from('conversations')
        .update({ is_group: true })
        .eq('id', conversationId);

    revalidatePath('/chat');
    return { success: true };
}
