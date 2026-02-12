
import React from 'react';
import { AssistantMode } from '../types';

interface ModeSelectorProps {
  currentMode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    { id: AssistantMode.CHAT, icon: 'fa-comment-alt', label: 'Chat' },
    { id: AssistantMode.IMAGE, icon: 'fa-image', label: 'Vision' },
    { id: AssistantMode.VIDEO, icon: 'fa-film', label: 'Motion' },
    { id: AssistantMode.PROJECT, icon: 'fa-diagram-project', label: 'Builder' },
    { id: AssistantMode.LIVE, icon: 'fa-microphone', label: 'Live' },
  ];

  return (
    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentMode === mode.id
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <i className={`fas ${mode.icon}`}></i>
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;
