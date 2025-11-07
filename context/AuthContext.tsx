import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User, Profile, SavedItem, Training, Video } from '../types';
import { SignUp } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  needsProfileSetup: boolean;
  savedItems: SavedItem[];
  login: (email: string, password: string) => Promise<any>;
  signup: (credentials: SignUp) => Promise<any>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  addSavedItem: (item: Training | Video, type: 'training' | 'video') => Promise<void>;
  removeSavedItem: (contentId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const fetchSavedItems = async (userId: string) => {
      const { data, error } = await supabase.from('saved_items').select('*').eq('user_id', userId);
      if (!error && data) {
          setSavedItems(data);
      }
  };

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchSavedItems(session.user.id);
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id);
        if (profileData && profileData.length > 0) {
          const fetchedProfile = profileData[0] as Profile;
          setProfile(fetchedProfile);
          if (!fetchedProfile.full_name || !fetchedProfile.role || !fetchedProfile.bio) {
              setNeedsProfileSetup(true);
          } else {
              setNeedsProfileSetup(false);
          }
        } else {
            setNeedsProfileSetup(true);
        }
      } else {
        setUser(null);
        setProfile(null);
        setNeedsProfileSetup(false);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      setUser(data.user);
      await fetchSavedItems(data.user.id);
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id);
      if (profileData && profileData.length > 0) {
        setProfile(profileData[0]);
        const fetchedProfile = profileData[0] as Profile;
        if (!fetchedProfile.full_name || !fetchedProfile.role || !fetchedProfile.bio) {
           setNeedsProfileSetup(true);
        } else {
           setNeedsProfileSetup(false);
        }
      } else {
        setNeedsProfileSetup(true);
      }
    }
    setLoading(false);
    return { data, error };
  };

  const signup = async (credentials: SignUp) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp(credentials);
    if (!error && data.user) {
        setUser(data.user);
        setNeedsProfileSetup(true);
    }
    setLoading(false);
    return {data, error};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSavedItems([]);
    setNeedsProfileSetup(false);
    window.location.hash = '#welcome';
  };

  const updateProfile = async (updates: Partial<Profile>) => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (!error && data) {
          const updatedProfile = data[0] as Profile;
          setProfile(updatedProfile);
          if (updatedProfile.full_name && updatedProfile.role && updatedProfile.bio) {
              setNeedsProfileSetup(false);
          }
      }
      setLoading(false);
  }

  const addSavedItem = async (item: Training | Video, type: 'training' | 'video') => {
      if (!user) return;
      const { data, error } = await supabase.from('saved_items').insert({
          user_id: user.id,
          content_id: item.id,
          content_type: type,
          content: item,
      });
      if (!error && data) {
          setSavedItems(prev => [...prev, data[0]]);
      }
  };

  const removeSavedItem = async (contentId: string) => {
      if (!user) return;
      const itemToRemove = savedItems.find(i => i.content_id === contentId);
      if (!itemToRemove) return;
      
      const { error } = await supabase.from('saved_items').delete().eq('id', itemToRemove.id);
      if (!error) {
          setSavedItems(prev => prev.filter(i => i.content_id !== contentId));
      }
  };

  const value = {
    user,
    profile,
    loading,
    needsProfileSetup,
    savedItems,
    login,
    signup,
    logout,
    updateProfile,
    addSavedItem,
    removeSavedItem,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};