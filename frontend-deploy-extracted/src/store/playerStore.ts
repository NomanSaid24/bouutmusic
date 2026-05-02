import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artUrl: string;
  audioUrl?: string;
  duration?: number;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  isLiked: boolean;
  isPlayerVisible: boolean;
  
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  setProgress: (p: number) => void;
  toggleLike: () => void;
  hidePlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 80,
  progress: 0,
  isLiked: false,
  isPlayerVisible: false,

  playTrack: (track) => set({ currentTrack: track, isPlaying: true, isPlayerVisible: true, progress: 0 }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  toggleLike: () => set((state) => ({ isLiked: !state.isLiked })),
  hidePlayer: () => set({ isPlayerVisible: false, isPlaying: false })
}));
