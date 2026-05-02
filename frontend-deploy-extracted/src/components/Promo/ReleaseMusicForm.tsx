'use client';
import { useState } from 'react';

interface ReleaseFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export function ReleaseMusicForm({ onSubmit, onCancel }: ReleaseFormProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        plan: 'Basic',
        email: '',
        phone: '',
        artistName: '',
        facebook: '',
        youtube: '',
        instagram: '',
        releaseTitle: '',
        version: 'Single',
        genre: 'Pop',
        mood: '',
        upcSelection: 'I dont have my own UPC',
        language: '',
        trackTitle: '',
        downloadLink: '',
        featuredArtists: '',
        additionalArtists: '',
        remixer: '',
        writers: '',
        producers: '',
        lyrics: '',
        trackLanguage: '',
        isExplicit: 'No',
        isrc: '',
        spotifyId: '',
        appleId: '',
        releaseDate: '',
        bankName: '',
        accountHolder: '',
        accountNumber: '',
        ifsc: '',
        albumArt: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const steps = [
        { id: 1, label: 'Artist' },
        { id: 2, label: 'Release' },
        { id: 3, label: 'Tracks' },
        { id: 4, label: 'Banking' }
    ];

    return (
        <form onSubmit={handleSubmit} className="bouut-demo-form">
            {/* Step Indicator */}
            <div className="bouut-steps-container">
                {steps.map((s) => (
                    <div 
                        key={s.id} 
                        className={`bouut-step ${step === s.id ? 'active' : step > s.id ? 'completed' : ''}`}
                        title={s.label}
                    >
                        {step > s.id ? '✓' : s.id}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="animate-in fade-in duration-300">
                    <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                        <label>Choose a Plan<span className="bouut-required">*</span></label>
                        <select name="plan" value={formData.plan} onChange={handleChange}>
                            <option value="Basic">Basic (₹299)</option>
                            <option value="Standard">Standard (₹499)</option>
                            <option value="Premium">Premium (₹999)</option>
                        </select>
                    </div>

                    <div className="bouut-form-row">
                        <div className="bouut-form-group">
                            <label>Email<span className="bouut-required">*</span></label>
                            <input type="email" name="email" required placeholder="Input" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="bouut-form-group">
                            <label>Phone Number<span className="bouut-required">*</span></label>
                            <input type="text" name="phone" required placeholder="Input" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                        <label>Main Artist or Band<span className="bouut-required">*</span></label>
                        <input type="text" name="artistName" required placeholder="Input" value={formData.artistName} onChange={handleChange} />
                    </div>

                    <div className="bouut-form-row">
                        <div className="bouut-form-group">
                            <label>YouTube</label>
                            <input type="text" name="youtube" placeholder="Input" value={formData.youtube} onChange={handleChange} />
                        </div>
                        <div className="bouut-form-group">
                            <label>Instagram</label>
                            <input type="text" name="instagram" placeholder="Input" value={formData.instagram} onChange={handleChange} />
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in fade-in duration-300">
                    <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                        <label>Album/Single/EP Title<span className="bouut-required">*</span></label>
                        <input type="text" name="releaseTitle" required placeholder="Input" value={formData.releaseTitle} onChange={handleChange} />
                    </div>

                    <div className="bouut-form-row">
                        <div className="bouut-form-group">
                            <label>Version Name<span className="bouut-required">*</span></label>
                            <select name="version" value={formData.version} onChange={handleChange}>
                                <option value="Single">Single</option>
                                <option value="Cover">Cover</option>
                                <option value="Remix">Remix</option>
                                <option value="Live">Live</option>
                            </select>
                        </div>
                        <div className="bouut-form-group">
                            <label>Main Genre<span className="bouut-required">*</span></label>
                            <select name="genre" value={formData.genre} onChange={handleChange}>
                                <option value="Pop">Pop</option>
                                <option value="Rock">Rock</option>
                                <option value="Hip-Hop/Rap">Hip-Hop/Rap</option>
                                <option value="Electronic">Electronic</option>
                                <option value="Classical">Classical</option>
                                <option value="Jazz">Jazz</option>
                                <option value="Blues">Blues</option>
                                <option value="Indie Pop">Indie Pop</option>
                            </select>
                        </div>
                    </div>

                    <div className="bouut-form-row">
                        <div className="bouut-form-group">
                            <label>Mood</label>
                            <input type="text" name="mood" placeholder="Sad, Happy, Energetic etc." value={formData.mood} onChange={handleChange} />
                        </div>
                        <div className="bouut-form-group">
                            <label>Language<span className="bouut-required">*</span></label>
                            <input type="text" name="language" required placeholder="Input" value={formData.language} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="bouut-form-group full-width">
                        <label>Bar Code (UPC)</label>
                        <select name="upcSelection" value={formData.upcSelection} onChange={handleChange}>
                            <option value="I dont have my own UPC">I don't have my own UPC (Generate for me)</option>
                            <option value="I have my own UPC">I have my own UPC</option>
                        </select>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-in fade-in duration-300">
                    <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                        <label>Title of Track<span className="bouut-required">*</span></label>
                        <input type="text" name="trackTitle" required placeholder="Input" value={formData.trackTitle} onChange={handleChange} />
                    </div>
                    <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                        <label>Download Link (Wave 320kbps)<span className="bouut-required">*</span></label>
                        <input type="text" name="downloadLink" required placeholder="Link to file" value={formData.downloadLink} onChange={handleChange} />
                    </div>

                    <div className="bouut-form-row">
                        <div className="bouut-form-group">
                            <label>Featured Artists</label>
                            <input type="text" name="featuredArtists" placeholder="Input" value={formData.featuredArtists} onChange={handleChange} />
                        </div>
                        <div className="bouut-form-group">
                            <label>Additional Artists</label>
                            <input type="text" name="additionalArtists" placeholder="Input" value={formData.additionalArtists} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="bouut-form-row">
                        <div className="bouut-form-group">
                            <label>Writers</label>
                            <input type="text" name="writers" placeholder="Input" value={formData.writers} onChange={handleChange} />
                        </div>
                        <div className="bouut-form-group">
                            <label>Producers</label>
                            <input type="text" name="producers" placeholder="Input" value={formData.producers} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="bouut-form-group full-width">
                        <label>Lyrics (Optional)</label>
                        <textarea name="lyrics" value={formData.lyrics} onChange={handleChange} placeholder="Paste lyrics here"></textarea>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="animate-in fade-in duration-300">
                    <div className="bouut-form-row">
                        <div className="bouut-form-group">
                            <label>Track Language<span className="bouut-required">*</span></label>
                            <input type="text" name="trackLanguage" required placeholder="Input" value={formData.trackLanguage} onChange={handleChange} />
                        </div>
                        <div className="bouut-form-group">
                            <label>Explicit Content<span className="bouut-required">*</span></label>
                            <select name="isExplicit" value={formData.isExplicit} onChange={handleChange}>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </div>
                    </div>

                    <div className="bouut-form-row">
                        <div className="bouut-form-group">
                            <label>Spotify Artist ID</label>
                            <input type="text" name="spotifyId" placeholder="Optional" value={formData.spotifyId} onChange={handleChange} />
                        </div>
                        <div className="bouut-form-group">
                            <label>Apple Artist ID</label>
                            <input type="text" name="appleId" placeholder="Optional" value={formData.appleId} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="bouut-form-group full-width" style={{ marginBottom: '30px' }}>
                        <label>Album Art (3000x3000px)<span className="bouut-required">*</span></label>
                        <input type="text" name="albumArt" required placeholder="Download Link/URL" value={formData.albumArt} onChange={handleChange} />
                    </div>

                    <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '20px', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#e35b5a', marginBottom: '15px' }}>Bank Details (For Royalties)</h4>
                        
                        <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                            <label>Bank Name<span className="bouut-required">*</span></label>
                            <input type="text" name="bankName" required placeholder="Input" value={formData.bankName} onChange={handleChange} />
                        </div>

                        <div className="bouut-form-row">
                            <div className="bouut-form-group">
                                <label>Account Holder<span className="bouut-required">*</span></label>
                                <input type="text" name="accountHolder" required placeholder="Input" value={formData.accountHolder} onChange={handleChange} />
                            </div>
                            <div className="bouut-form-group">
                                <label>Account Number<span className="bouut-required">*</span></label>
                                <input type="text" name="accountNumber" required placeholder="Input" value={formData.accountNumber} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="bouut-form-group full-width">
                            <label>IFSC Code<span className="bouut-required">*</span></label>
                            <input type="text" name="ifsc" required placeholder="Input" value={formData.ifsc} onChange={handleChange} />
                        </div>
                    </div>
                </div>
            )}

            <div className="bouut-form-actions" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                <button type="button" onClick={onCancel} className="bouut-btn bouut-btn-cancel">
                    Cancel
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {step > 1 && (
                        <button type="button" onClick={prevStep} className="bouut-btn bouut-btn-cancel">
                            Back
                        </button>
                    )}
                    {step < 4 ? (
                        <button type="button" onClick={nextStep} className="bouut-btn bouut-btn-submit">
                            Next Step
                        </button>
                    ) : (
                        <button type="submit" className="bouut-btn bouut-btn-submit">
                            Submit & Pay
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}
