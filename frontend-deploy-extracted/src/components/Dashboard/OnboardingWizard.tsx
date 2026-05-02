'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
    ARTIST_TYPE_OPTIONS,
    getCities,
    getCountries,
    getStates,
} from '@/lib/profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface OnboardingWizardProps {
    isOpen: boolean;
    token: string;
    initialArtistTypes?: string[] | null;
    initialCountry?: string | null;
    initialState?: string | null;
    initialCity?: string | null;
    onClose: () => void;
    onComplete: () => Promise<void> | void;
}

export function OnboardingWizard({
    isOpen,
    token,
    initialArtistTypes,
    initialCountry,
    initialState,
    initialCity,
    onClose,
    onComplete,
}: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setStep(1);
        setSelectedTypes(initialArtistTypes?.slice(0, 3) || []);
        setCountry(initialCountry || '');
        setState(initialState || '');
        setCity(initialCity || '');
        setError(null);
        setIsSubmitting(false);
    }, [initialArtistTypes, initialCity, initialCountry, initialState, isOpen]);

    const countryOptions = useMemo(() => getCountries(), []);
    const stateOptions = useMemo(() => getStates(country), [country]);
    const cityOptions = useMemo(() => getCities(country, state), [country, state]);

    if (!isOpen) {
        return null;
    }

    function toggleArtistType(value: string) {
        setSelectedTypes(current => {
            if (current.includes(value)) {
                return current.filter(item => item !== value);
            }

            if (current.length >= 3) {
                return current;
            }

            return [...current, value];
        });
    }

    async function submitOnboarding() {
        if (!selectedTypes.length) {
            setError('Please choose at least one option.');
            setStep(1);
            return;
        }

        if (!country || !state || !city) {
            setError('Please choose your country, state, and city.');
            setStep(2);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/auth/onboarding`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    artistTypes: selectedTypes,
                    country,
                    state,
                    city,
                }),
            });
            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to save onboarding details');
            }

            await onComplete();
            onClose();
        } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : 'Failed to save onboarding details');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="epk-modal-overlay">
            <div className="epk-modal-card onboarding-modal-card">
                <button className="epk-modal-close" onClick={onClose} type="button">
                    <X size={18} />
                </button>

                {step === 1 ? (
                    <>
                        <div className="onboarding-title">Great, tell us bit more about you</div>
                        <div className="onboarding-subtitle">It will help us to customise our offering to you</div>

                        <div className="onboarding-caption">
                            How will you describe your Skills/Areas of Interest?
                            <br />
                            You may choose max of three options
                        </div>

                        <div className="onboarding-option-grid">
                            {ARTIST_TYPE_OPTIONS.map(option => {
                                const isSelected = selectedTypes.includes(option);

                                return (
                                    <button
                                        key={option}
                                        className={`onboarding-option ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleArtistType(option)}
                                        type="button"
                                    >
                                        <span className="onboarding-option-indicator" />
                                        <span>{option}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {error && <div className="onboarding-error">{error}</div>}

                        <button
                            className="btn btn-primary onboarding-submit"
                            onClick={() => {
                                if (!selectedTypes.length) {
                                    setError('Please choose at least one option.');
                                    return;
                                }

                                setError(null);
                                setStep(2);
                            }}
                            type="button"
                        >
                            Continue
                        </button>
                    </>
                ) : (
                    <>
                        <div className="onboarding-title">Tell Us City Of Your Stay</div>
                        <div className="onboarding-subtitle">It will help you to get discovered when people are looking for artists from a particular area/city</div>

                        <div className="onboarding-form-stack">
                            <label className="onboarding-field">
                                <span>Country</span>
                                <select
                                    value={country}
                                    onChange={event => {
                                        setCountry(event.target.value);
                                        setState('');
                                        setCity('');
                                    }}
                                >
                                    <option value="">Select country</option>
                                    {countryOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="onboarding-field">
                                <span>State</span>
                                <select
                                    value={state}
                                    onChange={event => {
                                        setState(event.target.value);
                                        setCity('');
                                    }}
                                    disabled={!country}
                                >
                                    <option value="">Select state</option>
                                    {stateOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="onboarding-field">
                                <span>City</span>
                                <select value={city} onChange={event => setCity(event.target.value)} disabled={!state}>
                                    <option value="">Select city</option>
                                    {cityOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {error && <div className="onboarding-error">{error}</div>}

                        <div className="onboarding-actions">
                            <button className="btn btn-outline" onClick={() => setStep(1)} type="button">Back</button>
                            <button className="btn btn-primary onboarding-submit" onClick={submitOnboarding} disabled={isSubmitting} type="button">
                                {isSubmitting ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

