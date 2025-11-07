import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser;

export type Role = 'mentor' | 'learner' | 'client' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
  bio?: string;
}

export type FeedItemType = 'post' | 'training' | 'seminar' | 'video';

export interface FeedItem {
  id: string;
  author: Profile;
  type: FeedItemType;
  text_content?: string;
  created_at: string;
  likes: number;
  comments: number;
  ref_id?: string;
  title?: string;
  thumbnail_url?: string;
}

export interface Training {
    id: string;
    mentor: Profile;
    title: string;
    description: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    completion_status: 'Not started' | 'In progress' | 'Completed';
    thumbnail_url?: string;
}

export type VideoVisibility = 'public' | 'unlisted' | 'private';

export interface Video {
    id: string;
    owner: Profile;
    title: string;
    description: string;
    file_url: string;
    thumbnail_url: string;
    type: 'Presentation' | 'Training' | 'Seminar Recording';
    visibility: VideoVisibility;
    views_count: number;
    created_at: string;
}

export interface SavedItem {
    id: string;
    user_id: string;
    content_id: string;
    content_type: 'training' | 'video';
    created_at: string;
    content: Training | Video;
}