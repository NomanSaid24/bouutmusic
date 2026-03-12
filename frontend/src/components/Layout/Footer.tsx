import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mainFooter" style={{ background: '#0f172a', color: 'white', padding: '48px 0 24px', marginTop: 48, borderRadius: '16px 16px 0 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, padding: '0 32px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {[
          { title: 'Brands', links: ['Get Pro', 'Distribution', 'Promo Tools', 'Analytics', 'TV Broadcast'] },
          { title: 'Discover', links: ['Songs', 'Artists', 'Albums', 'Charts', 'Playlists'] },
          { title: 'Artists', links: ['Register', 'Upload Music', 'My Dashboard', 'e-Press Kit', 'Opportunities'] },
          { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press', 'Contact'] },
          { title: 'Contact Us', links: ['support@bouutmusic.com', 'Mumbai, India', '@bouutmusic', 'youtube.com/bouutmusic'] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{col.title}</div>
            {col.links.map((l, idx) => (
              <div key={`${l}-${idx}`} style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 8, cursor: 'pointer' }}>{l}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', color: '#64748b', fontSize: 12, padding: '16px 32px 0' }}>
        © 2026 Bouut Music. All rights reserved. |
        <span style={{ marginLeft: 8 }}>Privacy Policy</span> |
        <span style={{ marginLeft: 8 }}>Terms of Service</span>
      </div>
    </footer>
  );
}
