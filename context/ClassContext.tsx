import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { ClassGroup } from '../types.ts';
import * as api from '../services/supabaseService.ts';

interface ClassContextType {
    classes: ClassGroup[];
    addClass: (name: string, subjects: string[]) => Promise<void>;
    updateClass: (id: string, updates: Partial<ClassGroup>) => Promise<void>;
    deleteClass: (id: string) => Promise<void>;
}

export const ClassContext = createContext<ClassContextType>({} as ClassContextType);

export const ClassProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [classes, setClasses] = useState<ClassGroup[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await api.fetchClasses();
            setClasses(data);
        };
        load();
    }, []);

    const addClass = useCallback(async (name: string, subjects: string[]) => {
        const newClass = {
            name,
            subjects,
        };
        await api.createClass(newClass);
        const data = await api.fetchClasses();
        setClasses(data);
    }, []);

    const updateClass = useCallback(async (id: string, updates: Partial<ClassGroup>) => {
        await api.updateClassDb(id, updates);
        setClasses(prev => prev.map(cls => cls.id === id ? { ...cls, ...updates } : cls));
    }, []);

    const deleteClass = useCallback(async (id: string) => {
        await api.deleteClassDb(id);
        setClasses(prev => prev.filter(cls => cls.id !== id));
    }, []);

    const value = useMemo(() => ({ classes, addClass, updateClass, deleteClass }), [classes, addClass, updateClass, deleteClass]);

    return (
        <ClassContext.Provider value={value}>
            {children}
        </ClassContext.Provider>
    );
};