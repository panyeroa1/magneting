import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedItem, Training, Video } from '../types';

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.23l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.23l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"></circle></svg>
);
const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);

const SavedItemCard: React.FC<{ item: SavedItem }> = ({ item }) => {
    const isTraining = (content: Training | Video): content is Training => item.content_type === 'training';
    const content = item.content;

    return (
        <div className="flex items-center p-2 bg-white rounded-lg shadow-sm border border-neutral-200 space-x-3">
            <img src={isTraining(content) ? content.thumbnail_url : content.thumbnail_url} alt={content.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
            <div className="flex-1">
                <span className="text-xs font-semibold bg-primary-light text-primary px-2 py-0.5 rounded-full">{item.content_type}</span>
                <h4 className="font-bold text-neutral-800 mt-1">{content.title}</h4>
            </div>
        </div>
    )
}


const ProfileScreen: React.FC = () => {
    const { profile, logout, savedItems } = useAuth();

    if (!profile) {
        return <div>Loading profile...</div>;
    }

    const isMentor = profile.role === 'mentor';

    const mentorStats = [
        { label: 'Followers', value: '1.2k' },
        { label: 'Trainings', value: 15 },
        { label: 'Videos', value: 42 },
    ];
    
    const learnerStats = [
        { label: 'Completed', value: 8 },
        { label: 'Saved', value: savedItems.length },
    ];

    const stats = isMentor ? mentorStats : learnerStats;

    return (
        <div className="bg-neutral-50 min-h-screen">
            <header className="bg-white border-b border-neutral-200 p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
                <div className="flex items-center space-x-4">
                    <button className="text-neutral-500 hover:text-primary"><SettingsIcon className="w-6 h-6"/></button>
                    <button onClick={logout} className="text-neutral-500 hover:text-red-500"><LogOutIcon className="w-6 h-6"/></button>
                </div>
            </header>

            <div className="p-6">
                <div className="flex flex-col items-center text-center">
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white" />
                    <h2 className="text-2xl font-bold mt-4">{profile.full_name}</h2>
                    <span className="text-sm font-semibold bg-primary-light text-primary px-3 py-1 rounded-full mt-2">
                        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </span>
                    <p className="text-neutral-500 mt-3 max-w-md">{profile.bio}</p>
                </div>

                <div className="mt-8 flex justify-around bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
                    {stats.map(stat => (
                        <div key={stat.label} className="text-center">
                            <p className="text-2xl font-bold text-primary">{stat.value}</p>
                            <p className="text-sm text-neutral-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <button className="w-full text-center bg-white border border-neutral-300 text-neutral-800 font-bold py-3 px-4 rounded-lg hover:bg-neutral-100 transition-colors">
                        Edit Profile
                    </button>
                </div>

                <div className="mt-8 space-y-4">
                     {isMentor ? (
                         <>
                            <h3 className="text-lg font-bold text-neutral-800">Featured Trainings</h3>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 text-neutral-500">No featured trainings yet.</div>
                         </>
                     ) : (
                        <>
                            <h3 className="text-lg font-bold text-neutral-800">Saved Items</h3>
                            {savedItems.length > 0 ? (
                                <div className="space-y-3">
                                    {savedItems.map(item => <SavedItemCard key={item.id} item={item} />)}
                                </div>
                            ) : (
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 text-neutral-500">You haven't saved any items yet.</div>
                            )}
                        </>
                     )}
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;