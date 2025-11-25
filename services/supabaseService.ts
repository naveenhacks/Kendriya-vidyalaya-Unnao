import { supabase } from '../supabaseConfig.ts';
import { User, UploadedFile, Homework, Announcement, Notification, ClassGroup, ActivityLog, HomepageContent } from '../types.ts';

// --- Auth & Profiles ---

export const getProfile = async (uid: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
    
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data as User;
};

export const updateProfile = async (uid: string, updates: Partial<User>) => {
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', uid);
    if (error) throw error;
};

export const getAllUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return [];
    return data as User[];
};

export const createProfile = async (user: User) => {
    const { error } = await supabase.from('profiles').insert(user);
    if (error) throw error;
};

export const deleteProfile = async (uid: string) => {
    // Note: This only deletes from the 'profiles' table. 
    // Deleting from Supabase Auth requires a backend function or Service Role key.
    const { error } = await supabase.from('profiles').delete().eq('id', uid);
    if (error) throw error;
};

// --- Storage ---

export const uploadFileToStorage = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
        .from('kvision-files')
        .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
        .from('kvision-files')
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
};

// --- Homework ---

export const fetchHomeworks = async (): Promise<Homework[]> => {
    const { data, error } = await supabase
        .from('homeworks')
        .select('*')
        .order('uploadDate', { ascending: false });
    if (error) return [];
    return data as Homework[];
};

export const createHomework = async (homework: any) => {
    const { error } = await supabase.from('homeworks').insert(homework);
    if (error) throw error;
};

export const deleteHomeworkDb = async (id: string) => {
    const { error } = await supabase.from('homeworks').delete().eq('id', id);
    if (error) throw error;
};

export const updateHomeworkDb = async (id: string, updates: any) => {
    const { error } = await supabase.from('homeworks').update(updates).eq('id', id);
    if (error) throw error;
};

// --- Announcements ---

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
    const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    if (error) return [];
    return data as Announcement[];
};

export const createAnnouncement = async (announcement: any) => {
    const { error } = await supabase.from('announcements').insert(announcement);
    if (error) throw error;
};

// --- Notifications ---

export const fetchNotifications = async (): Promise<Notification[]> => {
    const { data, error } = await supabase.from('notifications').select('*').order('date', { ascending: false });
    if (error) return [];
    return data as Notification[];
};

export const createNotification = async (notification: any) => {
    const { error } = await supabase.from('notifications').insert(notification);
    if (error) throw error;
};

export const deleteNotificationDb = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
};

export const updateNotificationDb = async (id: string, updates: any) => {
    const { error } = await supabase.from('notifications').update(updates).eq('id', id);
    if (error) throw error;
};

// --- Classes ---

export const fetchClasses = async (): Promise<ClassGroup[]> => {
    const { data, error } = await supabase.from('classes').select('*');
    if (error) return [];
    return data as ClassGroup[];
};

export const createClass = async (cls: any) => {
    const { error } = await supabase.from('classes').insert(cls);
    if (error) throw error;
};

export const updateClassDb = async (id: string, updates: any) => {
    const { error } = await supabase.from('classes').update(updates).eq('id', id);
    if (error) throw error;
};

export const deleteClassDb = async (id: string) => {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
};

// --- Activity Logs ---

export const fetchLogs = async (): Promise<ActivityLog[]> => {
    const { data, error } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(50);
    if (error) return [];
    return data as ActivityLog[];
};

export const createLog = async (log: any) => {
    const { error } = await supabase.from('activity_logs').insert(log);
    if (error) console.error("Failed to log activity", error);
};

// --- Messaging ---
// For messaging, we fetch conversations. Realtime is complex, so we'll just fetch for now.

export const fetchConversations = async (): Promise<any[]> => {
    const { data, error } = await supabase.from('conversations').select('*');
    if (error) return [];
    return data;
};

export const upsertConversation = async (conversation: any) => {
    const { error } = await supabase.from('conversations').upsert(conversation);
    if (error) throw error;
};

// --- Homepage ---

export const fetchHomepageContent = async (): Promise<HomepageContent | null> => {
    const { data, error } = await supabase.from('homepage').select('content').eq('id', 'main').single();
    if (error || !data) return null;
    return data.content;
};

export const updateHomepageContentDb = async (content: HomepageContent) => {
    const { error } = await supabase.from('homepage').upsert({ id: 'main', content });
    if (error) throw error;
};
