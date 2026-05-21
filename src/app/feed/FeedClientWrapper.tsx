'use client';

import React from 'react';
import FeedTab from '@/components/tabs/FeedTab';
import { useAppContext } from '@/components/AppProvider';

export default function FeedClientWrapper({ posts, currentUser }: { posts: any[], currentUser: any }) {
    const { isDark } = useAppContext();
    return <FeedTab isDark={isDark} posts={posts} currentUser={currentUser} />;
}
