'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface PlaylistFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const PLAYLIST_OPTIONS = ['Top 50 - Indie India'];

const GENRE_OPTIONS = [
    'Pop',
    'Dance / EDM (Electronic Dance Music)',
    'Hip-hop and Rap',
    'R&B',
    'Latin',
    'Rock',
    'Metal',
    'Country',
    'Folk / Acoustic',
    'Classical',
    'Jazz',
    'Blues',
    'Easy Listening',
    'New Age',
    'World / Traditional Folk',
];

export function PlaylistSubmissionForm({ onSubmit, onCancel }: PlaylistFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        artistName: '',
        email: '',
        mobile: '',
        playlist: '',
        genre: '',
        spotifyUrl: '',
    });

    useEffect(() => {
        setFormData(current => ({
            ...current,
            artistName: current.artistName || user?.name || '',
            email: current.email || user?.email || '',
            genre: current.genre || user?.genre || '',
        }));
    }, [user?.email, user?.genre, user?.name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(current => ({ ...current, [name]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="bouut-demo-form">
            <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                <label>Artist Name</label>
                <input
                    type="text"
                    name="artistName"
                    placeholder="Enter your stage name"
                    value={formData.artistName}
                    onChange={handleChange}
                />
                <p className="bouut-help-text">Enter your stage name</p>
            </div>

            <div className="bouut-form-row">
                <div className="bouut-form-group">
                    <label>Email<span className="bouut-required">*</span></label>
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="example@example.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <p className="bouut-help-text">example@example.com</p>
                </div>

                <div className="bouut-form-group">
                    <label>Mobile / Whatsapp / Telegram No.<span className="bouut-required">*</span></label>
                    <input
                        type="tel"
                        name="mobile"
                        required
                        placeholder="(000) 000-0000"
                        value={formData.mobile}
                        onChange={handleChange}
                    />
                    <p className="bouut-help-text">Please enter a valid phone number for faster communications</p>
                </div>
            </div>

            <div className="bouut-form-row">
                <div className="bouut-form-group">
                    <label>Choose playlist<span className="bouut-required">*</span></label>
                    <select name="playlist" required value={formData.playlist} onChange={handleChange}>
                        <option value="">Please Select</option>
                        {PLAYLIST_OPTIONS.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bouut-form-group">
                    <label>Genre<span className="bouut-required">*</span></label>
                    <select name="genre" required value={formData.genre} onChange={handleChange}>
                        <option value="">Please Select</option>
                        {GENRE_OPTIONS.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <p className="bouut-help-text">Which music genre are you?</p>
                </div>
            </div>

            <div className="bouut-form-group full-width">
                <label>Spotify url of the track<span className="bouut-required">*</span></label>
                <input
                    type="url"
                    name="spotifyUrl"
                    required
                    placeholder="Paste track link here"
                    value={formData.spotifyUrl}
                    onChange={handleChange}
                />
                <p className="bouut-help-text">Paste track link here</p>
            </div>

            <div className="bouut-form-actions">
                <button type="button" onClick={onCancel} className="bouut-btn bouut-btn-cancel">
                    Cancel
                </button>
                <button type="submit" className="bouut-btn bouut-btn-submit">
                    Submit
                </button>
            </div>
        </form>
    );
}
