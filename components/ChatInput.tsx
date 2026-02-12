
import React, { useState, useRef } from 'react';
import { AssistantMode } from '../types';

interface ChatInputProps {
  onSend: (text: string, files: File[]) => void;
  disabled: boolean;
  mode: AssistantMode;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, mode }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    onSend(text, files);
    setText('');
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const modePlaceholders = {
    [AssistantMode.CHAT]: "Ask Srimanyu anything...",
    [AssistantMode.IMAGE]: "Describe the image you want Srimanyu to create...",
    [AssistantMode.VIDEO]: "Describe the cinematic scene for video synthesis...",
    [AssistantMode.PROJECT]: "Describe the software project structure you need...",
    [AssistantMode.LIVE]: ""
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {files.length > 0 && (
        <div className="absolute bottom-full mb-3 left-0 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="glass-panel px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 border border-white/10 animate-bounce">
              <i className="fas fa-file text-indigo-400"></i>
              <span className="max-w-[100px] truncate">{f.name}</span>
              <button 
                type="button" 
                onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                className="hover:text-red-400"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel rounded-2xl p-2 flex items-end gap-2 border border-white/10 focus-within:border-indigo-500/50 transition-all shadow-2xl">
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <i className="fas fa-paperclip text-lg"></i>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          onChange={handleFileChange}
        />
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={modePlaceholders[mode]}
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 py-3 resize-none max-h-48 custom-scrollbar text-sm"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <button 
          type="submit"
          disabled={disabled || (!text.trim() && files.length === 0)}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            text.trim() || files.length > 0
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-105'
              : 'bg-slate-800 text-slate-500'
          }`}
        >
          <i className="fas fa-paper-plane text-sm"></i>
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-500 mt-2">
        Srimanyu can generate text, images, videos and code. Results may vary by model complexity.
      </p>
    </form>
  );
};

export default ChatInput;
