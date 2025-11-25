import React, { createContext, useState, ReactNode, useCallback, useMemo, useContext, useEffect } from 'react';
import { HomepageContent, PrincipalInfo, TextBlock, Stat, HomepageAnnouncement, GalleryImage, ContactInfo } from '../types.ts';
import { AuthContext } from './AuthContext.tsx';
import * as api from '../services/supabaseService.ts';

export interface LandingPageContextType {
    content: HomepageContent;
    updatePrincipalInfo: (info: Partial<PrincipalInfo>) => Promise<void>;
    updateTextBlock: (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => Promise<void>;
    updateStats: (stats: Stat[]) => Promise<void>;
    addAnnouncement: (announcement: Omit<HomepageAnnouncement, 'id'>) => Promise<void>;
    updateAnnouncement: (id: string, updates: Partial<HomepageAnnouncement>) => Promise<void>;
    deleteAnnouncement: (id: string) => Promise<void>;
    addImage: (image: Omit<GalleryImage, 'id'>) => Promise<void>;
    deleteImage: (id: string) => Promise<void>;
    updateSubmissionStatus: (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => Promise<void>;
    updateContactInfo: (info: ContactInfo) => Promise<void>;
}

export const LandingPageContext = createContext<LandingPageContextType>({} as LandingPageContextType);

const getDefaultContent = (): HomepageContent => ({
    principalInfo: {
        name: "Mr. Krishna Prasad Yadav (KP Yadav)",
        title: "A Word from Our Principal",
        message: "Welcome to Kendriya Vidyalaya Unnao...",
        imageUrl: "https://unnao.kvs.ac.in/sites/default/files/principal-new.jpg"
    },
    vision: { title: "Our Vision", content: "To cater to the educational needs..." },
    mission: { title: "Our Mission", content: "To pursue excellence..." },
    coreValues: { title: "Core Values", content: "To develop the spirit..." },
    stats: [ { id: 'stat1', value: 1985, label: "Established" }, { id: 'stat2', value: 1200, label: "Students" }, { id: 'stat3', value: 50, label: "Dedicated Staff" } ],
    announcements: [],
    galleryImages: [],
    contactInfo: { schoolName: 'PM Shree Kendriya Vidyalaya Unnao', address: 'Dahi Chowki, Unnao – 209801', email: 'kvunnao85@gmail.com', phone: '+91 0515-2826444', website: 'unnao.kvs.ac.in' }
});

export const LandingPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<HomepageContent>(getDefaultContent());
    const { users } = useContext(AuthContext);

    useEffect(() => {
        const load = async () => {
            const data = await api.fetchHomepageContent();
            if (data) setContent(data);
        };
        load();
    }, []);

    // Sync content change to DB
    const saveContent = async (newContent: HomepageContent) => {
        setContent(newContent);
        await api.updateHomepageContentDb(newContent);
    };

    const createId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const updatePrincipalInfo = async (info: Partial<PrincipalInfo>) => {
        const newContent = { ...content, principalInfo: { ...content.principalInfo, ...info } };
        await saveContent(newContent);
    };

    const updateTextBlock = async (key: 'vision' | 'mission' | 'coreValues', data: TextBlock) => {
         const newContent = { ...content, [key]: data };
         await saveContent(newContent);
    };

    const updateStats = async (stats: Stat[]) => {
         const newContent = { ...content, stats };
         await saveContent(newContent);
    };

    const updateContactInfo = async (info: ContactInfo) => {
         const newContent = { ...content, contactInfo: info };
         await saveContent(newContent);
    };

    const addAnnouncement = async (announcement: Omit<HomepageAnnouncement, 'id'>) => {
        const author = users.find(u => u.id === announcement.submittedBy);
        const newAnnouncement: HomepageAnnouncement = { 
            ...announcement, 
            id: createId(), 
            authorName: author?.name || 'Unknown' 
        };
        const newContent = { ...content, announcements: [...content.announcements, newAnnouncement] };
        await saveContent(newContent);
    };

    const updateAnnouncement = async (id: string, updates: Partial<HomepageAnnouncement>) => {
        const newContent = {
            ...content,
            announcements: content.announcements.map(a => a.id === id ? { ...a, ...updates } : a)
        };
        await saveContent(newContent);
    };

    const deleteAnnouncement = async (id: string) => {
        const newContent = {
            ...content,
            announcements: content.announcements.filter(a => a.id !== id)
        };
        await saveContent(newContent);
    };

    const addImage = async (image: Omit<GalleryImage, 'id'>) => {
        const author = users.find(u => u.id === image.submittedBy);
        const newImage: GalleryImage = { 
            ...image, 
            id: createId(), 
            authorName: author?.name || 'Unknown' 
        };
        const newContent = { ...content, galleryImages: [...content.galleryImages, newImage] };
        await saveContent(newContent);
    };

    const deleteImage = async (id: string) => {
        const newContent = {
            ...content,
            galleryImages: content.galleryImages.filter(img => img.id !== id)
        };
        await saveContent(newContent);
    };

    const updateSubmissionStatus = async (type: 'announcements' | 'galleryImages', id: string, status: 'approved' | 'rejected') => {
        const newContent = {
            ...content,
            [type]: (content[type] as any[]).map(item => item.id === id ? { ...item, status } : item)
        };
        await saveContent(newContent);
    };

    const contextValue = useMemo(() => ({
        content, updatePrincipalInfo, updateTextBlock, updateStats, addAnnouncement,
        updateAnnouncement, deleteAnnouncement, addImage, deleteImage, updateSubmissionStatus, updateContactInfo,
    }), [content, users]);

    return (
        <LandingPageContext.Provider value={contextValue}>
            {children}
        </LandingPageContext.Provider>
    );
};