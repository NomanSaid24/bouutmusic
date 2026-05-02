'use client';
import { useState } from 'react';

interface DemoFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export function DemoSubmissionForm({ onSubmit, onCancel }: DemoFormProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        stageName: '',
        email: '',
        mobile: '',
        instagram: '',
        youtube: '',
        songLink: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={handleSubmit} className="bouut-demo-form">
            <div className="bouut-form-row">
                <div className="bouut-form-group">
                    <label>First Name<span className="bouut-required">*</span></label>
                    <input 
                        type="text" name="firstName" required placeholder="Input"
                        value={formData.firstName} onChange={handleChange} 
                    />
                </div>
                <div className="bouut-form-group">
                    <label>Last Name<span className="bouut-required">*</span></label>
                    <input 
                        type="text" name="lastName" required placeholder="Input"
                        value={formData.lastName} onChange={handleChange} 
                    />
                </div>
            </div>

            <div className="bouut-form-row">
                <div className="bouut-form-group">
                    <label>Stage Name<span className="bouut-required">*</span></label>
                    <input 
                        type="text" name="stageName" required placeholder="Input"
                        value={formData.stageName} onChange={handleChange} 
                    />
                </div>
                <div className="bouut-form-group">
                    <label>Email<span className="bouut-required">*</span></label>
                    <input 
                        type="email" name="email" required placeholder="Input"
                        value={formData.email} onChange={handleChange} 
                    />
                </div>
            </div>

            <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                <label>Mobile / Whatsapp / Telegram No.<span className="bouut-required">*</span></label>
                <input 
                    type="text" name="mobile" required placeholder="Input"
                    value={formData.mobile} onChange={handleChange} 
                />
            </div>

            <div className="bouut-form-row">
                <div className="bouut-form-group">
                    <label>Instagram Handle<span className="bouut-required">*</span></label>
                    <input 
                        type="text" name="instagram" required placeholder="Input"
                        value={formData.instagram} onChange={handleChange} 
                    />
                </div>
                <div className="bouut-form-group">
                    <label>Youtube Handle</label>
                    <input 
                        type="text" name="youtube" placeholder="Input"
                        value={formData.youtube} onChange={handleChange} 
                    />
                </div>
            </div>

            <div className="bouut-form-group full-width">
                <label>Link to the unreleased song<span className="bouut-required">*</span></label>
                <input 
                    type="url" name="songLink" required placeholder="Input"
                    value={formData.songLink} onChange={handleChange} 
                />
            </div>
            <p className="bouut-help-text">Spotify, SoundCloud, Youtube etc</p>

            <div className="bouut-form-actions">
                <button type="button" onClick={onCancel} className="bouut-btn bouut-btn-cancel">
                    Cancel
                </button>
                <button type="submit" className="bouut-btn bouut-btn-submit">
                    Submit Demo
                </button>
            </div>
        </form>
    );
}
