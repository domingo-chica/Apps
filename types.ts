import { Language } from './constants';

export interface Story {
  title: string;
  content: string;
}

export type Stories = {
  [key in Language]: Story;
};

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  preferences: {
    language: Language;
    playbackRate: number;
    voice: string;
  };
}
