import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Announcement } from '../types.ts';
import * as api from '../services/supabaseService.ts';

interface AnnouncementContextType {
    announcements: Announcement[];
    addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => Promise<void>;
}

export const AnnouncementContext = createContext<AnnouncementContextType>({
    announcements: [],
    addAnnouncement: async () => {},
});

export const AnnouncementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await api.fetchAnnouncements();
            setAnnouncements(data);
        };
        load();
    }, []);

    const addAnnouncement = useCallback(async (announcement: Omit<Announcement, 'id' | 'date'>) => {
        const newAnn = {
            ...announcement,
            date: new Date().toISOString(),
        };
        await api.createAnnouncement(newAnn);
        const data = await api.fetchAnnouncements();
        setAnnouncements(data);
    }, []);
    
    const contextValue = useMemo(() => ({
        announcements,
        addAnnouncement,
    }), [announcements, addAnnouncement]);

    return (
        <AnnouncementContext.Provider value={contextValue}>
            {children}
        </AnnouncementContext.Provider>
    );
};