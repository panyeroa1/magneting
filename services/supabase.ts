import { User, Profile, Role, SavedItem, FeedItem, Training, Video } from '../types';
import { CreateUser, SignInWithPassword, SignUp } from '@supabase/supabase-js';

// MOCK IMPLEMENTATION OF SUPABASE CLIENT
// This simulates the Supabase API for local development without a real backend.
// It uses localStorage to persist session and user data.

const MOCK_USERS_KEY = 'supabase_mock_users';
const MOCK_PROFILES_KEY = 'supabase_mock_profiles';
const MOCK_SESSION_KEY = 'supabase_mock_session';
const MOCK_SAVED_ITEMS_KEY = 'supabase_mock_saved_items';
const MOCK_FEED_ITEMS_KEY = 'supabase_mock_feed_items';
const MOCK_TRAININGS_KEY = 'supabase_mock_trainings';
const MOCK_VIDEOS_KEY = 'supabase_mock_videos';


const getMockData = <T,>(key: string): T | null => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage', error);
        return null;
    }
};

const setMockData = <T,>(key: string, data: T) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error writing to localStorage', error);
    }
};

// --- Mock Data Initialization ---
const mockMentor1: Profile = {
  id: 'mentor1',
  full_name: 'Dr. Evelyn Reed',
  role: 'mentor',
  avatar_url: 'https://picsum.photos/seed/mentor1/200',
  bio: 'Expert in leadership and development.'
};
const mockMentor2: Profile = {
  id: 'mentor2',
  full_name: 'Johnathan Carter',
  role: 'mentor',
  avatar_url: 'https://picsum.photos/seed/mentor2/200',
  bio: 'Sales guru and tech enthusiast.'
};

const initialFeedItems: FeedItem[] = [
  { id: '1', author: mockMentor1, type: 'training', title: 'New Training: Advanced Leadership Strategies', text_content: 'Just launched my new course on mastering leadership in the digital age. Check it out in the trainings tab!', thumbnail_url: 'https://picsum.photos/seed/training1/600/400', created_at: '2h ago', likes: 125, comments: 14 },
  { id: '2', author: mockMentor2, type: 'video', title: 'Video Highlight: 5 Tips for Closing a Sale', text_content: 'A quick highlight from my latest video upload. Hope you find these tips useful!', thumbnail_url: 'https://picsum.photos/seed/video1/600/400', created_at: '5h ago', likes: 88, comments: 9 },
  { id: '3', author: mockMentor1, type: 'seminar', title: 'Upcoming Seminar: The Future of Work', text_content: 'Join me next Friday for a live discussion on remote work trends and AI integration in the workplace. RSVP now!', thumbnail_url: 'https://picsum.photos/seed/seminar1/600/400', created_at: '1d ago', likes: 210, comments: 32 },
  { id: '4', author: mockMentor2, type: 'post', text_content: 'What\'s the biggest challenge you\'re facing in your career right now? Let\'s discuss in the comments. I\'m here to help!', created_at: '2d ago', likes: 56, comments: 25 },
];

const initialTrainings: Training[] = [
    { id: 't1', mentor: mockMentor1, title: 'Advanced Leadership Strategies', description: 'Master leadership in the digital age.', category: 'Leadership', level: 'Advanced', duration: '45 min', completion_status: 'In progress', thumbnail_url: 'https://picsum.photos/seed/training1/400/200' },
    { id: 't2', mentor: mockMentor2, title: 'Sales Funnel Optimization', description: 'Learn to convert leads into customers effectively.', category: 'Sales', level: 'Intermediate', duration: '1h 15min', completion_status: 'Not started', thumbnail_url: 'https://picsum.photos/seed/training2/400/200' },
    { id: 't3', mentor: mockMentor1, title: 'Mindful Productivity', description: 'Boost your focus and efficiency without the burnout.', category: 'Productivity', level: 'Beginner', duration: '30 min', completion_status: 'Completed', thumbnail_url: 'https://picsum.photos/seed/training3/400/200' },
];

const initialVideos: Video[] = [
    { id: 'v1', owner: mockMentor2, title: '5 Tips for Closing a Sale', description: '...', file_url: '#', thumbnail_url: 'https://picsum.photos/seed/video1/200/100', type: 'Training', visibility: 'public', views_count: 1402, created_at: '2 days ago' },
    { id: 'v2', owner: mockMentor2, title: 'Client Onboarding Best Practices', description: '...', file_url: '#', thumbnail_url: 'https://picsum.photos/seed/video2/200/100', type: 'Presentation', visibility: 'unlisted', views_count: 350, created_at: '1 week ago' },
    { id: 'v3', owner: mockMentor2, title: 'Q3 Sales Strategy Meeting', description: '...', file_url: '#', thumbnail_url: 'https://picsum.photos/seed/video3/200/100', type: 'Seminar Recording', visibility: 'private', views_count: 42, created_at: '2 weeks ago' },
];

const initializeMockData = () => {
    if (!getMockData(MOCK_PROFILES_KEY)) {
        setMockData(MOCK_PROFILES_KEY, { [mockMentor1.id]: mockMentor1, [mockMentor2.id]: mockMentor2 });
    }
    if (!getMockData(MOCK_FEED_ITEMS_KEY)) {
        setMockData(MOCK_FEED_ITEMS_KEY, initialFeedItems);
    }
    if (!getMockData(MOCK_TRAININGS_KEY)) {
        setMockData(MOCK_TRAININGS_KEY, initialTrainings);
    }
    if (!getMockData(MOCK_VIDEOS_KEY)) {
        setMockData(MOCK_VIDEOS_KEY, initialVideos);
    }
};

initializeMockData();

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockAuth = {
    signUp: async (credentials: SignUp) => {
        await delay(500);
        const { email, password, options } = credentials;
        const users = getMockData<Record<string, CreateUser>>(MOCK_USERS_KEY) || {};
        const profiles = getMockData<Record<string, Profile>>(MOCK_PROFILES_KEY) || {};

        if (Object.values(users).some(u => u.email === email)) {
            return { data: { user: null }, error: { message: 'User already exists' } };
        }

        const id = crypto.randomUUID();
        const newUser: User = {
            id,
            app_metadata: {},
            user_metadata: { full_name: options?.data?.full_name || '' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: email,
        };
        
        users[id] = newUser;
        setMockData(MOCK_USERS_KEY, users);

        const newProfile: Profile = {
            id,
            full_name: options?.data?.full_name || 'New User',
            role: options?.data?.role || 'learner',
            avatar_url: `https://picsum.photos/seed/${id}/200`,
            bio: ''
        };
        profiles[id] = newProfile;
        setMockData(MOCK_PROFILES_KEY, profiles);

        const session = { user: newUser, access_token: crypto.randomUUID() };
        setMockData(MOCK_SESSION_KEY, session);

        return { data: { user: newUser, session }, error: null };
    },

    signInWithPassword: async (credentials: SignInWithPassword) => {
        await delay(500);
        const { email } = credentials;
        const users = getMockData<Record<string, User>>(MOCK_USERS_KEY) || {};
        const user = Object.values(users).find(u => u.email === email);
        
        if (!user) {
            return { data: { user: null }, error: { message: 'Invalid login credentials' } };
        }

        const session = { user, access_token: crypto.randomUUID() };
        setMockData(MOCK_SESSION_KEY, session);
        return { data: { user, session }, error: null };
    },

    signOut: async () => {
        await delay(200);
        window.localStorage.removeItem(MOCK_SESSION_KEY);
        return { error: null };
    },

    getSession: async () => {
        await delay(100);
        const session = getMockData<{ user: User }>(MOCK_SESSION_KEY);
        if (session) {
            return { data: { session }, error: null };
        }
        return { data: { session: null }, error: null };
    },
};

const tableMap: { [key: string]: string } = {
    profiles: MOCK_PROFILES_KEY,
    saved_items: MOCK_SAVED_ITEMS_KEY,
    feed_items: MOCK_FEED_ITEMS_KEY,
    trainings: MOCK_TRAININGS_KEY,
    videos: MOCK_VIDEOS_KEY,
};

const mockDb = {
    from: (tableName: string) => ({
        select: (query = '*') => ({
            eq: async (column: string, value: string) => {
                await delay(300);
                const storageKey = tableMap[tableName];
                if (storageKey) {
                    const tableData = getMockData<any[] | Record<string, any>>(storageKey) || (Array.isArray(getMockData(storageKey)) ? [] : {});
                    const dataArray = Array.isArray(tableData) ? tableData : Object.values(tableData);
                    const result = dataArray.filter(item => item[column] === value);
                    return { data: result, error: null };
                }
                return { data: [], error: { message: `Table "${tableName}" not found` } };
            },
            // Fix: Changed `async then()` to a standard `then()` to make the object a valid "thenable" for `await`.
            then(onfulfilled: (value: { data: any[] | null, error: { message: string } | null }) => void) {
                (async () => {
                    await delay(400);
                    const storageKey = tableMap[tableName];
                    if (storageKey) {
                        const data = getMockData<any[]>(storageKey) || [];
                        onfulfilled({ data, error: null });
                    } else {
                        onfulfilled({ data: [], error: { message: `Table "${tableName}" not found` } });
                    }
                })();
            },
        }),
        update: (data: Partial<Profile>) => ({
            eq: async (column: string, value: string) => {
                await delay(400);
                const profiles = getMockData<Record<string, Profile>>(MOCK_PROFILES_KEY) || {};
                if (tableName === 'profiles' && profiles[value]) {
                    profiles[value] = { ...profiles[value], ...data };
                    setMockData(MOCK_PROFILES_KEY, profiles);
                    return { data: [profiles[value]], error: null };
                }
                return { data: null, error: { message: 'Record not found' } };
            }
        }),
        insert: (itemToInsert: Omit<SavedItem, 'id' | 'created_at'>) => {
             return (async () => {
                await delay(200);
                if (tableName === 'saved_items') {
                    const savedItems = getMockData<SavedItem[]>(MOCK_SAVED_ITEMS_KEY) || [];
                    const newItem: SavedItem = {
                        ...itemToInsert,
                        id: crypto.randomUUID(),
                        created_at: new Date().toISOString()
                    };
                    savedItems.push(newItem);
                    setMockData(MOCK_SAVED_ITEMS_KEY, savedItems);
                    return { data: [newItem], error: null };
                }
                return { data: null, error: { message: `Table "${tableName}" not found` } };
            })();
        },
        delete: () => ({
            eq: async (column: string, value: string) => {
                await delay(200);
                 if (tableName === 'saved_items') {
                    let savedItems = getMockData<SavedItem[]>(MOCK_SAVED_ITEMS_KEY) || [];
                    const itemToDelete = savedItems.find(item => item[column as keyof SavedItem] === value);
                    savedItems = savedItems.filter(item => item[column as keyof SavedItem] !== value);
                    setMockData(MOCK_SAVED_ITEMS_KEY, savedItems);
                    return { data: itemToDelete ? [itemToDelete] : [], error: null };
                }
                return { data: null, error: { message: 'Record not found' } };
            }
        })
    }),
};

export const supabase = {
    auth: mockAuth,
    from: mockDb.from,
};
