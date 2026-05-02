'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('') || 'BM';
}

export default function SettingsPage() {
    const { user, token, refreshUser } = useAuth();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [genre, setGenre] = useState('');
    const [city, setCity] = useState('');
    const [website, setWebsite] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [twitter, setTwitter] = useState('');
    const [youtube, setYoutube] = useState('');
    const [spotify, setSpotify] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileMessage, setProfileMessage] = useState<string | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }

        setName(user.name || '');
        setBio(user.bio || '');
        setGenre(user.genre || '');
        setCity(user.city || '');
        setWebsite(user.website || '');
        setInstagram(user.instagram || '');
        setFacebook(user.facebook || '');
        setTwitter(user.twitter || '');
        setYoutube(user.youtube || '');
        setSpotify(user.spotify || '');
    }, [user]);

    const initials = useMemo(() => getInitials(name || user?.name || 'Bouut Music'), [name, user?.name]);

    if (!user || !token) {
        return null;
    }

    async function saveProfile() {
        setSavingProfile(true);
        setProfileMessage(null);

        try {
            const response = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    bio,
                    genre,
                    city,
                    website,
                    instagram,
                    facebook,
                    twitter,
                    youtube,
                    spotify,
                }),
            });
            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to save profile');
            }

            await refreshUser();
            setProfileMessage('Profile updated successfully.');
        } catch (error) {
            setProfileMessage(error instanceof Error ? error.message : 'Failed to save profile');
        } finally {
            setSavingProfile(false);
        }
    }

    async function updatePassword() {
        if (newPassword.length < 8) {
            setPasswordMessage('New password must be at least 8 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage('New password and confirm password do not match.');
            return;
        }

        setSavingPassword(true);
        setPasswordMessage(null);

        try {
            const response = await fetch(`${API_URL}/api/auth/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });
            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to update password');
            }

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordMessage('Password updated successfully.');
        } catch (error) {
            setPasswordMessage(error instanceof Error ? error.message : 'Failed to update password');
        } finally {
            setSavingPassword(false);
        }
    }

    return (
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="breadcrumb"><Link href="/dashboard">Home</Link><span>/</span> Settings</div>
            <h1 className="page-title" style={{ marginBottom: 24 }}>Account Settings</h1>

            <div className="card" style={{ padding: 28, marginBottom: 16 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Profile Information</h2>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, flexShrink: 0 }}>{initials}</div>
                    <div>
                        <button className="btn btn-outline btn-sm">Change Photo</button>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>JPG or PNG, max 2MB</div>
                    </div>
                </div>
                <div className="form-grid-2">
                    <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={name} onChange={event => setName(event.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Genre</label><input className="form-input" value={genre} onChange={event => setGenre(event.target.value)} /></div>
                    <div className="form-group"><label className="form-label">City</label><input className="form-input" value={city} onChange={event => setCity(event.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Website</label><input className="form-input" value={website} onChange={event => setWebsite(event.target.value)} placeholder="https://yoursite.com" /></div>
                </div>
                <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input" rows={3} value={bio} onChange={event => setBio(event.target.value)} /></div>
                {profileMessage && <div style={{ fontSize: 12.5, color: profileMessage.includes('successfully') ? '#047857' : '#b91c1c', marginBottom: 12 }}>{profileMessage}</div>}
                <button className="btn btn-primary" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
            </div>

            <div className="card" style={{ padding: 28, marginBottom: 16 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Social Links</h2>
                <div className="form-grid-2">
                    <div className="form-group"><label className="form-label">Instagram</label><input className="form-input" value={instagram} onChange={event => setInstagram(event.target.value)} placeholder="@yourinstagram" /></div>
                    <div className="form-group"><label className="form-label">Facebook</label><input className="form-input" value={facebook} onChange={event => setFacebook(event.target.value)} placeholder="@yourfacebook" /></div>
                    <div className="form-group"><label className="form-label">Twitter</label><input className="form-input" value={twitter} onChange={event => setTwitter(event.target.value)} placeholder="@yourtwitter" /></div>
                    <div className="form-group"><label className="form-label">YouTube</label><input className="form-input" value={youtube} onChange={event => setYoutube(event.target.value)} placeholder="https://youtube.com/yourchannel" /></div>
                    <div className="form-group"><label className="form-label">Spotify</label><input className="form-input" value={spotify} onChange={event => setSpotify(event.target.value)} placeholder="https://open.spotify.com/artist/..." /></div>
                </div>
                <button className="btn btn-primary" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Social Links'}</button>
            </div>

            <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Change Password</h2>
                <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></div>
                <div className="form-grid-2">
                    <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></div>
                </div>
                {passwordMessage && <div style={{ fontSize: 12.5, color: passwordMessage.includes('successfully') ? '#047857' : '#b91c1c', marginBottom: 12 }}>{passwordMessage}</div>}
                <button className="btn btn-primary" onClick={updatePassword} disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Update Password'}</button>
            </div>
        </div>
    );
}
