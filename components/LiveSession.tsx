import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/gemini';
import { LiveSession as GeminiLiveSession, LiveServerMessage } from '@google/genai';

interface LiveSessionProps {
    onClose: () => void;
}

const XIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}


export const LiveSession: React.FC<LiveSessionProps> = ({ onClose }) => {
    const [status, setStatus] = useState('connecting');
    const [transcription, setTranscription] = useState<{user: string, model: string}[]>([]);
    const [currentTurn, setCurrentTurn] = useState({user: '', model: ''});
    
    // Ref to hold the current turn data to avoid stale closures in callbacks.
    const currentTurnRef = useRef({user: '', model: ''});

    const sessionRef = useRef<GeminiLiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    useEffect(() => {
        let sessionPromise: Promise<GeminiLiveSession>;
        let nextStartTime = 0;

        const connect = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('getUserMedia not supported on your browser!');
                }
                setStatus('initializing');
                mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                
                sessionPromise = geminiService.connectLiveSession({
                    onopen: () => {
                        setStatus('connected');
                        const source = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                        scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (event) => {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) { int16[i] = inputData[i] * 32768; }
                            const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
                            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         if (message.serverContent?.inputTranscription) {
                            const newText = currentTurnRef.current.user + message.serverContent.inputTranscription.text;
                            currentTurnRef.current.user = newText;
                            setCurrentTurn(prev => ({...prev, user: newText}));
                        }
                        if (message.serverContent?.outputTranscription) {
                            const newText = currentTurnRef.current.model + message.serverContent.outputTranscription.text;
                            currentTurnRef.current.model = newText;
                            setCurrentTurn(prev => ({...prev, model: newText}));
                        }
                        if (message.serverContent?.turnComplete) {
                            // Use the ref to get the latest value, then update state and reset.
                            setTranscription(prev => [...prev, currentTurnRef.current]);
                            currentTurnRef.current = {user: '', model: ''};
                            setCurrentTurn({user: '', model: ''});
                        }
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (audioData) {
                             const outCtx = outputAudioContextRef.current!;
                             nextStartTime = Math.max(nextStartTime, outCtx.currentTime);
                             const audioBuffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
                             const source = outCtx.createBufferSource();
                             source.buffer = audioBuffer;
                             source.connect(outCtx.destination);
                             source.start(nextStartTime);
                             nextStartTime += audioBuffer.duration;
                        }
                    },
                    onclose: () => setStatus('closed'),
                    onerror: (e) => { console.error(e); setStatus('error'); }
                });
                sessionRef.current = await sessionPromise;
            } catch (error) {
                console.error("Failed to start live session:", error);
                setStatus('error');
            }
        };

        connect();

        return () => {
            sessionRef.current?.close();
            mediaStreamRef.current?.getTracks().forEach(track => track.stop());
            scriptProcessorRef.current?.disconnect();
            audioContextRef.current?.close();
            outputAudioContextRef.current?.close();
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg h-[90vh] max-h-[700px] rounded-2xl flex flex-col">
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">Live AI Tutor</h2>
                    <button onClick={onClose}><XIcon /></button>
                </header>
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="text-center p-2 rounded-lg bg-neutral-100 text-neutral-600 font-medium mb-4">
                        Status: <span className="font-bold">{status}</span>
                    </div>
                    <div className="space-y-4">
                        {transcription.map((turn, index) => (
                           <div key={index} className="pb-2 mb-2 border-b border-neutral-100">
                               <p className="text-sm text-blue-600 font-semibold">You: <span className="font-normal text-neutral-800">{turn.user}</span></p>
                               <p className="text-sm text-purple-600 font-semibold">Tutor: <span className="font-normal text-neutral-800">{turn.model}</span></p>
                           </div>
                        ))}
                        { (currentTurn.user || currentTurn.model) && 
                            <div>
                               <p className="text-sm text-blue-600 font-semibold">You: <span className="font-normal text-neutral-800">{currentTurn.user}</span></p>
                               <p className="text-sm text-purple-600 font-semibold">Tutor: <span className="font-normal text-neutral-800">{currentTurn.model}</span></p>
                           </div>
                        }
                    </div>
                </div>
                <footer className="p-4 border-t text-center">
                    <p className="text-sm text-neutral-500">
                        {status === 'connected' ? 'Your microphone is active. Start speaking to the AI tutor.' : 'Please wait...'}
                    </p>
                </footer>
            </div>
        </div>
    );
};
