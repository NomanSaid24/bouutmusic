'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function SettingsPage() {
    const [name, setName] = useState('Noman Said');
    const [bio, setBio] = useState('Rising pop artist from Karachi.');
    const [genre, setGenre] = useState('Pop');
    const [city, setCity] = useState('Karachi');

    return (
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="breadcrumb"><Link href="/dashboard">Home</Link><span>/</span> Settings</div>
            <h1 className="page-title" style={{ marginBottom: 24 }}>Account Settings</h1>

            {/* Profile Info */}
            <div className="card" style={{ padding: 28, marginBottom: 16 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Profile Information</h2>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, flexShrink: 0 }}>NS</div>
                    <div>
                        <button className="btn btn-outline btn-sm">Change Photo</button>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>JPG or PNG, max 2MB</div>
                    </div>
                </div>
                <div className="form-grid-2">
                    <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Genre</label><input className="form-input" value={genre} onChange={e => setGenre(e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">City</label><input className="form-input" value={city} onChange={e => setCity(e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Website</label><input className="form-input" placeholder="https://yoursite.com" /></div>
                </div>
                <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input" rows={3} value={bio} onChange={e => setBio(e.target.value)} /></div>
                <button className="btn btn-primary">Save Changes</button>
            </div>

            {/* Social Links */}
            <div className="card" style={{ padding: 28, marginBottom: 16 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Social Links</h2>
                <div className="form-grid-2">
                    {['Instagram', 'Facebook', 'Twitter', 'YouTube', 'Spotify'].map(s => (
                        <div key={s} className="form-group"><label className="form-label">{s}</label><input className="form-input" placeholder={`@your${s.toLowerCase()}`} /></div>
                    ))}
                </div>
                <button className="btn btn-primary">Save Social Links</button>
            </div>

            {/* Password */}
            <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Change Password</h2>
                <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" /></div>
                <div className="form-grid-2">
                    <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" /></div>
                    <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" /></div>
                </div>
                <button className="btn btn-primary">Update Password</button>
            </div>
        </div>
    );
}
