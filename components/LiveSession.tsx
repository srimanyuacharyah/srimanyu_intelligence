
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

// Helper functions for base64 encoding/decoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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

const LiveSession: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [status, setStatus] = useState("Ready to Link");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    try {
      setStatus("Initializing Srimanyu Voice...");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      
      const outNode = outputCtx.createGain();
      outNode.connect(outputCtx.destination);
      outputNodeRef.current = outNode;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus("Link Established");
            setIsActive(true);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const ctx = audioContextRef.current!;
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current!);
              
              source.addEventListener('ended', () => {
                activeSourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              activeSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev.slice(-4), `Srimanyu: ${text}`]);
            }
          },
          onerror: (e) => {
            console.error("Live session error:", e);
            setStatus("Connection Error");
            setIsActive(false);
          },
          onclose: () => {
            setIsActive(false);
            setStatus("Session Closed");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are Srimanyu. You are in a real-time voice session. Keep your responses concise and helpful.',
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus("Hardware Error");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setIsActive(false);
    setStatus("Ready to Link");
    setTranscription([]);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-700">
      <div className="relative group">
        <div className={`w-56 h-56 rounded-full flex items-center justify-center transition-all duration-700 ${
          isActive 
            ? 'bg-indigo-500/10 shadow-[0_0_100px_rgba(99,102,241,0.4)]' 
            : 'bg-slate-800'
        }`}>
          <div className={`w-36 h-36 rounded-full border-2 border-indigo-400/50 flex items-center justify-center ${isActive ? 'animate-pulse' : ''}`}>
             <div className={`w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center ${isActive ? 'animate-ping' : ''}`}></div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <i className={`fas ${isActive ? 'fa-signal-stream' : 'fa-microphone'} text-5xl text-indigo-400`}></i>
          </div>
        </div>

        {isActive && (
          <div className="absolute -inset-8 pointer-events-none">
            <div className="w-full h-full rounded-full border border-indigo-500/10 animate-spin-slow"></div>
          </div>
        )}
      </div>

      <div className="text-center max-w-lg space-y-4">
        <h2 className="text-4xl font-black tracking-tight gradient-text">{isActive ? 'NEURAL LINK ACTIVE' : 'VOICE INTERFACE'}</h2>
        <p className="text-slate-400 font-medium">
          {status}
        </p>
      </div>

      <div className="w-full max-w-2xl h-32 glass-panel rounded-2xl p-6 flex flex-col justify-end space-y-1 overflow-hidden">
        {transcription.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 italic text-sm font-mono tracking-widest">
            ...WAITING FOR INPUT...
          </div>
        ) : (
          transcription.map((t, i) => (
            <p key={i} className="text-xs font-mono text-indigo-300 opacity-80 truncate">
              {t}
            </p>
          ))
        )}
      </div>

      <button 
        onClick={isActive ? stopSession : startSession}
        className={`px-12 py-5 rounded-2xl font-black tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${
          isActive 
            ? 'bg-red-500 text-white shadow-red-500/40' 
            : 'bg-indigo-600 text-white shadow-indigo-600/40'
        }`}
      >
        {isActive ? 'DISCONNECT' : 'INITIALIZE LINK'}
      </button>
    </div>
  );
};

export default LiveSession;
