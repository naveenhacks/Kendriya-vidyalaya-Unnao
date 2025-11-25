import React, { createContext, useState, ReactNode, useCallback, useMemo, useContext, useEffect } from 'react';
import { Message, User, UserRole } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import * as api from '../services/supabaseService.ts';

export const generateConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('--');
};

export interface Conversation {
    id: string;
    otherUser: User;
    messages: Message[];
    unreadCount: number;
}

interface MessageContextType {
    conversations: Conversation[];
    sendMessage: (senderId: string, receiverId: string, content: Message['content']) => Promise<void>;
    deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
    markConversationAsRead: (conversationId: string, readerId: string) => Promise<void>;
    getConversationsForUser: (userId: string) => Conversation[];
}

export const MessageContext = createContext<MessageContextType>({} as MessageContextType);

const ADMIN_VIRTUAL_USER_ID = 'kvision_admin_inbox';

// Simple type for stored conversation data
interface StoredConversation {
    id: string;
    participants: string[];
    messages: Message[];
}

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, users } = useContext(AuthContext);
    const [rawConversations, setRawConversations] = useState<StoredConversation[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await api.fetchConversations();
            setRawConversations(data);
        };
        load();
        
        // Polling for new messages (simple realtime alternative)
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    const saveConversation = async (conversation: StoredConversation) => {
        // Optimistic update
        setRawConversations(prev => {
            const exists = prev.find(c => c.id === conversation.id);
            if(exists) return prev.map(c => c.id === conversation.id ? conversation : c);
            return [...prev, conversation];
        });
        
        await api.upsertConversation(conversation);
    };

    const conversations = useMemo(() => {
        if (!user) return [];

        const messageUserId = user.role === UserRole.Admin ? ADMIN_VIRTUAL_USER_ID : user.id;
        const adminUser: User = { id: ADMIN_VIRTUAL_USER_ID, uid: ADMIN_VIRTUAL_USER_ID, name: 'KVISION Admin', email: '', role: UserRole.Admin };
        const allUsers = [...users, adminUser];

        return rawConversations
            .filter((c) => c.participants && c.participants.includes(messageUserId))
            .map((c) => {
                const otherUserId = c.participants.find((p) => p !== messageUserId);
                const otherUser = allUsers.find(u => u.id === otherUserId);
                
                if (!otherUser) return null;

                const msgs = (c.messages || []) as Message[];

                return {
                    id: c.id,
                    otherUser,
                    messages: msgs,
                    unreadCount: msgs.filter(m => m.receiverId === messageUserId && m.status !== 'read').length
                };
            })
            .filter((c): c is Conversation => c !== null)
            .sort((a, b) => {
                const lastMsgA = a.messages[a.messages.length - 1];
                const lastMsgB = b.messages[b.messages.length - 1];
                if (!lastMsgA) return 1;
                if (!lastMsgB) return -1;
                return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
            });

    }, [user, users, rawConversations]);

    const getConversationsForUser = useCallback((userId: string): Conversation[] => {
        return conversations;
    }, [conversations]);

    const sendMessage = useCallback(async (senderId: string, receiverId: string, content: Message['content']) => {
        const conversationId = generateConversationId(senderId, receiverId);
        
        const newMessage: Message = {
            id: `msg-${Date.now()}-${Math.random()}`,
            content,
            timestamp: new Date().toISOString(),
            senderId,
            receiverId,
            status: 'sent',
        };
        
        const existing = rawConversations.find(c => c.id === conversationId);
        const updatedConvo: StoredConversation = existing ? {
            ...existing,
            messages: [...existing.messages, newMessage]
        } : {
            id: conversationId,
            participants: [senderId, receiverId],
            messages: [newMessage]
        };

        await saveConversation(updatedConvo);
    }, [rawConversations]);

    const deleteMessage = useCallback(async (conversationId: string, messageId: string) => {
        const conversation = rawConversations.find(c => c.id === conversationId);
        if(!conversation) return;

        const updatedConvo = {
            ...conversation,
            messages: conversation.messages.filter(m => m.id !== messageId)
        };
        await saveConversation(updatedConvo);
    }, [rawConversations]);

    const markConversationAsRead = useCallback(async (conversationId: string, readerId: string) => {
        const messageUserId = (user?.role === UserRole.Admin) ? ADMIN_VIRTUAL_USER_ID : readerId;
        const conversation = rawConversations.find(c => c.id === conversationId);
        if(!conversation) return;
        
        const hasUnread = conversation.messages.some(msg => msg.receiverId === messageUserId && msg.status !== 'read');
        if (!hasUnread) return;

        const updatedMessages = conversation.messages.map(msg => 
            msg.receiverId === messageUserId && msg.status !== 'read' 
            ? { ...msg, status: 'read' as const } 
            : msg
        );
        
        await saveConversation({ ...conversation, messages: updatedMessages });

    }, [user, rawConversations]);

    const contextValue = useMemo(() => ({
        conversations,
        sendMessage,
        deleteMessage,
        markConversationAsRead,
        getConversationsForUser,
    }), [conversations, sendMessage, deleteMessage, markConversationAsRead, getConversationsForUser]);

    return (
        <MessageContext.Provider value={contextValue}>
            {children}
        </MessageContext.Provider>
    );
};