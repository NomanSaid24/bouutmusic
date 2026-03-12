'use client';
import Link from 'next/link';
import { Music, Disc3, TrendingUp, Star, Globe, Tv } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { Footer } from '@/components/Layout/Footer';

const MOCK_SONGS = [
  { id: '1', title: 'Dil Ka Safar', artist: 'Aryan Kapoor', artUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', plays: 482000 },
  { id: '2', title: 'Midnight Dreams', artist: 'Priya Singh', artUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', plays: 391000 },
  { id: '3', title: 'Electric Soul', artist: 'DJ Maverick', artUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop', plays: 278000 },
  { id: '4', title: 'Noor', artist: 'Raza Khan', artUrl: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=300&h=300&fit=crop', plays: 254000 },
  { id: '5', title: 'City Lights', artist: 'Zara Ahmed', artUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop', plays: 198000 },
];

const ARTISTS = [
  { id: '1', name: 'Aryan Kapoor', genre: 'Bollywood', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face' },
  { id: '2', name: 'Priya Singh', genre: 'Pop', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' },
  { id: '3', name: 'DJ Maverick', genre: 'EDM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
  { id: '4', name: 'Raza Khan', genre: 'Sufi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face' },
  { id: '5', name: 'Zara Ahmed', genre: 'R&B', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face' },
];

const SERVICES = [
  { icon: <Globe size={22} />, title: 'Music Distribution', desc: 'Release your music on Spotify, Apple Music, and 150+ platforms worldwide.' },
  { icon: <TrendingUp size={22} />, title: 'Promotion & Marketing', desc: 'Boost your fanbase with targeted campaigns and playlist placements.' },
  { icon: <Star size={22} />, title: 'Artist Analytics', desc: 'Track your streams, revenue, and audience growth in real-time.' },
  { icon: <Tv size={22} />, title: 'Broadcast on TV', desc: 'Get your music video featured on music TV channels across India.' },
  { icon: <Music size={22} />, title: 'Demo Review', desc: 'Get professional feedback on your tracks from industry experts.' },
  { icon: <Disc3 size={22} />, title: 'Opportunities', desc: 'Access radio plays, gigs, and publication contests.' },
];

function SongCard({ song }: { song: typeof MOCK_SONGS[0] }) {
  const { playTrack } = usePlayerStore();
  return (
    <motion.div 
      className="card song-card"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <div className="song-card-art-wrapper">
        <img className="song-card-art" src={song.artUrl} alt={song.title} />
        <div className="song-card-play-overlay" onClick={() => playTrack({ id: song.id, title: song.title, artist: song.artist, artUrl: song.artUrl })}>
          <button className="play-btn-circle">▶</button>
        </div>
      </div>
      <div className="song-card-info">
        <div className="song-card-title">{song.title}</div>
        <div className="song-card-artist">{song.artist}</div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Hero */}
      <div className="hero">
        <motion.div className="hero-left" variants={itemVariants}>
          <div className="hero-label">The Power Of</div>
          <h1 className="hero-title">Music Business<br />Administration</h1>
          <p className="hero-desc">Put your music career on the fast lane. <strong>Promote, distribute</strong> and <strong>monetize</strong> with Bouut Music.</p>
          <Link href="/dashboard" className="btn btn-outline btn-lg" style={{ display: 'inline-flex', width: 'fit-content' }}>
            Join For Free
          </Link>
          <div className="hero-artists">
            <div className="hero-avatars">
              {ARTISTS.slice(0, 4).map(a => (
                <img key={a.id} className="hero-avatar" src={a.avatar} alt={a.name} />
              ))}
            </div>
            <div className="hero-count" style={{ width: 36, height: 36, marginLeft: 8 }}>70K+</div>
            <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8 }}>Artists trust us</span>
          </div>
        </motion.div>
        <motion.div className="hero-right" variants={itemVariants}>
          <img
            src="https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=600&h=500&fit=crop"
            alt="Artist performing"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(230,57,70,0.8)', mixBlendMode: 'multiply' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '50%', width: 200, height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#d4af37', lineHeight: 1.2 }}>THE MUSIC<br />BUSINESS<br />ADMINISTRATORS</div>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: 3, marginTop: 8, fontWeight: 800, fontSize: 13 }}>bOUUT MUSIC</div>
          </div>
        </motion.div>
      </div>

      {/* Services */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Everything You Need</div>
            <div className="section-subtitle">All tools to grow your music career in one place</div>
          </div>
        </div>
        <motion.div className="service-cards" variants={containerVariants}>
          {SERVICES.map(s => (
            <motion.div key={s.title} className="service-card" variants={itemVariants} whileHover={{ y: -8 }}>
              <div className="service-card-icon">{s.icon}</div>
              <div className="service-card-title">{s.title}</div>
              <div className="service-card-desc">{s.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recommended Songs */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Recommended Songs</div>
            <div className="section-subtitle">New releases selected by the editorial team for you</div>
          </div>
          <Link href="/songs" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <motion.div className="cards-grid-5" variants={containerVariants}>
          {MOCK_SONGS.map(song => <SongCard key={song.id} song={song} />)}
        </motion.div>
      </div>

      {/* Featured Artists */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Featured Artists</div>
            <div className="section-subtitle">Discover talented independent musicians</div>
          </div>
          <Link href="/artists" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <motion.div className="cards-grid-5" variants={containerVariants}>
          {ARTISTS.map(a => (
            <motion.div key={a.id} variants={itemVariants} whileHover={{ y: -8 }}>
              <Link href={`/artists/${a.id}`} className="card artist-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                <img className="artist-avatar" src={a.avatar} alt={a.name} />
                <div className="artist-name">{a.name}</div>
                <div className="artist-genre">{a.genre}</div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
}
