'use client';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useEffect, useRef } from 'react';

export function MusicPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    progress, 
    isLiked, 
    togglePlay, 
    toggleLike,
    setProgress 
  } = usePlayerStore();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // If there's no track right now, don't crash but show empty placeholder or null
  if (!currentTrack) return null;

  return (
    <div className="app-player" style={{ justifyContent: 'space-between', width: '100%' }}>
      {/* Left: Art & Track Info */}
      <div className="player-track" style={{ flex: 1, minWidth: 200 }}>
        <img className="player-art" src={currentTrack.artUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop'} alt={currentTrack.title} />
        <div className="player-info">
          <div className="player-title">{currentTrack.title}</div>
          <div className="player-artist">{currentTrack.artist}</div>
        </div>
        <button 
          className="btn btn-ghost btn-sm" 
          style={{ marginLeft: 8, color: isLiked ? '#ef4444' : '#6b7280' }}
          onClick={toggleLike}
        >
          <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} />
        </button>
      </div>
      
      {/* Center: Playback Controls */}
      <div className="player-controls" style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
        <div className="player-buttons" style={{ gap: 24 }}>
          <button className="player-btn"><SkipBack size={20} fill="#6b7280" /></button>
          <button className="player-btn" onClick={togglePlay}>
            {isPlaying ? <Pause size={24} fill="#6b7280" /> : <Play size={24} fill="#6b7280" style={{ marginLeft: 2 }} />}
          </button>
          <button className="player-btn"><SkipForward size={20} fill="#6b7280" /></button>
        </div>
      </div>
      
      {/* Right: Seek Bar & Tools */}
      <div className="player-right" style={{ flex: 1, minWidth: 200, justifyContent: 'flex-end', gap: 16 }}>
        <button className="player-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>
        <Volume2 size={20} style={{ color: '#6b7280' }} />
        <div className="player-seek" style={{ width: 140 }}>
          <div className="player-seek-fill" style={{ width: `${progress}%`, position: 'relative', background: 'var(--primary)' }}>
            <div style={{ position: 'absolute', right: -6, top: -4, width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
          <span>00:00</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span>-04:57</span>
        </div>
      </div>
    </div>
  );
}
