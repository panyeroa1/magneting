
import React, { useState, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { geminiService } from '../services/gemini';

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
const WandIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4h4"/><path d="M19 14v4h-4"/></svg>
);


const ProfileSetupScreen: React.FC = () => {
  const { profile, updateProfile, user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || `https://picsum.photos/seed/${user?.id}/200`);
  const [originalImage, setOriginalImage] = useState<{base64: string, mimeType: string} | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAvatarUrl(reader.result as string);
        setOriginalImage({ base64: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageEdit = async () => {
    if (!originalImage || !editPrompt) return;
    setIsEditingImage(true);
    try {
        const newBase64 = await geminiService.editImageWithPrompt(originalImage.base64, originalImage.mimeType, editPrompt);
        setAvatarUrl(`data:${originalImage.mimeType};base64,${newBase64}`);
    } catch (error) {
        alert('Failed to edit image. Please try again.');
    } finally {
        setIsEditingImage(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await updateProfile({
      full_name: displayName,
      bio,
      avatar_url: avatarUrl,
    });
    // AuthContext will handle navigation on profile update
    setLoading(false);
  };

  return (
    <div className="p-6 min-h-screen bg-neutral-50">
      <h1 className="text-3xl font-bold text-neutral-900">Set Up Your Profile</h1>
      <p className="text-neutral-500 mt-1 mb-8">Let others know who you are.</p>
      
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <img src={avatarUrl} alt="Profile avatar" className="w-32 h-32 rounded-full object-cover shadow-md" />
          <label htmlFor="avatar-upload" className="cursor-pointer flex items-center space-x-2 bg-white border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-100">
            <UploadIcon className="w-5 h-5" />
            <span>Upload Photo</span>
          </label>
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {originalImage && (
            <div className="p-4 bg-primary-light rounded-lg">
                <label className="block text-sm font-medium text-primary mb-1">Edit with AI</label>
                <div className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g., add a retro filter"
                        className="flex-1 p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                    <button onClick={handleImageEdit} disabled={isEditingImage} className="p-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-neutral-400">
                        {isEditingImage ? 'Applying...' : <WandIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        )}

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700">Display Name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-neutral-700">Short Bio</label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself"
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 px-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover disabled:bg-neutral-400 transition-colors"
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSetupScreen;
