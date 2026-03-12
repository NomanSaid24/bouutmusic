import Link from 'next/link';

const ARTISTS = Array.from({ length: 15 }, (_, i) => ({
    id: String(i + 1),
    name: ['Aryan Kapoor', 'Priya Singh', 'DJ Maverick', 'Meera Nair', 'Raza Khan', 'Zara Ahmed', 'Dev Sharma', 'Asha Verma', 'Farhan Ali', 'Noor Fatima', 'Vikram Das', 'Laila Hussain', 'Noman Said', 'Kiran Rao', 'Sanya Malhotra'][i],
    genre: ['Bollywood', 'Pop', 'EDM', 'Folk', 'Sufi', 'R&B', 'Rock', 'Classical', 'Hip-Hop', 'Jazz', 'Indie', 'Punjabi', 'Pop', 'R&B', 'Folk'][i],
    isPro: i < 5,
    followers: Math.floor(Math.random() * 50000),
    avatar: `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1517841905240-472988babdf9', '1500648767791-00dcc994a43e', '1438761681033-6461ffad8d80', '1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1517841905240-472988babdf9', '1500648767791-00dcc994a43e', '1438761681033-6461ffad8d80', '1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d'][i]}?w=200&h=200&fit=crop&crop=face`,
}));

export default function ArtistsPage() {
    return (
        <div>
            <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> Artists</div>
            <div className="page-header">
                <h1 className="page-title">Artists</h1>
            </div>
            <div className="tabs">
                {['ALL', 'TRENDING', 'NEW'].map(t => <button key={t} className={`tab ${t === 'ALL' ? 'active' : ''}`}>{t}</button>)}
            </div>
            <div className="cards-grid-5">
                {ARTISTS.map(a => (
                    <Link key={a.id} href={`/artists/${a.id}`} className="card artist-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
                            <img className="artist-avatar" src={a.avatar} alt={a.name} />
                            {a.isPro && <span className="pro-badge" style={{ position: 'absolute', bottom: 8, right: -4 }}>PRO</span>}
                        </div>
                        <div className="artist-name" style={{ marginTop: 6 }}>{a.name}</div>
                        <div className="artist-genre">{a.genre}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{a.followers.toLocaleString()} followers</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
