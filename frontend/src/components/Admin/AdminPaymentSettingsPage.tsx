'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './AdminPaymentSettingsPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type PaymentSettingsResponse = {
    id: string;
    mode: string;
    isEnabled: boolean;
    merchantId: string;
    merchantKey: string;
    hasSalt1: boolean;
    hasSalt2: boolean;
    salt1Mask: string;
    salt2Mask: string;
    currency: string;
    productName: string;
    originalAmount: number;
    discountedAmount: number;
    taxPercent: number;
    proDurationDays: number;
    updatedAt: string;
};

type PaymentSettingsForm = {
    mode: string;
    isEnabled: boolean;
    merchantId: string;
    merchantKey: string;
    salt1: string;
    salt2: string;
    currency: string;
    productName: string;
    originalAmount: number;
    discountedAmount: number;
    taxPercent: number;
    proDurationDays: number;
};

const INITIAL_FORM: PaymentSettingsForm = {
    mode: 'test',
    isEnabled: false,
    merchantId: '',
    merchantKey: '',
    salt1: '',
    salt2: '',
    currency: 'INR',
    productName: 'Songdew Pro',
    originalAmount: 4000,
    discountedAmount: 2000,
    taxPercent: 18,
    proDurationDays: 365,
};

export function AdminPaymentSettingsPage() {
    const { token } = useAuth();
    const [form, setForm] = useState<PaymentSettingsForm>(INITIAL_FORM);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [salt1Mask, setSalt1Mask] = useState('');
    const [salt2Mask, setSalt2Mask] = useState('');
    const [hasSalt1, setHasSalt1] = useState(false);
    const [hasSalt2, setHasSalt2] = useState(false);
    const [updatedAt, setUpdatedAt] = useState('');

    useEffect(() => {
        if (!token) {
            return;
        }

        let isMounted = true;

        async function loadSettings() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/api/admin/payment-settings`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                const payload = await response.json().catch(() => null) as PaymentSettingsResponse | { error?: string } | null;

                if (!response.ok || !payload || !('id' in payload)) {
                    throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Failed to load payment settings');
                }

                if (!isMounted) {
                    return;
                }

                setForm({
                    mode: payload.mode,
                    isEnabled: payload.isEnabled,
                    merchantId: payload.merchantId,
                    merchantKey: payload.merchantKey,
                    salt1: '',
                    salt2: '',
                    currency: payload.currency,
                    productName: payload.productName,
                    originalAmount: payload.originalAmount,
                    discountedAmount: payload.discountedAmount,
                    taxPercent: payload.taxPercent,
                    proDurationDays: payload.proDurationDays,
                });
                setSalt1Mask(payload.salt1Mask);
                setSalt2Mask(payload.salt2Mask);
                setHasSalt1(payload.hasSalt1);
                setHasSalt2(payload.hasSalt2);
                setUpdatedAt(payload.updatedAt);
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError instanceof Error ? loadError.message : 'Failed to load payment settings');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadSettings();

        return () => {
            isMounted = false;
        };
    }, [token]);

    function updateField<K extends keyof PaymentSettingsForm>(field: K, value: PaymentSettingsForm[K]) {
        setForm(previous => ({
            ...previous,
            [field]: value,
        }));
    }

    async function handleSave(clearSalt1 = false, clearSalt2 = false) {
        if (!token) {
            setError('You are not authorized to edit payment settings.');
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/payment-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    mode: form.mode.trim(),
                    merchantId: form.merchantId.trim(),
                    merchantKey: form.merchantKey.trim(),
                    currency: form.currency.trim().toUpperCase(),
                    productName: form.productName.trim(),
                    clearSalt1,
                    clearSalt2,
                }),
            });

            const payload = await response.json().catch(() => null) as PaymentSettingsResponse | { error?: string } | null;

            if (!response.ok || !payload || !('id' in payload)) {
                throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Failed to save payment settings');
            }

            setForm({
                mode: payload.mode,
                isEnabled: payload.isEnabled,
                merchantId: payload.merchantId,
                merchantKey: payload.merchantKey,
                salt1: '',
                salt2: '',
                currency: payload.currency,
                productName: payload.productName,
                originalAmount: payload.originalAmount,
                discountedAmount: payload.discountedAmount,
                taxPercent: payload.taxPercent,
                proDurationDays: payload.proDurationDays,
            });
            setSalt1Mask(payload.salt1Mask);
            setSalt2Mask(payload.salt2Mask);
            setHasSalt1(payload.hasSalt1);
            setHasSalt2(payload.hasSalt2);
            setUpdatedAt(payload.updatedAt);
            setSuccess('PayU payment settings were saved successfully.');
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Failed to save payment settings');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>PayU Payment Settings</h1>
                    <p>
                        Configure test or live PayU India credentials here so admins can switch merchant accounts later
                        without touching code. The checkout flow will automatically use the active PayU settings.
                    </p>
                </div>
                <div className={`${styles.statusPill} ${form.isEnabled ? styles.statusEnabled : styles.statusDisabled}`}>
                    <span>{form.isEnabled ? 'PayU Enabled' : 'PayU Disabled'}</span>
                </div>
            </div>

            {error && <div className={styles.noticeError}>{error}</div>}
            {success && <div className={styles.noticeSuccess}>{success}</div>}
            <div className={styles.noticeInfo}>
                Saved secrets are intentionally cleared from the textareas after save. Check the masked values and
                last saved timestamp below to confirm they were stored.
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.section}>
                        <h2 className={styles.sectionHeading}>Gateway Status</h2>
                        <p className={styles.sectionCopy}>
                            Keep PayU in test mode while verifying the hosted checkout flow with test cards and test UPI methods.
                        </p>

                        <div className={styles.toggleRow}>
                            <div className={styles.toggleText}>
                                <strong>Enable PayU payments</strong>
                                <span>Users can pay only when PayU is enabled and merchant credentials are configured.</span>
                            </div>
                            <input
                                type="checkbox"
                                className={styles.switch}
                                checked={form.isEnabled}
                                onChange={event => updateField('isEnabled', event.target.checked)}
                            />
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.field}>
                                <label htmlFor="payu-mode">Mode</label>
                                <select
                                    id="payu-mode"
                                    className={styles.select}
                                    value={form.mode}
                                    onChange={event => updateField('mode', event.target.value)}
                                >
                                    <option value="test">Test</option>
                                    <option value="live">Live</option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="payu-currency">Currency</label>
                                <input
                                    id="payu-currency"
                                    className={styles.input}
                                    value={form.currency}
                                    onChange={event => updateField('currency', event.target.value.toUpperCase())}
                                    placeholder="INR"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionHeading}>Merchant Credentials</h2>
                        <p className={styles.sectionCopy}>
                            Merchant key is posted to PayU checkout, while merchant salts stay on the backend and are used for request and response hashing.
                        </p>

                        <div className={styles.formGrid}>
                            <div className={styles.field}>
                                <label htmlFor="merchant-id">Merchant ID</label>
                                <input
                                    id="merchant-id"
                                    className={styles.input}
                                    value={form.merchantId}
                                    onChange={event => updateField('merchantId', event.target.value)}
                                    placeholder="8438541"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="merchant-key">Merchant Key</label>
                                <input
                                    id="merchant-key"
                                    className={styles.input}
                                    value={form.merchantKey}
                                    onChange={event => updateField('merchantKey', event.target.value)}
                                    placeholder="UX1TdR"
                                />
                                <div className={styles.helper}>Use the PayU merchant key here. The long private value belongs in Salt 2 below.</div>
                            </div>

                            <div className={styles.fieldFull}>
                                <label htmlFor="salt-1">Salt 1</label>
                                <textarea
                                    id="salt-1"
                                    className={styles.textarea}
                                    value={form.salt1}
                                    onChange={event => updateField('salt1', event.target.value)}
                                    placeholder={hasSalt1 ? `${salt1Mask} (leave blank to keep current)` : 'Enter PayU Salt 1'}
                                    rows={3}
                                />
                                {hasSalt1 && <div className={styles.helper}>Stored Salt 1: {salt1Mask}</div>}
                            </div>

                            <div className={styles.fieldFull}>
                                <label htmlFor="salt-2">Salt 2 / Secret Key / Private Key</label>
                                <textarea
                                    id="salt-2"
                                    className={styles.textarea}
                                    value={form.salt2}
                                    onChange={event => updateField('salt2', event.target.value)}
                                    placeholder={hasSalt2 ? `${salt2Mask} (leave blank to keep current)` : 'Optional: Enter PayU Salt 2 / secret key / private key'}
                                    rows={6}
                                />
                                {hasSalt2 && <div className={styles.helper}>Stored Salt 2 / Secret Key: {salt2Mask}</div>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionHeading}>Checkout Pricing</h2>
                        <p className={styles.sectionCopy}>
                            These values drive the billing page, PayU amount, GST summary, and Pro validity duration.
                        </p>

                        <div className={styles.formGrid}>
                            <div className={styles.fieldFull}>
                                <label htmlFor="product-name">Product name</label>
                                <input
                                    id="product-name"
                                    className={styles.input}
                                    value={form.productName}
                                    onChange={event => updateField('productName', event.target.value)}
                                    placeholder="Songdew Pro"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="original-amount">Original price</label>
                                <input
                                    id="original-amount"
                                    type="number"
                                    className={styles.input}
                                    value={form.originalAmount}
                                    onChange={event => updateField('originalAmount', Number(event.target.value))}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="discounted-amount">Discounted price</label>
                                <input
                                    id="discounted-amount"
                                    type="number"
                                    className={styles.input}
                                    value={form.discountedAmount}
                                    onChange={event => updateField('discountedAmount', Number(event.target.value))}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="tax-percent">GST / tax percent</label>
                                <input
                                    id="tax-percent"
                                    type="number"
                                    className={styles.input}
                                    value={form.taxPercent}
                                    onChange={event => updateField('taxPercent', Number(event.target.value))}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="duration-days">Pro duration (days)</label>
                                <input
                                    id="duration-days"
                                    type="number"
                                    className={styles.input}
                                    value={form.proDurationDays}
                                    onChange={event => updateField('proDurationDays', Number(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.buttonRow}>
                        <button type="button" className={styles.primaryButton} disabled={isSaving || isLoading} onClick={() => void handleSave()}>
                            {isSaving ? 'Saving...' : 'Save Payment Settings'}
                        </button>
                        <button type="button" className={styles.secondaryButton} disabled={isSaving || isLoading} onClick={() => window.location.reload()}>
                            Reload
                        </button>
                        {hasSalt1 && (
                            <button type="button" className={styles.dangerButton} disabled={isSaving || isLoading} onClick={() => void handleSave(true, false)}>
                                Clear Salt 1
                            </button>
                        )}
                        {hasSalt2 && (
                            <button type="button" className={styles.dangerButton} disabled={isSaving || isLoading} onClick={() => void handleSave(false, true)}>
                                Clear Salt 2
                            </button>
                        )}
                    </div>

                    {updatedAt && (
                        <div className={styles.metaRow}>
                            Last saved: {new Date(updatedAt).toLocaleString()}
                        </div>
                    )}
                </div>

                <aside className={styles.sideCard}>
                    <h2 className={styles.sectionHeading}>Recommended PayU Test Setup</h2>
                    <p className={styles.sectionCopy}>
                        Start in test mode, save your test merchant credentials here, and verify the full hosted checkout before switching to live mode.
                    </p>

                    <div className={styles.sideList}>
                        <div className={styles.sideItem}>
                            <strong>Merchant ID + Key</strong>
                            <span>Store the PayU test merchant ID and merchant key that belong to the account.</span>
                        </div>
                        <div className={styles.sideItem}>
                            <strong>Salt 1</strong>
                            <span>Used on the server to generate the request hash and validate the callback hash.</span>
                        </div>
                        <div className={styles.sideItem}>
                            <strong>Salt 2 / Secret Key / Private Key</strong>
                            <span>Store the long encrypted value here. It is saved on the backend and shown back only as a mask after save.</span>
                        </div>
                        <div className={styles.sideItem}>
                            <strong>Hosted Checkout</strong>
                            <span>The user is redirected to PayU’s universal payment page, which works better for an India-focused gateway than embedded card fields.</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
