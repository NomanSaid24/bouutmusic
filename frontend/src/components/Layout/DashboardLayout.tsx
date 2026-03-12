'use client';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { MusicPlayer } from '@/components/Layout/MusicPlayer';
import { ReactNode } from 'react';
import { usePlayerStore } from '@/store/playerStore';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isPlayerVisible } = usePlayerStore();
  
  const showPlayer = isPlayerVisible || pathname?.startsWith('/playlists');

  return (
    <div className={`app-layout ${showPlayer ? 'has-player' : ''}`}>
      <Sidebar />
      <Header />
      <main className="main-content">
        {children}
      </main>
      {showPlayer && <MusicPlayer />}
    </div>
  );
}
