
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Source {
  title: string;
  url: string;
}

export interface MessageContent {
  type: 'text' | 'image' | 'video' | 'code' | 'file';
  text?: string;
  url?: string;
  language?: string;
  fileName?: string;
  sources?: Source[];
}

export interface Message {
  id: string;
  role: MessageRole;
  contents: MessageContent[];
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  files: ProjectFile[];
}

export interface ProjectFile {
  name: string;
  content: string;
  language: string;
}

export enum AssistantMode {
  CHAT = 'CHAT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  PROJECT = 'PROJECT',
  LIVE = 'LIVE'
}
