'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, PlayCircle, Heart, Share2, Instagram, Twitter, Youtube, CheckCircle } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

// In a real app we would fetch the artist by ID. For now mock data based on ID
const ARTIST_DATA = {
    id: '1',
    name: 'Aryan Kapoor',
    genre: 'Bollywood',
    location: 'Mumbai, India',
    followers: '24K',
    banner: 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=1200&h=400&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
    bio: 'Aryan Kapoor is an independent music producer and singer-songwriter based in Mumbai. Creating soulful Bollywood melodies combined with modern electronic beats, he has established a unique sound that resonates with thousands of listeners across the globe.',
    socials: { ig: '@aryanmusic', tw: '@aryansings', yt: 'AryanKapoorOfficial' },
    isPro: true,
};

const MOCK_TOP_SONGS = [
  { id: '1', title: 'Dil Ka Safar', duration: '3:45', plays: '482K', artUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop' },
  { id: '10', title: 'Ocean Waves', duration: '4:12', plays: '210K', artUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop' },
  { id: '3', title: 'Teri Yaadein', duration: '2:50', plays: '155K', artUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop' },
];

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
    const { playTrack } = usePlayerStore();
    const artist = ARTIST_DATA; // Mock

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto" style={{ paddingBottom: 64 }}>
            {/* Banner Header */}
            <div style={{ position: 'relative', height: 320, borderRadius: 16, overflow: 'hidden', marginBottom: 64 }}>
                <img src={artist.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                
                <div style={{ position: 'absolute', bottom: -40, left: 40, display: 'flex', alignItems: 'flex-end', gap: 24 }}>
                    <img src={artist.avatar} alt={artist.name} style={{ width: 140, height: 140, borderRadius: '50%', border: '4px solid white', background: 'white', objectFit: 'cover', zIndex: 10 }} />
                    <div style={{ paddingBottom: 48, color: 'white', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0 }}>{artist.name}</h1>
                            {artist.isPro && <CheckCircle fill="#2563eb" color="white" size={24} />}
                        </div>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 14, color: '#d1d5db', marginTop: 4 }}>
                            <span>{artist.genre}</span>
                            <span>•</span>
                            <span>{artist.location}</span>
                            <span>•</span>
                            <span><strong>{artist.followers}</strong> Followers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40, padding: '0 40px' }}>
                {/* Main Content (Left) */}
                <div>
                    {/* Action Bar */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
                        <button className="btn btn-primary" style={{ padding: '10px 32px', borderRadius: 24 }} onClick={() => playTrack({ id: '1', title: 'Dil Ka Safar', artist: artist.name, artUrl: MOCK_TOP_SONGS[0].artUrl })}>
                            Play Music
                        </button>
                        <button className="btn btn-outline" style={{ borderRadius: 24, padding: '10px 24px', borderColor: '#e5e7eb' }}>Follow</button>
                        <button className="btn btn-outline btn-icon" style={{ borderRadius: '50%', width: 42, height: 42, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: '#e5e7eb' }}><Share2 size={18} /></button>
                    </div>

                    {/* Top Tracks */}
                    <div style={{ marginBottom: 40 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Top Tracks</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {MOCK_TOP_SONGS.map((song, i) => (
                                <motion.div 
                                    key={song.id} 
                                    className="list-row" 
                                    style={{ display: 'grid', gridTemplateColumns: '40px 60px 1fr 100px 60px 40px', alignItems: 'center', padding: '8px 16px', background: 'white', borderRadius: 8, border: '1px solid #f3f4f6' }}
                                    whileHover={{ backgroundColor: '#f9fafb' }}
                                >
                                    <div style={{ color: '#9ca3af', fontSize: 14 }}>{i + 1}</div>
                                    <img src={song.artUrl} alt={song.title} style={{ width: 40, height: 40, borderRadius: 6 }} />
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{song.title}</div>
                                    <div style={{ color: '#6b7280', fontSize: 13 }}>{song.plays}</div>
                                    <div style={{ color: '#6b7280', fontSize: 13 }}>{song.duration}</div>
                                    <button className="btn btn-ghost btn-sm" style={{ color: '#9ca3af', padding: 4 }}><Heart size={16} /></button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>About</h2>
                        <p style={{ color: '#4b5563', lineHeight: 1.7, fontSize: 14 }}>{artist.bio}</p>
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div>
                    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Social Links</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#4b5563', textDecoration: 'none', fontSize: 14 }}><Instagram size={18} /> {artist.socials.ig}</a>
                            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#4b5563', textDecoration: 'none', fontSize: 14 }}><Twitter size={18} /> {artist.socials.tw}</a>
                            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#4b5563', textDecoration: 'none', fontSize: 14 }}><Youtube size={18} /> {artist.socials.yt}</a>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Contact / Bookings</h3>
                        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Send Message</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
