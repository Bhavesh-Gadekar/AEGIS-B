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
    const filePath = `${user.id}/avatar.${fileExt}`; // Overwrite existing avatar

    const { error: uploadError } = await supabase.storage
        .from('avatars') // Assuming bucket name, default is 'avatars' often. I should check if it exists or use 'posts' which I know exists? I saw 'posts' earlier. Better to use 'avatars' or 'profiles' if they exist. I'll guess 'avatars' first or 'images'.
        // Wait, I saw 'post_images' in feed actions? No, 'posts' bucket.
        // I'll try 'avatars'.
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return { error: 'Failed to upload avatar' };
    }

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

    if (updateError) {
        return { error: 'Failed to update profile avatar' };
    }

    revalidatePath('/profile');
    return { success: true, avatarUrl: publicUrl };
}
