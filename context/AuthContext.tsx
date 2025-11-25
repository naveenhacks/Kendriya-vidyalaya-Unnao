import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { supabase } from '../supabaseConfig.ts';
import * as api from '../services/supabaseService.ts';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[]; 
  loading: boolean;
  connectionStatus: 'pending' | 'success' | 'error';
  login: (role: UserRole, email: string, pass: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => void;
  addStudent: (name: string, apaarId: string, password: string) => Promise<User>;
  addTeacher: (name: string, email: string, password: string) => Promise<User>;
  deleteUser: (userId: string, userUid: string) => Promise<void>;
  updateUsers: (updater: (prevUsers: User[]) => User[]) => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  updatePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'pending' | 'success' | 'error'>('pending');

  // Load session and users
  useEffect(() => {
    const initAuth = async () => {
        setLoading(true);
        try {
            // Check active session
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profile = await api.getProfile(session.user.id);
                if (profile) setUser(profile);
            }

            // Fetch all profiles for admin view
            const allProfiles = await api.getAllUsers();
            setUsers(allProfiles);
            setConnectionStatus('success');
        } catch (e) {
            console.error("Auth Init Error", e);
            setConnectionStatus('error');
        } finally {
            setLoading(false);
        }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
             const profile = await api.getProfile(session.user.id);
             setUser(profile);
        } else if (event === 'SIGNED_OUT') {
             setUser(null);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (role: UserRole, email: string, pass: string): Promise<{ success: boolean, message?: string }> => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        
        if (error) return { success: false, message: error.message };
        
        if (data.user) {
            const profile = await api.getProfile(data.user.id);
            if (!profile) return { success: false, message: 'User profile not found.' };
            
            if (profile.blocked) {
                await supabase.auth.signOut();
                return { success: false, message: 'Your account has been blocked.' };
            }
            if (profile.role !== role) {
                await supabase.auth.signOut();
                return { success: false, message: `Account exists but is not registered as a ${role}.` };
            }
            return { success: true };
        }
        return { success: false, message: 'Login failed' };
    } catch (e) {
        return { success: false, message: 'An unexpected error occurred' };
    }
  }, []);
  
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const addStudent = useCallback(async (name: string, apaarId: string, password: string): Promise<User> => {
      const studentEmail = `${apaarId.toLowerCase().replace(/\s/g, '')}@edu.com`;
      
      // 1. Create Auth User
      const { data, error } = await supabase.auth.signUp({
          email: studentEmail,
          password: password,
      });

      if (error || !data.user) throw new Error(error?.message || "Failed to create auth user");

      // 2. Create Profile
      const newUser: User = {
          id: data.user.id, // Supabase Auth ID
          uid: data.user.id, // Keep consistent
          name,
          email: studentEmail,
          role: UserRole.Student,
          password: password, // Storing purely for admin reference as per original request (not secure practice generally)
          blocked: false,
          studentData: { courses: ['General Science', 'Mathematics', 'English'], attendance: 100, overallGrade: 0 },
          preferences: { theme: 'dark' }
      };
      
      await api.createProfile(newUser);
      setUsers(prev => [...prev, newUser]);
      return newUser;
  }, []);

  const addTeacher = useCallback(async (name: string, email: string, password: string): Promise<User> => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error || !data.user) throw new Error(error?.message || "Failed to create auth user");

      const newUser: User = {
          id: data.user.id,
          uid: data.user.id,
          name, 
          email, 
          role: UserRole.Teacher,
          password: password,
          preferences: { theme: 'dark' }
      };
      
      await api.createProfile(newUser);
      setUsers(prev => [...prev, newUser]);
      return newUser;
  }, []);
  
  const deleteUser = useCallback(async (userId: string, userUid: string) => {
      await api.deleteProfile(userId); // userId here assumes uuid from DB
      setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const updateUser = useCallback(async (userId: string, data: Partial<User>) => {
      await api.updateProfile(userId, data);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
      if (user && user.id === userId) {
          setUser(prev => prev ? { ...prev, ...data } : null);
      }
  }, [user]);

  const updateUsers = useCallback(async (updater: (prevUsers: User[]) => User[]) => {
      // This function was used for local state bulk updates. 
      // In Supabase, we usually update one by one. Keeping for compatibility.
      const newUsers = updater(users);
      setUsers(newUsers);
  }, [users]);
  
  const updatePassword = useCallback(async (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Not authenticated.' };
    
    const { error } = await supabase.auth.updateUser({ password: newPass });
    
    if (error) return { success: false, message: error.message };

    // Update stored password ref if keeping it
    updateUser(user.id, { password: newPass });
    return { success: true, message: 'Password updated successfully!' };
  }, [user, updateUser]);

  const contextValue = useMemo(() => ({
    isAuthenticated: !!user,
    user,
    users,
    loading,
    connectionStatus,
    login,
    logout,
    addStudent,
    addTeacher,
    deleteUser,
    updateUsers,
    updateUser,
    updatePassword,
  }), [user, users, loading, connectionStatus, login, logout, addStudent, addTeacher, deleteUser, updateUsers, updateUser, updatePassword]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};