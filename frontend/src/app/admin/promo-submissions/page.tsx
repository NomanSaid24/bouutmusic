'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, RefreshCw, Search, XCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type AdminSubmission = {
    id: string;
    status: string;
    paymentStatus: string;
    paymentRequired: boolean;
    paymentAmount: number | null;
    paymentCurrency: string | null;
    rejectionReason: string | null;
    adminNotes: string | null;
    createdAt: string;
    reviewedAt: string | null;
    user: {
        id: string;
        name: string;
        email: string;
    };
    service: {
        id: string;
        name: string;
        price: number;
    } | null;
    formData: Record<string, unknown> | null;
    payment: {
        id: string;
        status: string;
        gateway: string;
        payuMihpayId: string | null;
        payuTxnId: string | null;
        refundStatus: string;
    } | null;
};

function isReviewedStatus(status: string) {
    return status === 'APPROVED' || status === 'REJECTED';
}

function isReviewable(item: AdminSubmission) {
    if (isReviewedStatus(item.status)) {
        return false;
    }

    if (!item.paymentRequired) {
        return item.status === 'PENDING';
    }

    return (
        item.paymentStatus === 'PAID' ||
        item.payment?.status === 'COMPLETED'
    );
}

function canSyncPayment(item: AdminSubmission) {
    return (
        item.paymentRequired &&
        !isReviewedStatus(item.status) &&
        item.payment?.gateway === 'payu' &&
        !!item.payment.payuTxnId &&
        item.payment.status !== 'COMPLETED' &&
        item.payment.status !== 'FAILED'
    );
}

function formatAmount(amount: number, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatPaymentState(item: AdminSubmission) {
    if (!item.paymentRequired) {
        return 'FREE';
    }

    if (item.paymentStatus === 'PAID' || item.payment?.status === 'COMPLETED') {
        return 'PAID';
    }

    if (item.paymentStatus === 'REFUND_PENDING') {
        return 'REFUND PENDING';
    }

    if (item.paymentStatus === 'REFUNDED') {
        return 'REFUNDED';
    }

    if (item.paymentStatus === 'REFUND_FAILED') {
        return 'REFUND FAILED';
    }

    if (item.paymentStatus === 'FAILED' || item.payment?.status === 'FAILED') {
        return 'FAILED';
    }

    if (item.status === 'PENDING_PAYMENT' && item.payment?.payuTxnId) {
        return 'CHECKING PAYU';
    }

    if (item.status === 'PENDING_PAYMENT') {
        return 'WAITING FOR CHECKOUT';
    }

    return item.paymentStatus || item.payment?.status || 'PENDING';
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

function humanize(value: string) {
    return value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, character => character.toUpperCase());
}

function stringifyPreviewValue(value: unknown) {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    if (typeof value === 'string') {
        return value.trim();
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    const record = asRecord(value);
    if (record) {
        return stringifyPreviewValue(record.title || record.name || record.label || record.id);
    }

    return '';
}

function truncatePreview(value: string, maxLength = 92) {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength - 3)}...`;
}

function readFirst(formData: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
        const value = stringifyPreviewValue(formData[key]);
        if (value) {
            return value;
        }
    }

    return '';
}

function getPlanPreview(formData: Record<string, unknown>) {
    const pricingMeta = asRecord(formData.pricingMeta);
    const pricingPlan = pricingMeta ? asRecord(pricingMeta.plan) : null;
    const selectedPlan = asRecord(formData.selectedPlan);
    const planObject = asRecord(formData.plan);

    const planTitle =
        stringifyPreviewValue(planObject?.title) ||
        stringifyPreviewValue(selectedPlan?.title) ||
        stringifyPreviewValue(pricingPlan?.title) ||
        stringifyPreviewValue(formData.planId) ||
        stringifyPreviewValue(formData.plan);

    return planTitle ? humanize(planTitle) : '';
}

function getArtistPreview(formData: Record<string, unknown>) {
    const combinedName = [
        stringifyPreviewValue(formData.artistFirstName),
        stringifyPreviewValue(formData.artistLastName),
    ].filter(Boolean).join(' ');

    return (
        readFirst(formData, ['artistName', 'stageName', 'mainArtist', 'bandName', 'name']) ||
        combinedName
    );
}

function getSelectedServicesPreview(formData: Record<string, unknown>) {
    const selectedServices = Array.isArray(formData.selectedServices) ? formData.selectedServices : [];
    const values = selectedServices
        .map(item => humanize(stringifyPreviewValue(item)))
        .filter(Boolean);

    return values.length ? truncatePreview(values.slice(0, 4).join(', '), 100) : '';
}

function getFormPreviewRows(item: AdminSubmission) {
    const formData = item.formData || {};
    const rows: Array<{ label: string; value: string }> = [];
    const addRow = (label: string, value: string) => {
        const cleanValue = truncatePreview(value.trim());
        if (cleanValue && !rows.some(row => row.label === label && row.value === cleanValue)) {
            rows.push({ label, value: cleanValue });
        }
    };

    addRow('Plan', getPlanPreview(formData));
    addRow('Artist', getArtistPreview(formData));
    addRow('Track', readFirst(formData, ['trackTitle', 'releaseTitle', 'songTitle', 'title', 'trackInformation']));
    addRow('Link', readFirst(formData, ['linkToSong', 'songLink', 'spotifyUrl', 'downloadLink', 'youtube', 'youtubeHandle']));
    addRow('Contact', readFirst(formData, ['email', 'mobile', 'phone', 'instagramHandle', 'instagram']));
    addRow('Playlist', readFirst(formData, ['playlist']));
    addRow('Genre', readFirst(formData, ['genre', 'language', 'trackLanguage']));
    addRow('Add-ons', getSelectedServicesPreview(formData));
    addRow('Coupon', readFirst(formData, ['couponCode']));

    if (!rows.length) {
        addRow('Service', item.service?.name || 'Service submission');
    }

    return rows.slice(0, 6);
}

function renderFormPreview(item: AdminSubmission) {
    const rows = getFormPreviewRows(item);

    return (
        <div style={{ display: 'grid', gap: 7 }}>
            {rows.map(row => (
                <div key={`${row.label}-${row.value}`} style={{ display: 'grid', gridTemplateColumns: '74px minmax(0, 1fr)', gap: 10, alignItems: 'start' }}>
                    <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>{row.label}</span>
                    <span style={{ color: '#374151', fontSize: 13, lineHeight: 1.45, overflowWrap: 'anywhere' }}>{row.value}</span>
                </div>
            ))}
        </div>
    );
}

function getApproveLabel(item: AdminSubmission) {
    return item.paymentRequired ? 'Approve Payment' : 'Approve';
}

function getRejectLabel(item: AdminSubmission) {
    return item.paymentRequired ? 'Reject Payment' : 'Reject';
}

export default function AdminPromoSubmissionsPage() {
    const { token } = useAuth();
    const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [activeStatus, setActiveStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

    useEffect(() => {
        if (!token) {
            return;
        }

        let isMounted = true;

        async function loadSubmissions() {
            setIsLoading(true);
            setError(null);

            try {
                const queryString = new URLSearchParams();
                if (activeStatus !== 'ALL') {
                    queryString.set('status', activeStatus);
                }
                if (query.trim()) {
                    queryString.set('search', query.trim());
                }

                const response = await fetch(`${API_URL}/api/admin/service-submissions?${queryString.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                const payload = await response.json().catch(() => null) as AdminSubmission[] | { error?: string } | null;

                if (!response.ok || !Array.isArray(payload)) {
                    throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Failed to load promo submissions');
                }

                if (isMounted) {
                    setSubmissions(payload);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError instanceof Error ? loadError.message : 'Failed to load promo submissions');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadSubmissions();

        return () => {
            isMounted = false;
        };
    }, [activeStatus, query, token]);

    const pendingCount = useMemo(() => submissions.filter(isReviewable).length, [submissions]);

    async function handleSyncPayment(id: string) {
        if (!token) {
            return;
        }

        try {
            setSyncingId(id);
            setActionError(null);

            const response = await fetch(`${API_URL}/api/admin/service-submissions/${id}/sync-payment`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const payload = await response.json().catch(() => null) as AdminSubmission | { error?: string } | null;

            if (!response.ok || !payload || !('id' in payload)) {
                throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Failed to refresh PayU payment');
            }

            setSubmissions(previous => previous.map(item => item.id === payload.id ? payload : item));
        } catch (syncError) {
            setActionError(syncError instanceof Error ? syncError.message : 'Failed to refresh PayU payment');
        } finally {
            setSyncingId(null);
        }
    }

    async function handleReview(item: AdminSubmission, status: 'APPROVED' | 'REJECTED') {
        if (!token) {
            return;
        }

        const rejectionReason =
            status === 'REJECTED'
                ? window.prompt('Optional rejection reason for this promo submission:') || ''
                : '';

        try {
            setActionError(null);

            const response = await fetch(`${API_URL}/api/admin/service-submissions/${item.id}/review`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status,
                    rejectionReason,
                }),
            });

            const payload = await response.json().catch(() => null) as AdminSubmission | { error?: string } | null;

            if (!response.ok || !payload || !('id' in payload)) {
                throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Failed to update submission');
            }

            setSubmissions(previous => previous.map(item => item.id === payload.id ? payload : item));
        } catch (reviewError) {
            setActionError(reviewError instanceof Error ? reviewError.message : 'Failed to update submission');
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Promo Submissions</h1>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
                        Review all paid and free service submissions before approval or rejection.
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
                        <button
                            key={status}
                            type="button"
                            className={activeStatus === status ? 'btn btn-primary' : 'btn btn-outline'}
                            onClick={() => setActiveStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>TOTAL SUBMISSIONS</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>{submissions.length}</div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>READY FOR REVIEW</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>{pendingCount}</div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>REJECTED PAID FORMS</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>
                        {submissions.filter(item => item.status === 'REJECTED' && item.paymentRequired).length}
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: '#f9fafb' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Incoming Requests</div>
                    <div style={{ position: 'relative', width: 280 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search user, service or status..."
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            style={{ paddingLeft: 36, height: 36, background: 'white' }}
                        />
                    </div>
                </div>

                {error && <div style={{ padding: '16px 24px', color: '#b91c1c', fontSize: 14 }}>{error}</div>}
                {actionError && <div style={{ padding: '0 24px 16px', color: '#b91c1c', fontSize: 14 }}>{actionError}</div>}

                <div className="table-wrapper" style={{ margin: 0 }}>
                    <table style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>User</th>
                                <th>Important Details</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading promo submissions...</td>
                                </tr>
                            ) : submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No promo submissions found.</td>
                                </tr>
                            ) : submissions.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{item.service?.name || 'Unknown service'}</div>
                                        <div style={{ color: '#6b7280', fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{item.user.name}</div>
                                        <div style={{ color: '#6b7280', fontSize: 12 }}>{item.user.email}</div>
                                    </td>
                                    <td style={{ minWidth: 310, maxWidth: 430, color: '#6b7280', fontSize: 13 }}>
                                        {renderFormPreview(item)}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>
                                            {item.paymentRequired && item.paymentAmount
                                                ? formatAmount(item.paymentAmount, item.paymentCurrency || 'INR')
                                                : 'Free'}
                                        </div>
                                        <div style={{ color: '#6b7280', fontSize: 12 }}>
                                            {formatPaymentState(item)}
                                            {item.payment?.payuMihpayId
                                                ? ` - ${item.payment.payuMihpayId}`
                                                : item.payment?.payuTxnId
                                                    ? ` - ${item.payment.payuTxnId}`
                                                    : ''}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${
                                            item.status === 'APPROVED'
                                                ? 'green'
                                                : item.status === 'REJECTED'
                                                    ? 'red'
                                                    : 'yellow'
                                        }`}>
                                            {item.status}
                                        </span>
                                        {item.rejectionReason && (
                                            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>{item.rejectionReason}</div>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {isReviewedStatus(item.status) ? (
                                            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                                                Review Complete
                                            </span>
                                        ) : !isReviewable(item) ? (
                                            canSyncPayment(item) ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    style={{ padding: '6px 10px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                                    disabled={syncingId === item.id}
                                                    onClick={() => void handleSyncPayment(item.id)}
                                                >
                                                    <RefreshCw size={14} />
                                                    {syncingId === item.id ? 'Checking' : 'Refresh PayU'}
                                                </button>
                                            ) : (
                                                <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                                                    Waiting for checkout
                                                </span>
                                            )
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    style={{ padding: '6px 10px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                                    onClick={() => void handleReview(item, 'APPROVED')}
                                                >
                                                    <CheckCircle2 size={14} />
                                                    {getApproveLabel(item)}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    style={{ padding: '6px 10px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#dc2626', borderColor: '#fecaca' }}
                                                    onClick={() => void handleReview(item, 'REJECTED')}
                                                >
                                                    <XCircle size={14} />
                                                    {getRejectLabel(item)}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
