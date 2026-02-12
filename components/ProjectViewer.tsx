
import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectViewerProps {
  project: Project;
}

const ProjectViewer: React.FC<ProjectViewerProps> = ({ project }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[70vh] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900/80 px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-indigo-400">{project.name}</h3>
          <p className="text-xs text-slate-500">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
            <i className="fas fa-download"></i>
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
            <i className="fas fa-play text-emerald-500"></i>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Browser */}
        <div className="w-64 border-r border-white/5 bg-slate-900/30 overflow-y-auto p-4 space-y-2">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Files</h4>
          {project.files.map((file, idx) => (
            <button
              key={idx}
              onClick={() => setActiveFileIndex(idx)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                activeFileIndex === idx ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <i className={`fas ${file.name.includes('.') ? 'fa-file-code' : 'fa-folder'} ${activeFileIndex === idx ? 'text-indigo-400' : 'text-slate-600'}`}></i>
              <span className="truncate">{file.name}</span>
            </button>
          ))}
        </div>

        {/* Code Editor Preview */}
        <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono border-b border-white/5">
            <span>{project.files[activeFileIndex].name}</span>
            <span>{project.files[activeFileIndex].language.toUpperCase()}</span>
          </div>
          <pre className="flex-1 p-6 overflow-auto custom-scrollbar font-mono text-sm leading-relaxed text-slate-300">
            <code>{project.files[activeFileIndex].content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ProjectViewer;
