import React from 'react';
import { Training } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookmarkIcon, BookmarkIconFilled } from '../constants';

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const TrainingCard: React.FC<{ training: Training }> = ({ training }) => {
    const { profile, savedItems, addSavedItem, removeSavedItem } = useAuth();
    const isLearner = profile?.role === 'learner';
    const isSaved = savedItems.some(item => item.content_id === training.id);

    const handleSaveToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSaved) {
            removeSavedItem(training.id);
        } else {
            addSavedItem(training, 'training');
        }
    };

    const statusColors: {[key: string]: string} = {
        'Not started': 'bg-gray-100 text-gray-800',
        'In progress': 'bg-yellow-100 text-yellow-800',
        'Completed': 'bg-green-100 text-green-800',
    }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-4 relative">
      {isLearner && (
        <button 
            onClick={handleSaveToggle} 
            className="absolute top-2 right-2 z-10 p-1.5 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
            aria-label={isSaved ? 'Unsave training' : 'Save training'}
        >
            {isSaved ? <BookmarkIconFilled className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
        </button>
      )}
      <div className="relative">
         <img src={training.thumbnail_url} alt={training.title} className="w-full h-32 object-cover" />
         <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <PlayIcon className="w-10 h-10 text-white opacity-80"/>
         </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[training.completion_status]}`}>
                {training.completion_status}
            </span>
            <span className="text-xs font-medium text-neutral-500">{training.duration}</span>
        </div>
        <h3 className="text-lg font-bold mt-2 text-neutral-900">{training.title}</h3>
        <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{training.description}</p>
        <div className="flex items-center mt-3 pt-3 border-t border-neutral-100">
          <img src={training.mentor.avatar_url} alt={training.mentor.full_name} className="w-8 h-8 rounded-full object-cover" />
          <p className="ml-2 text-sm font-medium text-neutral-800">{training.mentor.full_name}</p>
        </div>
      </div>
    </div>
  );
};

export default TrainingCard;