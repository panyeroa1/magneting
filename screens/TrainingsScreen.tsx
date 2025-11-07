import React, { useState, useEffect } from 'react';
import TrainingCard from '../components/TrainingCard';
import { Training } from '../types';
import { LiveSession } from '../components/LiveSession';
import { supabase } from '../services/supabase';

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
);
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);

const filters = ['All', 'Sales', 'Leadership', 'Tech', 'Productivity'];

const TrainingsScreen: React.FC = () => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [isLiveSessionOpen, setIsLiveSessionOpen] = useState(false);

    useEffect(() => {
        const fetchTrainings = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('trainings').select('*');
            if (data && !error) {
                setTrainings(data as Training[]);
            }
            setLoading(false);
        };
        fetchTrainings();
    }, []);

    const filteredTrainings = activeFilter === 'All' ? trainings : trainings.filter(t => t.category === activeFilter);

  return (
    <div className="bg-neutral-50 min-h-screen">
       <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4">
         <h1 className="text-2xl font-bold text-neutral-900">Trainings</h1>
        <div className="relative mt-4">
          <input
            type="text"
            placeholder="Search trainings..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-neutral-400" />
          </div>
        </div>
      </header>
      
      <div className="px-4 py-2">
         <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full flex-shrink-0 transition-colors ${
                activeFilter === filter
                  ? 'bg-primary text-white'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
       <div className="p-4">
        <button 
          onClick={() => setIsLiveSessionOpen(true)}
          className="w-full flex items-center justify-center space-x-2 bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors mb-4"
        >
          <MicIcon className="w-5 h-5" />
          <span>Start Live AI Tutor Session</span>
        </button>
      
        {loading ? (
            <div className="text-center p-8 text-neutral-500">Loading trainings...</div>
        ) : (
            <div className="space-y-4">
            {filteredTrainings.map(training => (
                <TrainingCard key={training.id} training={training} />
            ))}
            </div>
        )}
      </div>

      {isLiveSessionOpen && <LiveSession onClose={() => setIsLiveSessionOpen(false)} />}
    </div>
  );
};

export default TrainingsScreen;
