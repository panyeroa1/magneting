
import { GoogleGenAI, Modality, Type, GenerateContentResponse, LiveSession } from '@google/genai';

// This file assumes process.env.API_KEY is available in the environment.
// In a real CRA or Vite app, this would be configured via .env files.
// For this example, we'll use a placeholder.
const API_KEY = process.env.API_KEY || 'YOUR_API_KEY_HERE';

let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI. Please check your API key.", error);
  // Provide a mock implementation to prevent the app from crashing.
  ai = {
    models: {
      generateContent: () => Promise.resolve({ text: "Gemini API is not configured." } as GenerateContentResponse),
      generateContentStream: async function*() {
        yield { text: "Gemini API is not configured." } as GenerateContentResponse;
      },
    },
    live: {
        connect: () => Promise.reject("Gemini API not configured")
    }
  } as unknown as GoogleGenAI;
}


// --- Utility Functions for Audio ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
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


// --- API Service Functions ---

export const geminiService = {
  getChatResponse: async (prompt: string) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Gemini chat error:', error);
      return 'Sorry, I encountered an error.';
    }
  },

  getChatResponseStream: async (prompt: string) => {
    try {
        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response;
    } catch (error) {
      console.error('Gemini stream chat error:', error);
      throw new Error('Failed to start chat stream.');
    }
  },

  analyzeVideoForKeyInformation: async (videoFrameAsBase64: string) => {
    try {
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: videoFrameAsBase64,
        },
      };
      const textPart = {
        text: 'Analyze this video frame from a training session. Identify key topics, objects, and concepts being presented. Provide a concise summary.'
      };
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [imagePart, textPart] },
      });
      return response.text;
    } catch (error) {
      console.error('Gemini video analysis error:', error);
      return 'Could not analyze the video.';
    }
  },
  
  editImageWithPrompt: async (imageBase64: string, mimeType: string, prompt: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: imageBase64, mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data; // new base64 image string
            }
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error('Gemini image edit error:', error);
        throw new Error('Failed to edit image.');
    }
  },

  textToSpeech: async (text: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say this with a clear and engaging tone: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data returned.");

        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
        
        const source = outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContext.destination);
        source.start();

    } catch (error) {
        console.error('Gemini TTS error:', error);
        alert('Failed to generate speech.');
    }
  },

  getGroundedResponse: async (prompt: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];

      return { text: response.text, sources };

    } catch(error) {
      console.error('Gemini search grounding error:', error);
      return { text: 'Sorry, I couldn\'t search for that right now.', sources: [] };
    }
  },
  
  getComplexResponseWithThinking: async (prompt: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: { 
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
      return response.text;
    } catch (error) {
      console.error('Gemini thinking mode error:', error);
      return 'An error occurred while processing your complex request.';
    }
  },

  connectLiveSession: async (callbacks: {
    onopen: () => void;
    onmessage: (message: any) => void;
    onerror: (e: any) => void;
    onclose: (e: any) => void;
  }): Promise<LiveSession> => {
     try {
       const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: 'You are a friendly and helpful AI Tutor on the Manetar platform. Keep your responses concise and encouraging.',
        },
       });
       return sessionPromise;
     } catch(error) {
        console.error('Gemini Live API connection error:', error);
        throw new Error('Failed to connect to Live session.');
     }
  }

};