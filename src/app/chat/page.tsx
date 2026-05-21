"use client";

import React from 'react';
import ChatTab from '@/components/tabs/ChatTab';
import { useAppContext } from '@/components/AppProvider';

export default function ChatPage() {
    const { isDark, users } = useAppContext();
    return <ChatTab isDark={isDark} users={users} />;
}
