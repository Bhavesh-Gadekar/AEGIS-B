"use strict";
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../data/mockData';

interface AppContextType {
    isDark: boolean;
    toggleTheme: () => void;
    users: typeof INITIAL_USERS;
    toggleFollow: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(true);
    const [users, setUsers] = useState(INITIAL_USERS);

    const toggleTheme = () => setIsDark(prev => !prev);

    const toggleFollow = (id: number) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, following: !u.following } : u));
    };

    return (
        <AppContext.Provider value={{ isDark, toggleTheme, users, toggleFollow }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
