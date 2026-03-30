'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Search, XCircle } from 'lucide-react';
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
    if (item.status !== 'PENDING') {
        return false;
    }

    if (!item.paymentRequired) {
        return true;
    }

    return item.paymentStatus === 'PAID' || item.payment?.status === 'COMPLETED';
}

function formatAmount(amount: number, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatFormDataPreview(formData: Record<string, unknown> | null) {
    if (!formData) {
        return 'No form data captured';
    }

    const entries = Object.entries(formData)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .slice(0, 4)
        .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);

    return entries.length ? entries.join(' • ') : 'No form data captured';
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

    if (item.status === 'PENDING_PAYMENT') {
        return 'WAITING FOR PAYMENT';
    }

    return item.paymentStatus || item.payment?.status || 'PENDING';
}

export default function AdminPromoSubmissionsPage() {
    const { token } = useAuth();
    const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
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

    const pendingCount = useMemo(() => submissions.filter(item => item.status === 'PENDING').length, [submissions]);

    async function handleReview(id: string, status: 'APPROVED' | 'REJECTED') {
        if (!token) {
            return;
        }

        const rejectionReason =
            status === 'REJECTED'
                ? window.prompt('Optional rejection reason for this promo submission:') || ''
                : '';

        try {
            setActionError(null);

            const response = await fetch(`${API_URL}/api/admin/service-submissions/${id}/review`, {
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
                        Review all paid and free promo tool submissions before approval or rejection.
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
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>PENDING REVIEW</div>
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
                                <th>Form Preview</th>
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
                                    <td style={{ maxWidth: 360, color: '#6b7280', fontSize: 13 }}>
                                        {formatFormDataPreview(item.formData)}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>
                                            {item.paymentRequired && item.paymentAmount
                                                ? formatAmount(item.paymentAmount, item.paymentCurrency || 'INR')
                                                : 'Free'}
                                        </div>
                                        <div style={{ color: '#6b7280', fontSize: 12 }}>
                                            {formatPaymentState(item)}
                                            {item.payment?.payuMihpayId ? ` • ${item.payment.payuMihpayId}` : ''}
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
                                            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                                                Waiting for payment
                                            </span>
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    style={{ padding: '6px 10px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                                    onClick={() => void handleReview(item.id, 'APPROVED')}
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    style={{ padding: '6px 10px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#dc2626', borderColor: '#fecaca' }}
                                                    onClick={() => void handleReview(item.id, 'REJECTED')}
                                                >
                                                    <XCircle size={14} />
                                                    Reject
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
