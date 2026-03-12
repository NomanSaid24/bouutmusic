'use client';
import { Play } from 'lucide-react';

export default function PlaylistsPage() {
  const dummyPlaylists = [
    { title: 'Indie Picks', tracks: 42, art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
    { title: 'Acoustic Evenings', tracks: 18, art: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=400&h=400&fit=crop' },
    { title: 'Rock Anthems', tracks: 55, art: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop' },
    { title: 'Electronic Vibes', tracks: 30, art: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
    { title: 'Sufi Soul', tracks: 25, art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
    { title: 'Late Night Lo-Fi', tracks: 60, art: 'https://images.unsplash.com/photo-1516280440502-6110f0322b07?w=400&h=400&fit=crop' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <button className="btn btn-outline" style={{ borderRadius: 24, padding: '8px 32px', border: '1px solid #e5e7eb', color: 'var(--primary)', fontWeight: 600 }}>Load More</button>
      </div>
      
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#6b7280', marginBottom: 24 }}>Music Playlist - Discovery of old and new songs</h1>
      
      <div style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.8, marginBottom: 40 }}>
        <p style={{ marginBottom: 16 }}>
          Music playlists are becoming an integral part of the listening pattern of music lovers. There are a few important reasons for this trend. Music listening is usually a passive activity. That implies that most people do not want to make extra effort to search for old and new songs - Songs which are of their liking. This becomes more important in case of new music by new artists who are not known. Hence, people do not even know how to search for them. If a song or video is popular and artist or band is well known (say like Pink Floyd or in India, Lata Mangeshkar), it is easy to look for the popular songs of the artist or band. However, it is challenging in case of artists who are relatively new. That's where playlists play an important role in helping listeners discover great music and new artists.
        </p>
        <p style={{ marginBottom: 16 }}>
          Spotify has been focussing on creating and presenting personalised playlists such as Discover Weekly and Daily Mix which has helped music fans discover a world of new artists, allowing us to pursue our goal of supporting one million creators. This practice is now being followed by most streaming services facilitating users to listen to new music based on their choices and listening pattern.
        </p>
        <p>
          Songdew provides curated playlists to music fans. These playlists are based on various themes including playlists based on moods and occasions (such as collection of love songs, sad songs, party songs) as well as genre based playlists such collection of songs belonging to say Hip Hop, Rock, Pop, EDM, Acoustic, Classical, Folk or Sufi. Such playlists allow people to simply select the playlist of their choice and listen to carefully curated songs.
        </p>
      </div>

      <div className="cards-grid-4">
        {dummyPlaylists.map((playlist, idx) => (
          <div key={idx} className="song-card">
            <div className="song-card-art-wrapper" style={{ borderRadius: 8 }}>
              <img src={playlist.art} alt={playlist.title} className="song-card-art" />
              <div className="song-card-play-overlay">
                <button className="play-btn-circle">
                  <Play size={20} style={{ marginLeft: 3 }} />
                </button>
              </div>
            </div>
            <div className="song-card-info" style={{ textAlign: 'center' }}>
              <div className="song-card-title" style={{ fontSize: 15 }}>{playlist.title}</div>
              <div className="song-card-artist">{playlist.tracks} Tracks</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
