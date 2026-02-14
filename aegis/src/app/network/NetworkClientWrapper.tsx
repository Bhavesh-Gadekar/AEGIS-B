'use client';

import React, { useState } from 'react';
import NetworkTab from '@/components/tabs/NetworkTab';
import { useAppContext } from '@/components/AppProvider';

export default function NetworkClientWrapper({ initialUsers }: { initialUsers: any[] }) {
    const { isDark } = useAppContext();
    const [users, setUsers] = useState(initialUsers);

    const toggleFollow = async (id: string | number) => {
        // Optimistic update
        setUsers(prev => prev.map(u => u.id === id ? { ...u, following: !u.following } : u));

        try {
            const { toggleFollowUser } = await import('@/actions/network');
            const result = await toggleFollowUser(String(id));

            if (result.error) {
                // Revert on error
                setUsers(prev => prev.map(u => u.id === id ? { ...u, following: !u.following } : u));
                alert(result.error); // Or toast if available
            }
        } catch (error) {
            // Revert on error
            setUsers(prev => prev.map(u => u.id === id ? { ...u, following: !u.following } : u));
            console.error(error);
        }
    };

    return <NetworkTab isDark={isDark} users={users} toggleFollow={toggleFollow} />;
}