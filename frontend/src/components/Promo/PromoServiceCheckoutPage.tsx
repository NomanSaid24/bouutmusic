'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { City, Country, State } from 'country-state-city';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from '../Subscription/SubscriptionCheckoutPage.module.css';

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

type ServiceConfigResponse = {
    id: string;
    status: string;
    paymentStatus: string;
    paymentRequired: boolean;
    paymentAmount: number | null;
    paymentCurrency: string;
    service: {
        id: string;
        name: string;
        description: string;
        price: number;
    };
    formData: Record<string, unknown> | null;
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
    if (!form.country.trim() || !form.countryCode.trim()) return 'Please select your country.';
    if (!form.state.trim()) return 'Please select your state.';
    if (!form.city.trim()) return 'Please select your city.';
    if (!form.postalCode.trim()) return 'Postal code is required.';
    return null;
}

function getStringValue(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

export function PromoServiceCheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { token, user } = useAuth();
    const submissionId = searchParams.get('submissionId');

    const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
    const [config, setConfig] = useState<ServiceConfigResponse | null>(null);
    const [configError, setConfigError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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

        setForm(previous => ({
            ...previous,
            email: previous.email || user.email,
        }));
    }, [user?.email]);

    useEffect(() => {
        if (!token || !submissionId) {
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        async function loadConfig() {
            setIsLoading(true);
            setConfigError(null);

            try {
                const response = await fetch(`${API_URL}/api/payments/services/submissions/${submissionId}/config`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                const payload = await response.json().catch(() => null) as ServiceConfigResponse | { error?: string } | null;

                if (!response.ok || !payload || !('id' in payload)) {
                    throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Unable to load service checkout details');
                }

                if (!isMounted) {
                    return;
                }

                setConfig(payload);

                const formData = payload.formData || {};
                setForm(previous => ({
                    ...previous,
                    email: previous.email || getStringValue(formData.email) || user?.email || '',
                    phone: previous.phone || getStringValue(formData.phone) || getStringValue(formData.mobile),
                }));

                if (!payload.paymentRequired) {
                    setConfigError('This submission does not require payment.');
                }
            } catch (error) {
                if (isMounted) {
                    setConfigError(error instanceof Error ? error.message : 'Unable to load service checkout details');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadConfig();

        return () => {
            isMounted = false;
        };
    }, [submissionId, token, user?.email]);

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

    async function handleProceedToPayment() {
        if (!token || !submissionId) {
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
            const response = await fetch(`${API_URL}/api/payments/services/submissions/${submissionId}/checkout`, {
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

            router.push(`/dashboard/promo-tools/payment?checkoutId=${payload.checkoutId}`);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Unable to start payment checkout');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!submissionId) {
        return (
            <div className={styles.page}>
                <div className={styles.shell}>
                    <div className={styles.noticeError}>No promo submission was provided. Please go back and fill the form again.</div>
                </div>
            </div>
        );
    }

    const amount = config?.paymentAmount || 0;
    const currency = config?.paymentCurrency || 'INR';

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
                                <label htmlFor="promo-checkout-email">Email*</label>
                                <input
                                    id="promo-checkout-email"
                                    type="email"
                                    placeholder="abc@mail.com"
                                    value={form.email}
                                    onChange={event => updateField('email', event.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label htmlFor="promo-checkout-phone">Phone Number*</label>
                                <input
                                    id="promo-checkout-phone"
                                    type="tel"
                                    placeholder="xxxxxxxx"
                                    value={form.phone}
                                    onChange={event => updateField('phone', event.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label htmlFor="promo-checkout-address-1">Billing Address*</label>
                                <input
                                    id="promo-checkout-address-1"
                                    type="text"
                                    placeholder="Address Line 1"
                                    value={form.address1}
                                    onChange={event => updateField('address1', event.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <input
                                    id="promo-checkout-address-2"
                                    type="text"
                                    placeholder="Address Line 2(optional)"
                                    value={form.address2}
                                    onChange={event => updateField('address2', event.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.doubleRow}>
                                <div className={styles.fieldGroup}>
                                    <select value={form.countryCode} onChange={event => handleCountryChange(event.target.value)} className={styles.select}>
                                        <option value="">Country</option>
                                        {countries.map(country => (
                                            <option key={country.isoCode} value={country.isoCode}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <select value={form.stateCode} onChange={event => handleStateChange(event.target.value)} className={styles.select} disabled={!form.countryCode}>
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
                                    <select value={form.city} onChange={event => updateField('city', event.target.value)} className={styles.select} disabled={!form.stateCode}>
                                        <option value="">City</option>
                                        {cities.map(city => (
                                            <option key={`${city.countryCode}-${city.stateCode}-${city.name}`} value={city.name}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <input
                                        id="promo-checkout-postal-code"
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
                                <span className={styles.originalPrice}>{config ? formatCurrency(amount, currency) : '—'}</span>
                            </div>

                            <div className={styles.summaryLine}>
                                <div>
                                    <p className={styles.productName}>{config?.service.name || 'Promo Service'}</p>
                                    <p className={styles.productMeta}>
                                        {config?.status === 'PENDING_PAYMENT'
                                            ? 'Form submitted, awaiting payment completion'
                                            : 'Complete payment to send this form for review'}
                                    </p>
                                </div>
                                <span className={styles.summaryPrice}>{config ? formatCurrency(amount, currency) : '—'}</span>
                            </div>

                            <div className={styles.summaryDivider} />

                            <div className={styles.totalLine}>
                                <div>
                                    <p>Total</p>
                                    <small>Charged via PayU</small>
                                </div>
                                <span>{config ? formatCurrency(amount, currency) : '—'}</span>
                            </div>

                            {submitError && <div className={styles.noticeError}>{submitError}</div>}

                            <button
                                type="button"
                                className={styles.paymentButton}
                                onClick={() => void handleProceedToPayment()}
                                disabled={isLoading || isSubmitting || !!configError || !config?.paymentRequired}
                            >
                                {isSubmitting ? 'Preparing Payment...' : 'Proceed To Payment'}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
