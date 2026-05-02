'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from '../Subscription/SubscriptionPaymentPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type CheckoutDetails = {
    id: string;
    status: string;
    currency: string;
    paymentUrl: string;
    summary: {
        productName: string;
        originalAmount: number;
        discountedAmount: number;
        taxPercent: number;
        taxAmount: number;
        totalAmount: number;
        currency: string;
    };
    billing: {
        name: string | null;
        email: string | null;
        phone: string | null;
        address1: string | null;
        address2: string | null;
        country: string | null;
        state: string | null;
        city: string | null;
        postalCode: string | null;
        promoCode: string | null;
    };
    payu: {
        txnid: string | null;
        mihpayid: string | null;
        bankRefNum: string | null;
        paymentMode: string | null;
        status: string | null;
    };
    refund: {
        status: string;
        amount: number | null;
        refundedAt: string | null;
    };
    completedAt: string | null;
    submission: {
        id: string;
        status: string;
        paymentStatus: string;
        serviceId: string | null;
        serviceName: string;
    };
};

function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

export function PromoServicePaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const [checkout, setCheckout] = useState<CheckoutDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [hasAutoRedirected, setHasAutoRedirected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const hasNavigatedRef = useRef(false);

    const checkoutId = searchParams.get('checkoutId');
    const result = searchParams.get('result');

    useEffect(() => {
        if (!token || !checkoutId) {
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        async function loadCheckout() {
            setIsLoading(true);
            setLoadError(null);

            try {
                const response = await fetch(`${API_URL}/api/payments/services/checkouts/${checkoutId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                const payload = await response.json().catch(() => null) as CheckoutDetails | { error?: string } | null;

                if (!response.ok || !payload || !('id' in payload)) {
                    throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Unable to load payment details');
                }

                if (!isMounted) {
                    return;
                }

                setCheckout(payload);
            } catch (error) {
                if (isMounted) {
                    setLoadError(error instanceof Error ? error.message : 'Unable to load payment details');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadCheckout();

        return () => {
            isMounted = false;
        };
    }, [checkoutId, token]);

    useEffect(() => {
        if (!token || !checkoutId || !result) {
            return;
        }

        let isMounted = true;

        async function syncStatus() {
            setIsSyncing(true);
            setStatusError(null);

            try {
                const response = await fetch(`${API_URL}/api/payments/services/checkouts/${checkoutId}/sync`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const payload = await response.json().catch(() => null) as CheckoutDetails | { error?: string } | null;

                if (!response.ok || !payload || !('id' in payload)) {
                    throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Unable to refresh payment status');
                }

                if (!isMounted) {
                    return;
                }

                setCheckout(payload);

                if (payload.status === 'COMPLETED') {
                    setStatusMessage('Payment completed successfully. Your promo request is now waiting for admin review.');
                } else if (result === 'failed') {
                    setStatusError('PayU returned a failed payment status. You can try again below.');
                } else {
                    setStatusMessage('We refreshed the latest PayU payment status for you.');
                }

                router.replace(`/dashboard/promo-tools/payment?checkoutId=${checkoutId}`);
            } catch (error) {
                if (isMounted) {
                    setStatusError(error instanceof Error ? error.message : 'Unable to refresh payment status');
                }
            } finally {
                if (isMounted) {
                    setIsSyncing(false);
                }
            }
        }

        void syncStatus();

        return () => {
            isMounted = false;
        };
    }, [checkoutId, result, router, token]);

    useEffect(() => {
        if (
            !checkout ||
            checkout.status === 'COMPLETED' ||
            checkout.status === 'FAILED' ||
            hasAutoRedirected ||
            result ||
            !checkout.paymentUrl ||
            hasNavigatedRef.current
        ) {
            return;
        }

        const timer = window.setTimeout(() => {
            hasNavigatedRef.current = true;
            setHasAutoRedirected(true);
            window.location.assign(checkout.paymentUrl);
        }, 500);

        return () => window.clearTimeout(timer);
    }, [checkout, hasAutoRedirected, result]);

    if (!checkoutId) {
        return (
            <div className={styles.page}>
                <div className={styles.shell}>
                    <div className={styles.noticeError}>No checkout session was provided. Please start the promo checkout again.</div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.shell}>
                    <div className={styles.noticeInfo}>Preparing your PayU payment page...</div>
                </div>
            </div>
        );
    }

    if (loadError || !checkout) {
        return (
            <div className={styles.page}>
                <div className={styles.shell}>
                    <div className={styles.noticeError}>{loadError || 'Unable to load your PayU payment page.'}</div>
                    <button type="button" className={styles.backButton} onClick={() => router.push('/dashboard/promo-tools')}>
                        Back to Promo Tools
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.shell}>
                <div className={styles.headingBlock}>
                    <h1 className={styles.pageTitle}>Complete Payment</h1>
                    <p className={styles.pageSubtitle}>
                        Securely finish your {checkout.submission.serviceName} payment using PayU hosted checkout.
                    </p>
                </div>

                <div className={styles.layout}>
                    <section className={styles.paymentColumn}>
                        <div className={styles.sectionHeader}>
                            <h2>Payment Information</h2>
                        </div>

                        {statusMessage && <div className={styles.noticeSuccess}>{statusMessage}</div>}
                        {statusError && <div className={styles.noticeError}>{statusError}</div>}
                        {isSyncing && <div className={styles.noticeInfo}>Refreshing payment status...</div>}

                        <div className={styles.paymentCard}>
                            <div className={styles.billingPreview}>
                                <div className={styles.billingLine}>
                                    <span>Billing Contact</span>
                                    <p>{checkout.billing.name || 'Bouut User'} - {checkout.billing.email || 'No email provided'}</p>
                                </div>
                                <div className={styles.billingLine}>
                                    <span>Submission Status</span>
                                    <p>{checkout.submission.status} - {checkout.submission.paymentStatus}</p>
                                </div>
                                <div className={styles.billingLine}>
                                    <span>Billing Address</span>
                                    <p>
                                        {[checkout.billing.address1, checkout.billing.address2, checkout.billing.city, checkout.billing.state, checkout.billing.country, checkout.billing.postalCode]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.gatewayWrap}>
                                <p className={styles.gatewayNote}>
                                    PayU will open its hosted payment page with the available methods for this merchant account.
                                </p>

                                {checkout.status === 'COMPLETED' ? (
                                    <div className={styles.summaryMeta}>
                                        Payment confirmed via PayU. Your submission is queued for admin approval or rejection.
                                        {checkout.payu.mihpayid && <span> Reference: {checkout.payu.mihpayid}</span>}
                                    </div>
                                ) : (
                                    <div className={styles.redirectCard}>
                                        <h3>Redirecting to PayU...</h3>
                                        <p>
                                            We&apos;ve prepared your secure PayU hosted checkout session. If PayU does not open automatically, use the button below.
                                        </p>
                                        <button
                                            type="button"
                                            className={styles.paymentButton}
                                            onClick={() => {
                                                hasNavigatedRef.current = true;
                                                window.location.assign(checkout.paymentUrl);
                                            }}
                                            disabled={!checkout.paymentUrl}
                                        >
                                            Continue to PayU
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.backButton}
                                            onClick={() => router.push(`/dashboard/promo-tools/checkout?submissionId=${checkout.submission.id}`)}
                                        >
                                            Back to Billing Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className={styles.summaryColumn}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryTop}>
                                <h3>Order Summary</h3>
                                <span className={styles.originalPrice}>
                                    {formatCurrency(checkout.summary.totalAmount, checkout.summary.currency)}
                                </span>
                            </div>

                            <div className={styles.summaryLine}>
                                <div>
                                    <p className={styles.productName}>{checkout.submission.serviceName}</p>
                                    <p className={styles.productMeta}>Promo submission payment</p>
                                </div>
                                <span className={styles.summaryPrice}>
                                    {formatCurrency(checkout.summary.totalAmount, checkout.summary.currency)}
                                </span>
                            </div>

                            <div className={styles.summaryDivider} />

                            <div className={styles.totalLine}>
                                <div>
                                    <p>Total</p>
                                    <small>Captured via PayU</small>
                                </div>
                                <span>{formatCurrency(checkout.summary.totalAmount, checkout.summary.currency)}</span>
                            </div>

                            <div className={styles.summaryMeta}>
                                Billing details, PayU transaction records, and refund metadata are saved to your account and admin review workflow.
                            </div>

                            {(checkout.payu.mihpayid || checkout.payu.txnid) && (
                                <div className={styles.receiptLink}>
                                    PayU Txn: {checkout.payu.txnid || 'Pending'}{checkout.payu.mihpayid ? ` - PayU ID: ${checkout.payu.mihpayid}` : ''}
                                </div>
                            )}

                            {checkout.refund.status !== 'NONE' && (
                                <div className={styles.receiptLink}>
                                    Refund: {checkout.refund.status}{checkout.refund.amount ? ` - ${formatCurrency(checkout.refund.amount, checkout.summary.currency)}` : ''}
                                </div>
                            )}

                            {checkout.status !== 'COMPLETED' && (
                                <Link href={`/dashboard/promo-tools/checkout?submissionId=${checkout.submission.id}`} className={styles.receiptLink}>
                                    Edit Billing Details
                                </Link>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
