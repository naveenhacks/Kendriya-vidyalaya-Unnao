import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect, useContext } from 'react';
import { Notification, UserRole } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import * as api from '../services/supabaseService.ts';

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'date' | 'readBy'>) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    markAsRead: (userId: string, userRole: UserRole) => Promise<void>;
    getUnreadCount: (userRole: UserRole, userId: string) => number;
    getNotificationsForUser: (userRole: UserRole, userId: string) => Notification[];
}

export const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const load = async () => {
            const data = await api.fetchNotifications();
            setNotifications(data);
        };
        load();
    }, []);

    const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'date' | 'readBy'>) => {
        const newNotif = {
            ...notification,
            date: new Date().toISOString(),
            readBy: [],
        };
        await api.createNotification(newNotif);
        const data = await api.fetchNotifications();
        setNotifications(data);
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        await api.deleteNotificationDb(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const getNotificationsForUser = useCallback((userRole: UserRole, userId: string): Notification[] => {
        return notifications.filter(n => n.target === 'all' || n.target === userRole);
    }, [notifications]);

    const getUnreadCount = useCallback((userRole: UserRole, userId: string): number => {
        const userNotifs = getNotificationsForUser(userRole, userId);
        return userNotifs.filter(n => !n.readBy?.includes(userId)).length;
    }, [notifications, getNotificationsForUser]);

    const markAsRead = useCallback(async (userId: string, userRole: UserRole) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => {
            if ((n.target === 'all' || n.target === userRole) && !n.readBy?.includes(userId)) {
                return { ...n, readBy: [...(n.readBy || []), userId] };
            }
            return n;
        }));

        // DB update (iterate through relevant unread notifications)
        const toUpdate = notifications.filter(n => (n.target === 'all' || n.target === userRole) && !n.readBy?.includes(userId));
        for (const notif of toUpdate) {
             const newReadBy = [...(notif.readBy || []), userId];
             await api.updateNotificationDb(notif.id, { readBy: newReadBy });
        }
    }, [notifications]);

    const contextValue = useMemo(() => ({
        notifications,
        addNotification,
        deleteNotification,
        markAsRead,
        getUnreadCount,
        getNotificationsForUser,
    }), [notifications, addNotification, deleteNotification, markAsRead, getUnreadCount, getNotificationsForUser]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};