
import React from 'react';
import { Project } from '../types';

interface SidebarProps {
  currentProject: Project | null;
  onSelectProject: (p: Project) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentProject, onSelectProject }) => {
  return (
    <aside className="w-64 glass-panel border-r border-white/5 flex flex-col h-full hidden md:flex">
      <div className="p-6">
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
          <i className="fas fa-plus text-xs"></i>
          New Session
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-6">
        <div>
          <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recent</h3>
          <div className="space-y-1">
            {['Marketing Strategy', 'Web App UI Debug', 'Logo Concepts'].map((item, i) => (
              <button key={i} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3">
                <i className="far fa-message text-slate-600"></i>
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>

        {currentProject && (
          <div>
            <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Active Project</h3>
            <button 
              onClick={() => onSelectProject(currentProject)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-3"
            >
              <i className="fas fa-folder-open"></i>
              <span className="truncate font-medium">{currentProject.name}</span>
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
            SM
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Premium User</p>
            <p className="text-[10px] text-slate-500 truncate">srimanyu.premium@ai.com</p>
          </div>
          <i className="fas fa-ellipsis-v text-slate-600 text-xs"></i>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
