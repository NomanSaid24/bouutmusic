'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { City, Country, State } from 'country-state-city';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './SubscriptionCheckoutPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type CheckoutForm = {
    email: string;
    phone: string;
    address1: string;
    address2: string;
    country: string;
    countryCode: string;
    state: string;
    stateCode: string;
    city: string;
    postalCode: string;
    promoCode: string;
};

type SubscriptionSummary = {
    productName: string;
    originalAmount: number;
    discountedAmount: number;
    taxPercent: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    proDurationDays: number;
};

type SubscriptionConfigResponse = {
    enabled: boolean;
    mode: string;
    currency: string;
    productName: string;
    summary: SubscriptionSummary;
};

const FALLBACK_SUMMARY: SubscriptionSummary = {
    productName: 'Bouut Pro',
    originalAmount: 4000,
    discountedAmount: 2000,
    taxPercent: 18,
    taxAmount: 360,
    totalAmount: 2360,
    currency: 'INR',
    proDurationDays: 365,
};

const INITIAL_FORM: CheckoutForm = {
    email: '',
    phone: '',
    address1: '',
    address2: '',
    country: '',
    countryCode: '',
    state: '',
    stateCode: '',
    city: '',
    postalCode: '',
    promoCode: '',
};

function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

function validateForm(form: CheckoutForm) {
    if (!form.email.trim()) return 'Email is required.';
    if (!form.phone.trim()) return 'Phone number is required.';
    if (!form.address1.trim()) return 'Billing address is required.';
    if (!form.countryCode.trim() || !form.country.trim()) return 'Please select your country.';
    if (!form.state.trim()) return 'Please select or enter your state.';
    if (!form.city.trim()) return 'Please select or enter your city.';
    if (!form.postalCode.trim()) return 'Postal code is required.';
    return null;
}

export function SubscriptionCheckoutPage() {
    const router = useRouter();
    const { token, user } = useAuth();
    const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
    const [summary, setSummary] = useState<SubscriptionSummary>(FALLBACK_SUMMARY);
    const [showPromoField, setShowPromoField] = useState(false);
    const [configError, setConfigError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const countries = useMemo(() => Country.getAllCountries(), []);

    const states = useMemo(() => {
        if (!form.countryCode) {
            return [];
        }

        return State.getStatesOfCountry(form.countryCode);
    }, [form.countryCode]);

    const cities = useMemo(() => {
        if (!form.countryCode || !form.stateCode) {
            return [];
        }

        return City.getCitiesOfState(form.countryCode, form.stateCode);
    }, [form.countryCode, form.stateCode]);

    useEffect(() => {
        if (!user?.email) {
            return;
        }

        setForm(previous => previous.email ? previous : { ...previous, email: user.email });
    }, [user?.email]);

    useEffect(() => {
        if (!token) {
            return;
        }

        let isMounted = true;

        async function loadConfig() {
            setIsLoadingConfig(true);
            setConfigError(null);

            try {
                const response = await fetch(`${API_URL}/api/payments/subscription/config`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                const payload = await response.json().catch(() => null) as SubscriptionConfigResponse | { error?: string } | null;

                if (!response.ok) {
                    throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Failed to load subscription details');
                }

                if (!isMounted || !payload || !('summary' in payload)) {
                    return;
                }

                setSummary(payload.summary);

                if (!payload.enabled) {
                    setConfigError('PayU payments are not enabled yet. Ask an admin to configure payment settings.');
                }
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setConfigError(error instanceof Error ? error.message : 'Failed to load subscription details');
            } finally {
                if (isMounted) {
                    setIsLoadingConfig(false);
                }
            }
        }

        void loadConfig();

        return () => {
            isMounted = false;
        };
    }, [token]);

    function updateField<K extends keyof CheckoutForm>(field: K, value: CheckoutForm[K]) {
        setForm(previous => ({
            ...previous,
            [field]: value,
        }));
    }

    function handleCountryChange(countryCode: string) {
        const selectedCountry = countries.find(country => country.isoCode === countryCode);

        setForm(previous => ({
            ...previous,
            countryCode,
            country: selectedCountry?.name || '',
            state: '',
            stateCode: '',
            city: '',
        }));
    }

    function handleStateChange(stateCode: string) {
        const selectedState = states.find(state => state.isoCode === stateCode);

        setForm(previous => ({
            ...previous,
            stateCode,
            state: selectedState?.name || '',
            city: '',
        }));
    }

    function handleCityChange(cityName: string) {
        updateField('city', cityName);
    }

    async function handleProceedToPayment() {
        if (!token) {
            setSubmitError('Please sign in again before continuing to payment.');
            return;
        }

        const validationError = validateForm(form);
        if (validationError) {
            setSubmitError(validationError);
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch(`${API_URL}/api/payments/subscription/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const payload = await response.json().catch(() => null) as { checkoutId?: string; error?: string } | null;

            if (!response.ok || !payload?.checkoutId) {
                throw new Error(payload?.error || 'Unable to start payment checkout');
            }

            router.push(`/dashboard/subscription/payment?checkoutId=${payload.checkoutId}`);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Unable to start payment checkout');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.headingBlock}>
                    <h1 className={styles.pageTitle}>Checkout</h1>
                </div>

                <div className={styles.layout}>
                    <section className={styles.billingColumn}>
                        <div className={styles.sectionHeader}>
                            <h2>Billing Information</h2>
                        </div>

                        {configError && <div className={styles.noticeError}>{configError}</div>}

                        <form className={styles.form} onSubmit={event => event.preventDefault()}>
                            <div className={styles.fieldGroup}>
                                <label htmlFor="checkout-email">Email*</label>
                                <input
                                    id="checkout-email"
                                    type="email"
                                    placeholder="abc@mail.com"
                                    value={form.email}
                                    onChange={event => updateField('email', event.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label htmlFor="checkout-phone">Phone Number*</label>
                                <input
                                    id="checkout-phone"
                                    type="tel"
                                    placeholder="xxxxxxxx"
                                    value={form.phone}
                                    onChange={event => updateField('phone', event.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label htmlFor="checkout-address-1">Billing Address*</label>
                                <input
                                    id="checkout-address-1"
                                    type="text"
                                    placeholder="Address Line 1"
                                    value={form.address1}
                                    onChange={event => updateField('address1', event.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <input
                                    id="checkout-address-2"
                                    type="text"
                                    placeholder="Address Line 2(optional)"
                                    value={form.address2}
                                    onChange={event => updateField('address2', event.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.doubleRow}>
                                <div className={styles.fieldGroup}>
                                    <select
                                        value={form.countryCode}
                                        onChange={event => handleCountryChange(event.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="">Country</option>
                                        {countries.map(country => (
                                            <option key={country.isoCode} value={country.isoCode}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <select
                                        value={form.stateCode}
                                        onChange={event => handleStateChange(event.target.value)}
                                        className={styles.select}
                                        disabled={!form.countryCode}
                                    >
                                        <option value="">State</option>
                                        {states.map(state => (
                                            <option key={state.isoCode} value={state.isoCode}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.doubleRow}>
                                <div className={styles.fieldGroup}>
                                    <select
                                        value={form.city}
                                        onChange={event => handleCityChange(event.target.value)}
                                        className={styles.select}
                                        disabled={!form.stateCode}
                                    >
                                        <option value="">City</option>
                                        {cities.map(city => (
                                            <option
                                                key={`${city.countryCode}-${city.stateCode}-${city.name}`}
                                                value={city.name}
                                            >
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <input
                                        id="checkout-postal-code"
                                        type="text"
                                        placeholder="Postal code"
                                        value={form.postalCode}
                                        onChange={event => updateField('postalCode', event.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </form>
                    </section>

                    <aside className={styles.summaryColumn}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryTop}>
                                <h3>Order Summary</h3>
                                <span className={styles.originalPrice}>
                                    {formatCurrency(summary.originalAmount, summary.currency)}
                                </span>
                            </div>

                            <div className={styles.summaryLine}>
                                <div>
                                    <p className={styles.productName}>{summary.productName}</p>
                                    <p className={styles.productMeta}>Billed Annually</p>
                                </div>
                                <span className={styles.summaryPrice}>
                                    {formatCurrency(summary.discountedAmount, summary.currency)}
                                </span>
                            </div>

                            <div className={styles.summaryDivider} />

                            <div className={styles.taxLine}>
                                <span>GST ({summary.taxPercent}%)</span>
                                <span>{formatCurrency(summary.taxAmount, summary.currency)}</span>
                            </div>

                            <div className={styles.totalLine}>
                                <div>
                                    <p>Total</p>
                                    <small>Includes GST*</small>
                                </div>
                                <span>{formatCurrency(summary.totalAmount, summary.currency)}</span>
                            </div>

                            <button
                                type="button"
                                className={styles.promoToggle}
                                onClick={() => setShowPromoField(previous => !previous)}
                            >
                                Apply Promo/ Referral code
                            </button>

                            {showPromoField && (
                                <div className={styles.promoRow}>
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        value={form.promoCode}
                                        onChange={event => updateField('promoCode', event.target.value)}
                                        className={styles.promoInput}
                                    />
                                    <button type="button" className={styles.promoButton}>
                                        Apply
                                    </button>
                                </div>
                            )}

                            {submitError && <div className={styles.noticeError}>{submitError}</div>}

                            <button
                                type="button"
                                className={styles.paymentButton}
                                onClick={() => void handleProceedToPayment()}
                                disabled={isLoadingConfig || isSubmitting || !!configError}
                            >
                                {isSubmitting ? 'Preparing PayU...' : 'Proceed To Payment'}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
