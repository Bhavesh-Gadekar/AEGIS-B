'use server';

import { createClient } from '@/utils/supabase/server';

export async function getNetworkUsers() {
    const supabase = await createClient();

    // specific users, not me
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin');

    if (user) {
        query = query.neq('id', user.id);
    }

    const { data: profiles, error } = await query;

    if (error) {
        console.error("Error fetching network users:", error);
        return [];
    }

    // Check if current user is following each profile
    if (user) {
        const { data: follows } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

        const followingIds = new Set(follows?.map(f => f.following_id));

        return profiles.map(profile => ({
            id: profile.id,
            name: profile.full_name || 'Anonymous Researcher',
            role: profile.field_of_study || profile.role || 'Researcher',
            avatar: profile.avatar_url || getInitials(profile.full_name),
            following: followingIds.has(profile.id),
            achievements: Math.floor(Math.random() * 20) + 1, // Mock
            online: false
        }));
    }

    return profiles.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Anonymous Researcher',
        role: profile.field_of_study || profile.role || 'Researcher',
        avatar: profile.avatar_url || getInitials(profile.full_name),
        following: false,
        achievements: Math.floor(Math.random() * 20) + 1,
        online: false
    }));
}

function getInitials(name: string | null) {
    if (!name) return '??';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

import { revalidatePath } from 'next/cache';

export async function toggleFollowUser(targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to follow users.' };
    }

    if (user.id === targetUserId) {
        return { error: 'You cannot follow yourself.' };
    }

    // Check if already following
    const { data: existingFollow } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

    if (existingFollow) {
        // Unfollow
        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', targetUserId);

        if (error) {
            console.error('Error unfollowing:', error);
            return { error: 'Failed to unfollow user.' };
        }
    } else {
        // Follow
        const { error } = await supabase
            .from('follows')
            .insert({
                follower_id: user.id,
                following_id: targetUserId
            });

        if (error) {
            console.error('Error following:', error);
            return { error: 'Failed to follow user.' };
        }
    }

    revalidatePath('/network');
    revalidatePath('/profile'); // Update profile stats too
    return { success: true, isFollowing: !existingFollow };
}
