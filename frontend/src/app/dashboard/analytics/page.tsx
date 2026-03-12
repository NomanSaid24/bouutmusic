import Link from 'next/link';

export default function AnalyticsPage() {
    return (
        <div>
            <div className="breadcrumb"><Link href="/dashboard">Home</Link><span>/</span> Analytics</div>
            <div className="page-header"><h1 className="page-title">Analytics</h1></div>

            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Upgrade to Pro for Analytics</div>
                <div style={{ fontSize: 14, color: '#6b7280', maxWidth: 400, margin: '0 auto 24px' }}>
                    Get detailed stream reports, daily trend analysis, download counts, and revenue tracking with Bouut Pro.
                </div>
                <Link href="/dashboard/subscription" className="btn btn-gold btn-lg">Get Pro — ₹2,000/yr</Link>
            </div>

            <div className="stats-grid" style={{ marginTop: 24 }}>
                {[
                    { label: 'Total Plays (Free)', value: '0' },
                    { label: 'Total Downloads', value: '0' },
                    { label: 'Profile Views', value: '0' },
                    { label: 'Songs Uploaded', value: '0' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
