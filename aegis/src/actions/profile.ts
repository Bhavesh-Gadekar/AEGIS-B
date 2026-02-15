'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProfile(userId?: string) {
    const supabase = await createClient();
    let uid = userId;

    if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        uid = user.id;
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }


    // I need to fetch counts but wait, getProfile returns just the profile row.
    // I should append stats to it.

    // Fetch followers count
    const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', uid);

    // Fetch following count
    const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', uid);

    return {
        ...profile,
        stats: {
            followers: followersCount || 0,
            following: followingCount || 0
        }
    };
}

export async function updateProfile(formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const updates = {
        full_name: formData.name,
        handle: formData.handle,
        university: formData.university,
        bio: formData.bio,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (error) {
        console.error('Error updating profile:', error);
        return { error: 'Failed to update profile' };
    }

    revalidatePath('/profile');
    revalidatePath('/edit-profile');
    return { success: true };
}

export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authenticated' };

    const file = formData.get('avatar') as File;
    if (!file) return { error: 'No file uploaded' };

    const fileExt = file.name.split('.').pop();
    const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
        .from('posts') // Changed from 'avatars' to 'posts'
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return { error: 'Failed to upload avatar' };
    }

    const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating profile:', updateError);
        return { error: 'Failed to update profile' };
    }

    revalidatePath('/profile');
    return { success: true, avatarUrl: publicUrl };
}
export async function uploadGroupLogo(conversationId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const file = formData.get('logo') as File;
    if (!file) return { error: 'No file uploaded' };

    const fileExt = file.name.split('.').pop();
    const fileName = `group_logo_${conversationId}_${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading group logo:', uploadError);
        return { error: 'Failed to upload group logo' };
    }

    const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

    return { success: true, logoUrl: publicUrl };
}

export async function removeAvatar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

    if (error) {
        console.error('Error removing avatar:', error);
        return { error: 'Failed to remove avatar' };
    }

    revalidatePath('/profile');
    return { success: true };
}
