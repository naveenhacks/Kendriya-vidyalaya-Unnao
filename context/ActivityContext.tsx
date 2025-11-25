import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { ActivityLog } from '../types.ts';
import * as api from '../services/supabaseService.ts';

interface ActivityContextType {
    logs: ActivityLog[];
    logActivity: (action: string, performedBy: string, type?: ActivityLog['type']) => Promise<void>;
}

export const ActivityContext = createContext<ActivityContextType>({} as ActivityContextType);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await api.fetchLogs();
            setLogs(data);
        };
        load();
    }, []);

    const logActivity = useCallback(async (action: string, performedBy: string, type: ActivityLog['type'] = 'info') => {
        const newLog = {
            action,
            performedBy,
            timestamp: new Date().toISOString(),
            type
        };
        await api.createLog(newLog);
        // fetch latest
        const data = await api.fetchLogs();
        setLogs(data);
    }, []);

    const value = useMemo(() => ({ logs, logActivity }), [logs, logActivity]);

    return (
        <ActivityContext.Provider value={value}>
            {children}
        </ActivityContext.Provider>
    );
};