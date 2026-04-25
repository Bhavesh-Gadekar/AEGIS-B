import React from 'react';
import { getNetworkUsers } from '@/actions/network';
import NetworkClientWrapper from './NetworkClientWrapper';

// Mark as async to enable server-side fetching
export default async function NetworkPage() {
    const users = await getNetworkUsers();

    return <NetworkClientWrapper initialUsers={users} />;
}
