import Link from 'next/link';

const MY_SONGS = [
    { id: '1', title: 'Dil Ka Safar', status: 'APPROVED', plays: 0, artUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop', uploadedAt: 'Mar 10, 2026' },
];

export default function MyReleasesPage() {
    return (
        <div>
            <div className="breadcrumb"><Link href="/dashboard">Home</Link><span>/</span> My Releases</div>
            <div className="page-header">
                <h1 className="page-title">My Music</h1>
                <Link href="/dashboard/release/create" className="btn btn-primary">+ Upload Song</Link>
            </div>

            <div className="tabs">
                {['Releases', 'Uploads'].map(t => <button key={t} className={`tab ${t === 'Releases' ? 'active' : ''}`}>{t}</button>)}
            </div>

            {MY_SONGS.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No songs yet</div>
                    <div style={{ fontSize: 13, marginBottom: 20 }}>Upload your first song to start distributing your music</div>
                    <Link href="/dashboard/release/create" className="btn btn-primary">Upload Your First Song</Link>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>#</th><th>Song</th><th>Status</th><th>Plays</th><th>Uploaded</th><th>Actions</th></tr></thead>
                        <tbody>
                            {MY_SONGS.map((song, i) => (
                                <tr key={song.id}>
                                    <td style={{ color: '#9ca3af', width: 40 }}>{i + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <img src={song.artUrl} alt={song.title} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                                            <span style={{ fontWeight: 600 }}>{song.title}</span>
                                        </div>
                                    </td>
                                    <td><span className={`badge badge-${song.status === 'APPROVED' ? 'green' : song.status === 'REJECTED' ? 'red' : 'yellow'}`}>{song.status}</span></td>
                                    <td>{song.plays.toLocaleString()}</td>
                                    <td style={{ color: '#6b7280' }}>{song.uploadedAt}</td>
                                    <td><button className="btn btn-ghost btn-sm">Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
