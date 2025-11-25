import React, { createContext, useState, ReactNode, useCallback, useMemo, useContext, useEffect } from 'react';
import { Homework } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import * as api from '../services/supabaseService.ts';

interface HomeworkContextType {
    homeworks: Homework[];
    addHomework: (homework: Omit<Homework, 'id' | 'uploadDate' | 'completedBy'>) => Promise<void>;
    updateHomework: (id: string, updates: Partial<Homework>) => Promise<void>;
    deleteHomework: (id: string) => Promise<void>;
    getHomeworkById: (id: string) => Homework | undefined;
    toggleHomeworkCompletion: (id: string) => Promise<void>;
}

export const HomeworkContext = createContext<HomeworkContextType>({} as HomeworkContextType);

export const HomeworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [homeworks, setHomeworks] = useState<Homework[]>([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const load = async () => {
            const data = await api.fetchHomeworks();
            setHomeworks(data);
        };
        load();
    }, []);

    const addHomework = useCallback(async (homework: Omit<Homework, 'id' | 'uploadDate' | 'completedBy'>) => {
        const newHomework = {
            ...homework,
            uploadDate: new Date().toISOString(),
            completedBy: [],
        };
        // Supabase will generate ID, but we might need to reload or optimistic update.
        // For simplicity, let's await the fetch.
        await api.createHomework(newHomework);
        const data = await api.fetchHomeworks();
        setHomeworks(data);
    }, []);
    
    const updateHomework = useCallback(async (id: string, updates: Partial<Homework>) => {
        await api.updateHomeworkDb(id, updates);
        setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, ...updates } : hw));
    }, []);

    const deleteHomework = useCallback(async (id: string) => {
        await api.deleteHomeworkDb(id);
        setHomeworks(prev => prev.filter(hw => hw.id !== id));
    }, []);

    const getHomeworkById = useCallback((id: string) => {
        return homeworks.find(hw => hw.id === id);
    }, [homeworks]);

    const toggleHomeworkCompletion = useCallback(async (id: string) => {
        if (!user) return;
        
        const hw = homeworks.find(h => h.id === id);
        if (!hw) return;

        const isCompleted = hw.completedBy?.includes(user.id);
        const newCompletedBy = isCompleted 
            ? hw.completedBy?.filter(uid => uid !== user.id) || []
            : [...(hw.completedBy || []), user.id];
        
        await api.updateHomeworkDb(id, { completedBy: newCompletedBy });
        
        setHomeworks(prev => prev.map(h => {
            if (h.id !== id) return h;
            return { ...h, completedBy: newCompletedBy };
        }));
    }, [user, homeworks]);

    const contextValue = useMemo(() => ({
        homeworks,
        addHomework,
        updateHomework,
        deleteHomework,
        getHomeworkById,
        toggleHomeworkCompletion,
    }), [homeworks, addHomework, updateHomework, deleteHomework, getHomeworkById, toggleHomeworkCompletion]);

    return (
        <HomeworkContext.Provider value={contextValue}>
            {children}
        </HomeworkContext.Provider>
    );
};