import React from 'react';
import ProfileTab from '@/components/tabs/ProfileTab';

import { getProfile } from '@/actions/profile';
import { getUserPosts } from '@/actions/feed';

export default async function ProfilePage() {
    const profile = await getProfile();
    // If no profile (not logged in), we can't fetch THEIR posts easily without ID.
    // getProfile without ID fetches current user.

    let userPosts: any[] = [];
    if (profile) {
        userPosts = await getUserPosts(profile.id);
    }

    return <ProfileTab initialProfile={profile} initialPosts={userPosts} />;
}
