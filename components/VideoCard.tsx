import React from 'react';
import { Video } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookmarkIcon, BookmarkIconFilled } from '../constants';

const MoreVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
);

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const VideoCard: React.FC<{ video: Video, showSaveButton?: boolean }> = ({ video, showSaveButton }) => {
    const { savedItems, addSavedItem, removeSavedItem } = useAuth();
    const isSaved = savedItems.some(item => item.content_id === video.id);
    
    const handleSaveToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSaved) {
            removeSavedItem(video.id);
        } else {
            addSavedItem(video, 'video');
        }
    };

    const visibilityColors: {[key: string]: string} = {
        'public': 'bg-green-100 text-green-800',
        'unlisted': 'bg-yellow-100 text-yellow-800',
        'private': 'bg-red-100 text-red-800',
    }
  
  return (
    <div className="flex items-center p-3 bg-white border-b border-neutral-200 space-x-4">
      <img src={video.thumbnail_url} alt={video.title} className="w-28 h-16 object-cover rounded-md flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-neutral-800 truncate">{video.title}</h4>
        <p className="text-sm text-neutral-500">{video.type}</p>
        <div className="flex items-center text-xs text-neutral-500 mt-1 space-x-3">
          <span className={`font-semibold px-2 py-0.5 rounded-full ${visibilityColors[video.visibility]}`}>
            {video.visibility.charAt(0).toUpperCase() + video.visibility.slice(1)}
          </span>
          <div className="flex items-center space-x-1">
            <EyeIcon className="w-3 h-3"/>
            <span>{video.views_count} views</span>
          </div>
        </div>
      </div>
       {showSaveButton ? (
         <button 
            onClick={handleSaveToggle} 
            className="text-neutral-500 hover:text-primary transition-colors p-1"
            aria-label={isSaved ? 'Unsave video' : 'Save video'}
          >
            {isSaved ? <BookmarkIconFilled className="w-6 h-6 text-primary" /> : <BookmarkIcon className="w-6 h-6" />}
        </button>
       ) : (
        <button className="text-neutral-500 hover:text-neutral-800">
            <MoreVerticalIcon className="w-5 h-5" />
        </button>
       )}
    </div>
  );
};

export default VideoCard;