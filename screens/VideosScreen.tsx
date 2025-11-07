import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { Video } from '../types';
import { geminiService } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
);

const BrainCircuitIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2a2.5 2.5 0 0 1 2.5 2.5v0A2.5 2.5 0 0 1 12 7a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 12 2Z"/><path d="M12 7v4.5"/><path d="M15.5 14a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-7a2.5 2.5 0 0 1-2.5-2.5v0a2.5 2.5 0 0 1 2.5-2.5Z"/><path d="M12 19v2"/><path d="M17.5 11.5a2.5 2.5 0 0 0 2.5-2.5V4.5a2.5 2.5 0 1 0-5 0v4.5a2.5 2.5 0 0 0 2.5 2.5Z"/><path d="M6.5 11.5a2.5 2.5 0 0 1-2.5-2.5V4.5a2.5 2.5 0 1 0-5 0v4.5a2.5 2.5 0 0 1 2.5 2.5Z"/><path d="M20 9.5h1.5a2.5 2.5 0 0 1 0 5H20"/><path d="M4 9.5H2.5a2.5 2.5 0 0 0 0 5H4"/></svg>
);

const imageToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const VideosScreen: React.FC = () => {
    const { profile } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [analysisResult, setAnalysisResult] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const isMentor = profile?.role === 'mentor';

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('videos').select('*');
            if (data && !error) {
                setVideos(data as Video[]);
            }
            setLoading(false);
        };
        fetchVideos();
    }, []);

    const handleAnalyzeVideo = async (video: Video) => {
        setAnalysisResult('');
        setIsAnalyzing(true);
        try {
            const imageBase64 = await imageToBase64(video.thumbnail_url);
            const result = await geminiService.analyzeVideoForKeyInformation(imageBase64);
            setAnalysisResult(`Analysis for "${video.title}":\n\n${result}`);
        } catch (error) {
            setAnalysisResult('Sorry, an error occurred during analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    }
    
    // Learners see public/unlisted videos, Mentors see all their own.
    const videosToShow = isMentor ? videos : videos.filter(v => v.visibility !== 'private');

  return (
    <div>
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between p-4 h-16 border-b border-neutral-200">
          <h1 className="text-2xl font-bold text-neutral-900">{isMentor ? "My Video Library" : "Video Library"}</h1>
          {isMentor && (
              <button className="flex items-center space-x-2 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-primary-hover">
                <PlusIcon className="w-5 h-5" />
                <span>Upload</span>
              </button>
          )}
        </div>
      </header>
      
      <div className="p-4">
        {isAnalyzing && <div className="text-center p-4">Analyzing video with Gemini...</div>}
        {analysisResult && (
            <div className="bg-primary-light p-4 rounded-lg mb-4">
                <h3 className="font-bold text-primary flex items-center space-x-2"><BrainCircuitIcon /><span>AI Analysis Result</span></h3>
                <pre className="text-sm text-neutral-800 whitespace-pre-wrap mt-2 font-sans">{analysisResult}</pre>
            </div>
        )}

        {loading ? (
            <div className="text-center p-8 text-neutral-500">Loading videos...</div>
        ) : (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                {videosToShow.map(video => (
                <div key={video.id}>
                    <VideoCard video={video} showSaveButton={!isMentor} />
                    {isMentor && (
                        <div className="p-2 bg-neutral-50 border-b border-neutral-200">
                            <button onClick={() => handleAnalyzeVideo(video)} className="text-xs font-semibold text-primary hover:underline">
                                Analyze with Gemini
                            </button>
                        </div>
                    )}
                </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default VideosScreen;
