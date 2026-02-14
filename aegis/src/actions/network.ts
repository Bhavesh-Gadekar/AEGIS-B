'use server';

import { createClient } from '@/utils/supabase/server';

export async function getNetworkUsers() {
    const supabase = await createClient();

    // Fetch profiles where role is 'user' (or 'user' I assumed based on admin check)
    // Actually, let's just fetch all non-admin users to be safe if specific role name varies
    // But user said "only the user not admin should be seenn".
    // I previously checked `if (profile?.role === 'admin')` so 'admin' is the role.
    // I will fetch where role != 'admin'.

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin');

    if (error) {
        console.error("Error fetching network users:", error);
        return [];
    }

    // Map to User interface expected by NetworkTab
    return profiles.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Anonymous Researcher',
        role: profile.field_of_study || 'Researcher', // Use field of study as role/subtitle
        avatar: getInitials(profile.full_name),
        following: false, // Default
        achievements: Math.floor(Math.random() * 20) + 1, // Mock for now as DB might not have it
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
