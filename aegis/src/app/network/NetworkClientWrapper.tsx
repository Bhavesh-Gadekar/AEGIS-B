'use client';

import React, { useState } from 'react';
import NetworkTab from '@/components/tabs/NetworkTab';
import { useAppContext } from '@/components/AppProvider';

export default function NetworkClientWrapper({ initialUsers }: { initialUsers: any[] }) {
    const { isDark } = useAppContext();
    const [users, setUsers] = useState(initialUsers);

    const toggleFollow = (id: string | number) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, following: !u.following } : u));
    };

    return <NetworkTab isDark={isDark} users={users} toggleFollow={toggleFollow} />;
}
