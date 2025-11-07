import React, { useState, useEffect } from 'react';
import FeedCard from '../components/FeedCard';
import { FeedItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { LogoIcon } from '../constants';
import { supabase } from '../services/supabase';

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

const HomeScreen: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  
  useEffect(() => {
    const fetchFeedItems = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('feed_items').select('*');
        if (data && !error) {
            setFeedItems(data as FeedItem[]);
        }
        setLoading(false);
    };
    fetchFeedItems();
  }, []);

  return (
    <div>
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-neutral-200 z-10">
        <div className="flex items-center justify-between p-4 h-16">
           <div className="text-brand-dark">
             <LogoIcon />
           </div>
          <div className="flex items-center space-x-4">
            <button className="text-neutral-500 hover:text-primary">
              <BellIcon className="w-6 h-6" />
            </button>
            <a href="#profile">
                <img src={profile?.avatar_url} alt="My profile" className="w-9 h-9 rounded-full object-cover"/>
            </a>
          </div>
        </div>
      </header>
      
      <div className="bg-neutral-100">
        {loading ? (
            <div className="p-8 text-center text-neutral-500">Loading feed...</div>
        ) : (
            feedItems.map(item => (
              <FeedCard key={item.id} item={item} />
            ))
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
