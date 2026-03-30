'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type RefundQueueItem = {
    id: string;
    status: string;
    paymentStatus: string;
    rejectionReason: string | null;
    refundRequestedAt: string | null;
    user: {
        id: string;
        name: string;
        email: string;
    };
    service: {
        id: string;
        name: string;
    } | null;
    payment: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        refundStatus: string;
        payuMihpayId: string | null;
        refundRequestId: string | null;
    } | null;
};

type RefundResult = {
    submissionId: string;
    paymentId?: string;
    status: string;
    message: string;
    refundRequestId?: string;
    refundTokenId?: string;
};

function formatAmount(amount: number, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatRefundState(item: RefundQueueItem) {
    if (item.paymentStatus === 'REFUND_PENDING') {
        return 'REFUND PENDING';
    }

    if (item.paymentStatus === 'REFUND_FAILED') {
        return 'REFUND FAILED';
    }

    if (item.paymentStatus === 'REFUNDED') {
        return 'REFUNDED';
    }

    if (item.payment?.refundStatus && item.payment.refundStatus !== 'NONE') {
        return item.payment.refundStatus;
    }

    return item.paymentStatus;
}

export default function AdminRefundsPage() {
    const { token } = useAuth();
    const [items, setItems] = useState<RefundQueueItem[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<RefundResult[]>([]);

    useEffect(() => {
        if (!token) {
            return;
        }

        let isMounted = true;

        async function loadQueue() {
            setIsLoading(true);
            setError(null);

            try {
                const queryString = new URLSearchParams();
                queryString.set('refundQueue', '1');
                if (query.trim()) {
                    queryString.set('search', query.trim());
                }

                const response = await fetch(`${API_URL}/api/admin/service-submissions?${queryString.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                const payload = await response.json().catch(() => null) as RefundQueueItem[] | { error?: string } | null;

                if (!response.ok || !Array.isArray(payload)) {
                    throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Failed to load refund queue');
                }

                if (isMounted) {
                    setItems(payload);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError instanceof Error ? loadError.message : 'Failed to load refund queue');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadQueue();

        return () => {
            isMounted = false;
        };
    }, [query, token]);

    const allSelected = useMemo(() => items.length > 0 && items.every(item => selected.includes(item.id)), [items, selected]);

    function toggleSelection(id: string) {
        setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
    }

    function toggleSelectAll() {
        setSelected(allSelected ? [] : items.map(item => item.id));
    }

    async function handleRefund(ids: string[]) {
        if (!token || ids.length === 0) {
            return;
        }

        const reason = window.prompt('Optional refund note for these rejected forms:') || undefined;

        try {
            setIsSubmitting(true);
            setError(null);

            const response = await fetch(`${API_URL}/api/admin/service-submissions/refunds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ids,
                    reason,
                }),
            });

            const payload = await response.json().catch(() => null) as { results?: RefundResult[]; error?: string } | null;

            if (!response.ok || !payload?.results) {
                throw new Error(payload?.error || 'Failed to trigger refunds');
            }

            setResults(payload.results);
            setSelected([]);
            setItems(previous => previous.filter(item => !ids.includes(item.id)));
        } catch (refundError) {
            setError(refundError instanceof Error ? refundError.message : 'Failed to trigger refunds');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Refund Queue</h1>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
                        Trigger one-by-one or bulk refunds for rejected paid promo submissions.
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={!selected.length || isSubmitting}
                        onClick={() => void handleRefund(selected)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >
                        <RotateCcw size={16} />
                        {isSubmitting ? 'Processing...' : `Refund Selected (${selected.length})`}
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, marginBottom: 24 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: '#f9fafb' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                        <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                        Select All
                    </label>
                    <div style={{ position: 'relative', width: 280 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search refund queue..."
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            style={{ paddingLeft: 36, height: 36, background: 'white' }}
                        />
                    </div>
                </div>

                {error && <div style={{ padding: '16px 24px', color: '#b91c1c', fontSize: 14 }}>{error}</div>}

                <div className="table-wrapper" style={{ margin: 0 }}>
                    <table style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Service</th>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Reason</th>
                                <th>Payment Ref</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading refund queue...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No rejected paid forms are waiting for refund.</td>
                                </tr>
                            ) : items.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(item.id)}
                                            onChange={() => toggleSelection(item.id)}
                                        />
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{item.service?.name || 'Unknown service'}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{item.user.name}</div>
                                        <div style={{ color: '#6b7280', fontSize: 12 }}>{item.user.email}</div>
                                    </td>
                                    <td>
                                        {item.payment ? formatAmount(item.payment.amount, item.payment.currency) : '—'}
                                        <div style={{ color: '#6b7280', fontSize: 12 }}>{formatRefundState(item)}</div>
                                    </td>
                                    <td style={{ color: '#6b7280', maxWidth: 280 }}>{item.rejectionReason || 'No rejection reason provided'}</td>
                                    <td style={{ color: '#6b7280', fontSize: 12 }}>
                                        {item.payment?.payuMihpayId || item.payment?.id || 'Pending'}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            style={{ padding: '6px 10px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                            disabled={isSubmitting}
                                            onClick={() => void handleRefund([item.id])}
                                        >
                                            <RotateCcw size={14} />
                                            Refund
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {results.length > 0 && (
                <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Latest Refund Results</h2>
                    <div style={{ display: 'grid', gap: 12 }}>
                        {results.map(result => (
                            <div key={`${result.submissionId}-${result.status}`} style={{ padding: 12, borderRadius: 8, background: '#f9fafb' }}>
                                <div style={{ fontWeight: 600 }}>{result.submissionId} - {result.status}</div>
                                <div style={{ color: '#6b7280', fontSize: 13 }}>{result.message}</div>
                                {result.refundRequestId && (
                                    <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Request ID: {result.refundRequestId}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
