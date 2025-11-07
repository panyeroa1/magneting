
import React from 'react';
import { FeedItem } from '../types';
import { geminiService } from '../services/gemini';

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
);
const MessageCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
);
const BookmarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
);
const Volume2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
);


const FeedCard: React.FC<{ item: FeedItem }> = ({ item }) => {
  
  const handlePlayTTS = () => {
    const textToRead = item.title ? `${item.title}. ${item.text_content}` : item.text_content;
    if (textToRead) {
      geminiService.textToSpeech(textToRead);
    }
  };

  const tagColors: { [key: string]: string } = {
    training: 'bg-blue-100 text-blue-800',
    seminar: 'bg-purple-100 text-purple-800',
    video: 'bg-green-100 text-green-800',
    post: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white border-b border-neutral-200 p-4">
      <div className="flex items-start space-x-3">
        <img src={item.author.avatar_url || 'https://picsum.photos/seed/user/200'} alt={item.author.full_name} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
             <div>
                <p className="font-bold text-neutral-900">{item.author.full_name}</p>
                <p className="text-sm text-neutral-500">
                  {item.author.role.charAt(0).toUpperCase() + item.author.role.slice(1)} · <time>{item.created_at}</time>
                </p>
            </div>
            <button onClick={handlePlayTTS} className="text-neutral-500 hover:text-primary transition-colors">
                <Volume2Icon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <span className={`text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full ${tagColors[item.type]}`}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </span>
        {item.title && <h3 className="text-lg font-bold mt-2">{item.title}</h3>}
        {item.text_content && <p className="text-neutral-800 mt-1">{item.text_content}</p>}
      </div>
      {item.thumbnail_url && (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img src={item.thumbnail_url} alt={item.title || 'Feed item media'} className="w-full h-auto object-cover" />
        </div>
      )}
      <div className="mt-4 flex justify-between items-center text-neutral-500">
        <div className="flex space-x-6">
          <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
            <HeartIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.likes}</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-primary transition-colors">
            <MessageCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.comments}</span>
          </button>
        </div>
        <button className="hover:text-amber-500 transition-colors">
          <BookmarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FeedCard;
