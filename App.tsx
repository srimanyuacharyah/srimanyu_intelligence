
import React, { useState, useRef, useEffect } from 'react';
import { AssistantMode, Message, Project, MessageContent } from './types';
import { generateText, generateImage, generateVideo, createProject } from './services/geminiService';

// Components
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import ProjectViewer from './components/ProjectViewer';
import ModeSelector from './components/ModeSelector';
import LiveSession from './components/LiveSession';

const App: React.FC = () => {
  const [mode, setMode] = useState<AssistantMode>(AssistantMode.CHAT);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      const hasKey = await window.aistudio?.hasSelectedApiKey();
      setApiKeyReady(!!hasKey);
    };
    checkApiKey();
    const interval = setInterval(checkApiKey, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = async (text: string, files: File[]) => {
    if (!text.trim() && files.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      contents: [{ type: 'text', text }],
      timestamp: Date.now(),
    };

    for (const file of files) {
      userMessage.contents.push({
        type: 'file',
        fileName: file.name,
        url: URL.createObjectURL(file)
      });
    }

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let assistantContent: MessageContent[] = [];

      switch (mode) {
        case AssistantMode.CHAT:
          const textRes = await generateText(text);
          assistantContent = [{ 
            type: 'text', 
            text: textRes.text, 
            sources: textRes.sources 
          }];
          break;

        case AssistantMode.IMAGE:
          const imageUrl = await generateImage(text);
          assistantContent = [
            { type: 'text', text: `Visualized: "${text}"` },
            { type: 'image', url: imageUrl }
          ];
          break;

        case AssistantMode.VIDEO:
          const videoUrl = await generateVideo(text);
          assistantContent = [
            { type: 'text', text: `Synthesized Motion: "${text}"` },
            { type: 'video', url: videoUrl }
          ];
          break;

        case AssistantMode.PROJECT:
          const projectData = await createProject(text);
          setCurrentProject(projectData);
          assistantContent = [
            { type: 'text', text: `Architecture Complete: **${projectData.name}**` },
            { type: 'text', text: projectData.description }
          ];
          break;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        contents: assistantContent,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        contents: [{ type: 'text', text: `System Alert: ${error.message || 'A neural interruption occurred.'}` }],
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (error.message?.includes("Requested entity was not found")) {
        // @ts-ignore
        await window.aistudio?.openSelectKey();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100">
      <Sidebar 
        currentProject={currentProject} 
        onSelectProject={(p) => { setCurrentProject(p); setMode(AssistantMode.PROJECT); }}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <header className="h-20 flex items-center justify-between px-8 glass-panel border-b border-white/5 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <i className="fas fa-crown text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">
                SRIMANYU <span className="text-indigo-400 font-light">INTELLIGENCE</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Premium Assistant v2.5</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <ModeSelector currentMode={mode} onModeChange={setMode} />
            <button 
              onClick={async () => {
                 // @ts-ignore
                 await window.aistudio?.openSelectKey();
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                apiKeyReady 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500 text-white shadow-xl shadow-amber-500/20 hover:scale-105'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${apiKeyReady ? 'bg-emerald-400 animate-pulse' : 'bg-white'}`}></div>
              {apiKeyReady ? 'KEY ACTIVE' : 'CONNECT API KEY'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 pb-32 z-10">
          {mode === AssistantMode.LIVE ? (
            <LiveSession />
          ) : mode === AssistantMode.PROJECT && currentProject ? (
            <div className="max-w-6xl mx-auto w-full">
               <ProjectViewer project={currentProject} />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-[2rem] bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                  <i className="fas fa-sparkles text-5xl text-indigo-400"></i>
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/20 animate-bounce">
                  <i className="fas fa-microchip text-violet-400"></i>
                </div>
              </div>

              <div>
                <h2 className="text-6xl font-black mb-6 tracking-tighter gradient-text leading-tight uppercase">Beyond AI.<br/>Srimanyu Intelligence.</h2>
                <p className="text-slate-400 text-xl font-medium leading-relaxed">
                  The ultimate directive for code, synthesis, and deep reasoning.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {[
                  { icon: 'fa-layer-group', title: 'Neural Grounding', desc: 'Real-time web verification', color: 'text-indigo-400' },
                  { icon: 'fa-wand-magic-sparkles', title: 'Creative Motion', desc: 'Veo-powered synthesis', color: 'text-purple-400' },
                  { icon: 'fa-brain-circuit', title: 'Architect Mode', desc: 'Full project generation', color: 'text-blue-400' },
                  { icon: 'fa-waveform-lines', title: 'Live Interface', desc: 'Real-time neural link', color: 'text-emerald-400' },
                ].map((item, idx) => (
                  <div key={idx} className="glass-panel p-6 rounded-2xl text-left hover:bg-white/5 transition-all hover:-translate-y-1 border border-white/5 group">
                    <i className={`fas ${item.icon} ${item.color} text-2xl mb-4 group-hover:scale-110 transition-transform`}></i>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 w-full">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex gap-6 max-w-3xl animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20">
                    <i className="fas fa-circle-notch fa-spin text-indigo-400 text-xs"></i>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="h-3 bg-slate-800 rounded-full w-1/4"></div>
                    <div className="h-3 bg-slate-800 rounded-full w-3/4"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {mode !== AssistantMode.LIVE && (
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent z-20">
            <div className="max-w-4xl mx-auto">
              <ChatInput onSend={handleSend} disabled={isLoading} mode={mode} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
