'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface CollaborateWithUsFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const INDUSTRY_OPTIONS = [
    'FM Radio',
    'Internet Radio',
    'Publication-Magazine/Newspaper/Blog',
    'Tv',
    'Record Label',
    'Contest',
    'Live Events',
    'Others',
];

function countWords(value: string) {
    return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function CollaborateWithUsForm({ onSubmit, onCancel }: CollaborateWithUsFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        companyName: '',
        companyUrl: '',
        companyAddress: '',
        requirements: '',
        contactName: '',
        phoneNumber: '',
        title: '',
        emailAddress: '',
    });
    const [industries, setIndustries] = useState<string[]>([]);
    const [industryError, setIndustryError] = useState('');
    const [requirementsError, setRequirementsError] = useState('');

    useEffect(() => {
        setFormData(current => ({
            ...current,
            companyUrl: current.companyUrl || user?.website || '',
            contactName: current.contactName || user?.name || '',
            emailAddress: current.emailAddress || user?.email || '',
        }));
    }, [user?.email, user?.name, user?.website]);

    const wordCount = useMemo(() => countWords(formData.requirements), [formData.requirements]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(current => ({ ...current, [name]: value }));

        if (name === 'requirements') {
            if (countWords(value) > 150) {
                setRequirementsError('Please keep your requirements under 150 words.');
            } else {
                setRequirementsError('');
            }
        }
    };

    const handleToggleIndustry = (industry: string) => {
        setIndustries(current =>
            current.includes(industry)
                ? current.filter(item => item !== industry)
                : [...current, industry]
        );
        setIndustryError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (industries.length === 0) {
            setIndustryError('Please select at least one industry.');
            return;
        }

        if (wordCount > 150) {
            setRequirementsError('Please keep your requirements under 150 words.');
            return;
        }

        onSubmit({
            ...formData,
            industries,
            requirementsWordCount: wordCount,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bouut-demo-form">
            <div className="bouut-info-card">
                <h3>Partner with us</h3>
                <p>
                    Bouut Music collaborates with industry experts and connects them with 200+ independent musicians.
                    If you are looking for talent for radio, television, publication, music blogs, festivals, and
                    other venues, you can join our growing community here.
                </p>
            </div>

            <div className="bouut-form-row">
                <div className="bouut-form-group">
                    <label>Company Name<span className="bouut-required">*</span></label>
                    <input
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
                    />
                </div>
                <div className="bouut-form-group">
                    <label>Company URL</label>
                    <input
                        type="url"
                        name="companyUrl"
                        value={formData.companyUrl}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                <label>Company Address<span className="bouut-required">*</span></label>
                <textarea
                    name="companyAddress"
                    required
                    placeholder="Type here..."
                    value={formData.companyAddress}
                    onChange={handleChange}
                />
            </div>

            <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                <label>Industry<span className="bouut-required">*</span></label>
                <div className="bouut-checkbox-grid">
                    {INDUSTRY_OPTIONS.map(industry => {
                        const selected = industries.includes(industry);

                        return (
                            <button
                                key={industry}
                                type="button"
                                className={`bouut-checkbox-item ${selected ? 'selected' : ''}`}
                                onClick={() => handleToggleIndustry(industry)}
                            >
                                <span className="bouut-checkbox-mark" aria-hidden="true">
                                    <span />
                                </span>
                                <span>{industry}</span>
                            </button>
                        );
                    })}
                </div>
                {industryError ? <p className="bouut-form-error">{industryError}</p> : null}
            </div>

            <div className="bouut-form-divider" />

            <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                <label>Tell us your requirements (less than 150 words)</label>
                <textarea
                    name="requirements"
                    placeholder="Type here..."
                    value={formData.requirements}
                    onChange={handleChange}
                />
                <div className="bouut-inline-meta">
                    <span className="bouut-help-text" style={{ marginBottom: 0 }}>Type here...</span>
                    <span className={`bouut-word-counter ${wordCount > 150 ? 'error' : ''}`}>{wordCount}/150 words</span>
                </div>
                {requirementsError ? <p className="bouut-form-error">{requirementsError}</p> : null}
            </div>

            <div className="bouut-form-divider" />

            <div className="bouut-section-label">Point of Contact - Partnership</div>

            <div className="bouut-form-row">
                <div className="bouut-form-group">
                    <label>Contact Name<span className="bouut-required">*</span></label>
                    <input
                        type="text"
                        name="contactName"
                        required
                        value={formData.contactName}
                        onChange={handleChange}
                    />
                </div>
                <div className="bouut-form-group">
                    <label>Phone Number<span className="bouut-required">*</span></label>
                    <input
                        type="text"
                        name="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="bouut-form-row">
                <div className="bouut-form-group">
                    <label>Title<span className="bouut-required">*</span></label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>
                <div className="bouut-form-group">
                    <label>Email Address<span className="bouut-required">*</span></label>
                    <input
                        type="email"
                        name="emailAddress"
                        required
                        placeholder="ex: myname@example.com"
                        value={formData.emailAddress}
                        onChange={handleChange}
                    />
                    <p className="bouut-help-text">example@example.com</p>
                </div>
            </div>

            <div className="bouut-form-actions" style={{ justifyContent: 'flex-start' }}>
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
