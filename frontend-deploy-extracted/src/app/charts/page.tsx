import Link from 'next/link';
import { Play } from 'lucide-react';

const SONGS = Array.from({ length: 50 }, (_, i) => ({
    id: String(i + 1),
    title: ['Dil Ka Safar', 'Midnight Dreams', 'Electric Soul', 'Noor', 'City Lights', 'Tere Bina', 'Pahadi Echoes', 'Street Code', 'Bass Drop', 'Meri Kahani'][i % 10],
    artist: ['Aryan Kapoor', 'Priya Singh', 'DJ Maverick', 'Raza Khan', 'Zara Ahmed'][i % 5],
    artUrl: `https://images.unsplash.com/photo-${['1493225457124-a3eb161ffa5f', '1470225620780-dba8ba36b745', '1511671782779-c97d3d27a1d4', '1487215078519-e21cc028cb29', '1514320291840-2e0a9bf2a9ae', '1571330735066-03aaa9429d89', '1508700115892-45ecd05ae2ad', '1598387993281-cecf8b71a8f8', '1445985543470-41fba5c3144a', '1516450360452-9312f5e86fc7'][i % 10]}?w=80&h=80&fit=crop`,
    plays: Math.floor((500000 / (i + 1)) * (0.8 + Math.random() * 0.4)),
    genre: ['Bollywood', 'Pop', 'EDM', 'Sufi', 'R&B', 'Rock', 'Folk', 'Hip-Hop', 'Electronic', 'Indie'][i % 10],
}));

function formatPlays(n: number) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
}

export default function ChartsPage() {
    return (
        <div>
            <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> Charts</div>
            <div className="page-header">
                <h1 className="page-title">Charts</h1>
                <div className="filter-bar">
                    <select className="filter-select"><option>All Genres</option></select>
                    <select className="filter-select"><option>All Languages</option></select>
                </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                {SONGS.slice(0, 50).map((song, idx) => (
                    <div key={song.id} className="chart-row" style={{ padding: '12px 20px' }}>
                        <div className="chart-rank" style={{ color: idx < 3 ? 'var(--primary)' : '#9ca3af' }}>
                            {(idx + 1).toString().padStart(2, '0')}
                        </div>
                        <img className="chart-art" src={song.artUrl} alt={song.title} />
                        <div className="chart-info">
                            <div className="chart-title">{song.title}</div>
                            <div className="chart-artist">{song.artist} · {song.genre}</div>
                        </div>
                        <div className="chart-plays">{formatPlays(song.plays)} plays</div>
                        <button className="play-btn-circle" style={{ width: 32, height: 32, marginLeft: 8 }}>
                            <Play size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
