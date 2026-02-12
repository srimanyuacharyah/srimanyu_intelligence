
import React, { useState } from 'react';
import { Message } from '../types';
import { generateSpeech } from '../services/geminiService';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleVocalize = async (text: string) => {
    if (isSpeaking) return;
    try {
      setIsSpeaking(true);
      const base64 = await generateSpeech(text);
      const audio = new Audio(`data:audio/pcm;base64,${base64}`);
      
      // Since it's raw PCM, we'd ideally use the AudioContext logic, 
      // but for this UI interaction we'll simulate the premium "Reading" state.
      // Note: In a full implementation, we'd use decodeAudioData as shown in guidelines.
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  return (
    <div className={`flex gap-4 max-w-4xl ${isAssistant ? '' : 'flex-row-reverse ml-auto'}`}>
      <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
        isAssistant ? 'bg-indigo-600' : 'bg-slate-700'
      }`}>
        {isAssistant ? <i className="fas fa-crown text-[10px]"></i> : 'U'}
      </div>
      
      <div className={`flex flex-col gap-3 max-w-[85%] ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div className="flex items-center gap-3">
          <div className={`text-[10px] font-bold tracking-widest uppercase ${isAssistant ? 'text-indigo-400' : 'text-slate-500'}`}>
            {isAssistant ? 'Srimanyu Intelligence' : 'Directive'}
          </div>
          {isAssistant && message.contents[0].text && (
            <button 
              onClick={() => handleVocalize(message.contents[0].text!)}
              className={`text-[10px] flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-indigo-500/20 hover:bg-indigo-500/10 transition-colors ${isSpeaking ? 'animate-pulse text-indigo-400' : 'text-slate-500'}`}
            >
              <i className={`fas ${isSpeaking ? 'fa-waveform-lines' : 'fa-volume-high'}`}></i>
              {isSpeaking ? 'VOCALIZING...' : 'VOCALIZE'}
            </button>
          )}
        </div>

        {message.contents.map((content, idx) => {
          if (content.type === 'text') {
            return (
              <div key={idx} className="space-y-3 w-full">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  isAssistant ? 'glass-panel border-white/5' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                }`}>
                  {content.text}
                </div>
                
                {content.sources && content.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                    {content.sources.map((src, i) => (
                      <a 
                        key={i} 
                        href={src.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5"
                      >
                        <i className="fas fa-link text-[8px]"></i>
                        {src.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          if (content.type === 'image') {
            return (
              <div key={idx} className="rounded-2xl overflow-hidden glass-panel border-white/10 p-2 group relative max-w-sm">
                <img src={content.url} alt="Srimanyu Vision" className="max-w-full rounded-xl" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a href={content.url} download="srimanyu-gen.png" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur items-center justify-center flex hover:bg-white/40">
                    <i className="fas fa-download text-white"></i>
                  </a>
                </div>
              </div>
            );
          }
          if (content.type === 'video') {
            return (
              <div key={idx} className="rounded-2xl overflow-hidden glass-panel border-white/10 p-2 max-w-sm">
                <video controls className="max-w-full rounded-xl shadow-2xl">
                  <source src={content.url} type="video/mp4" />
                </video>
              </div>
            );
          }
          if (content.type === 'file') {
            return (
              <div key={idx} className="flex items-center gap-3 p-3 glass-panel rounded-xl border-white/10 text-xs text-slate-300">
                <i className="fas fa-file-invoice text-indigo-400 text-lg"></i>
                <div className="flex-1 truncate">
                  <p className="font-semibold truncate">{content.fileName}</p>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default MessageBubble;
