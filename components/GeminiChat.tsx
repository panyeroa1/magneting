
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { GenerateContentResponse } from '@google/genai';

const BotIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h-3A2.5 2.5 0 0 1 4 4.5v0A2.5 2.5 0 0 1 6.5 2h3Z"/><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7h-3a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 11.5 2h3Z"/><path d="M6.5 15A2.5 2.5 0 0 1 9 17.5v0A2.5 2.5 0 0 1 6.5 20h-3A2.5 2.5 0 0 1 1 17.5v0A2.5 2.5 0 0 1 3.5 15h3Z"/><path d="M17.5 15a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-3a2.5 2.5 0 0 1-2.5-2.5v0a2.5 2.5 0 0 1 2.5-2.5h3Z"/><path d="M2.5 7.5A2.5 2.5 0 0 1 5 10v0a2.5 2.5 0 0 1-2.5 2.5h-0A2.5 2.5 0 0 1 0 10v0A2.5 2.5 0 0 1 2.5 7.5h0Z"/><path d="M21.5 7.5a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-0a2.5 2.5 0 0 1-2.5-2.5v0a2.5 2.5 0 0 1 2.5-2.5h0Z"/><path d="M12 7.5a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-0A2.5 2.5 0 0 1 9.5 10v0A2.5 2.5 0 0 1 12 7.5h0Z"/><path d="M12 12.5a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-0A2.5 2.5 0 0 1 9.5 15v0A2.5 2.5 0 0 1 12 12.5h0Z"/></svg>
);


interface Message {
  sender: 'user' | 'bot';
  text: string;
  sources?: any[];
}

const GeminiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'search' | 'thinking'>('chat');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        if (mode === 'chat') {
            const stream = await geminiService.getChatResponseStream(input);
            setMessages(prev => [...prev, { sender: 'bot', text: '' }]);
            for await (const chunk of stream) {
                setMessages(prev => {
                    const lastMsgIndex = prev.length - 1;
                    const newMessages = [...prev];
                    newMessages[lastMsgIndex] = { ...newMessages[lastMsgIndex], text: newMessages[lastMsgIndex].text + chunk.text };
                    return newMessages;
                });
            }
        } else if (mode === 'search') {
            const { text, sources } = await geminiService.getGroundedResponse(input);
            setMessages(prev => [...prev, { sender: 'bot', text, sources }]);
        } else if (mode === 'thinking') {
            const text = await geminiService.getComplexResponseWithThinking(input);
            setMessages(prev => [...prev, { sender: 'bot', text }]);
        }

    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary rounded-full text-white flex items-center justify-center shadow-lg hover:bg-primary-hover transition-transform transform hover:scale-110 z-50"
        aria-label="Open AI Chat"
      >
        <BotIcon className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[calc(100%-2rem)] max-w-sm h-[70%] max-h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
      <header className="flex items-center justify-between p-3 border-b border-neutral-200 bg-neutral-50 rounded-t-2xl">
        <div className="flex items-center space-x-2">
            <BotIcon className="w-6 h-6 text-primary"/>
            <h3 className="font-bold text-lg text-neutral-800">AI Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-neutral-800">
          <XIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-2xl max-w-xs ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-neutral-100 text-neutral-800 rounded-bl-none'}`}>
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-neutral-200">
                        <h4 className="text-xs font-bold mb-1">Sources:</h4>
                        <ul className="text-xs space-y-1">
                            {msg.sources.map((source: any, i: number) => (
                                <li key={i}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">{source.title}</a></li>
                            ))}
                        </ul>
                    </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-neutral-100 text-neutral-800 rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      
      <div className="p-3 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
        <div className="flex items-center justify-center space-x-2 mb-2">
            <button onClick={() => setMode('chat')} className={`px-3 py-1 text-sm rounded-full ${mode === 'chat' ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-700'}`}>Chat</button>
            <button onClick={() => setMode('search')} className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${mode === 'search' ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-700'}`}><SearchIcon className="w-4 h-4"/><span>Search</span></button>
            <button onClick={() => setMode('thinking')} className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${mode === 'thinking' ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-700'}`}><BrainIcon className="w-4 h-4"/><span>Thinking</span></button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={
                mode === 'chat' ? 'Ask me anything...' :
                mode === 'search' ? 'Search with web grounding...' :
                'Ask a complex question...'
            }
            className="flex-1 p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading} className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-neutral-300">
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiChat;
