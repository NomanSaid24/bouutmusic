'use client';

export default function LicenseAgreementPage() {
  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#e6e5dd', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 840, width: '100%', padding: '0 24px', fontFamily: 'var(--font-sans), sans-serif' }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, color: '#ffffff' }}>License Agreement</h1>
            <p style={{ color: '#9b918d', marginBottom: 48, fontSize: 14 }}>Last Updated: Pending</p>
            
            <div style={{ lineHeight: 1.8, fontSize: 16, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
                <div style={{ padding: '60px 40px', backgroundColor: '#1a1a1a', borderRadius: 16, border: '1px dashed #333', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Document Coming Soon</h2>
                    <p style={{ color: '#9b918d', margin: 0 }}>This page is currently being drafted by our legal team. It will be available prior to the official May 1st launch.</p>
                </div>
            </div>
        </div>
    </div>
  );
}
