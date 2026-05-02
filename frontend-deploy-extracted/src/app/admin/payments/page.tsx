'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, Search, Settings, TrendingUp } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type AdminPayment = {
    id: string;
    amount: number;
    amountSubtotal?: number | null;
    taxAmount?: number | null;
    currency: string;
    gateway: string;
    status: string;
    type: string;
    billingEmail?: string | null;
    billingPhone?: string | null;
    createdAt: string;
    completedAt?: string | null;
    user: {
        id: string;
        name: string;
        email: string;
    };
    payuMihpayId?: string | null;
    payuBankRefNum?: string | null;
    payuPaymentMode?: string | null;
};

function formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function AdminPaymentsPage() {
    const { token } = useAuth();
    const [payments, setPayments] = useState<AdminPayment[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        let isMounted = true;

        async function loadPayments() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/api/admin/payments`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                const payload = await response.json().catch(() => null) as AdminPayment[] | { error?: string } | null;

                if (!response.ok || !Array.isArray(payload)) {
                    throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Failed to load payments');
                }

                if (isMounted) {
                    setPayments(payload);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError instanceof Error ? loadError.message : 'Failed to load payments');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadPayments();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const filteredPayments = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return payments;
        }

        return payments.filter(payment =>
            payment.id.toLowerCase().includes(normalizedQuery) ||
            payment.user.name.toLowerCase().includes(normalizedQuery) ||
            payment.user.email.toLowerCase().includes(normalizedQuery) ||
            payment.type.toLowerCase().includes(normalizedQuery) ||
            payment.gateway.toLowerCase().includes(normalizedQuery),
        );
    }, [payments, query]);

    const completedPayments = payments.filter(payment => payment.status === 'COMPLETED');
    const monthlyRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const successRate = payments.length ? (completedPayments.length / payments.length) * 100 : 0;
    const payuPayments = payments.filter(payment => payment.gateway === 'payu').length;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Payments Overview</h1>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
                        Monitor live payment records saved from the PayU checkout flow.
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link href="/admin/payment-settings" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Settings size={18} /> Payment Settings
                    </Link>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Download size={18} /> Export Report
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
                <div className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>REVENUE (COMPLETED)</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>{formatAmount(monthlyRevenue, 'INR')}</div>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>SUCCESS RATE</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>{successRate.toFixed(1)}%</div>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>PAYU PAYMENTS</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>{payuPayments}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Stored payment records tied to actual users and billing info</div>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: '8px 8px 0 0', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Recent Transactions</div>
                    <div style={{ position: 'relative', width: 280 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search payment, user or email..."
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            style={{ paddingLeft: 36, height: 36, background: 'white' }}
                        />
                    </div>
                </div>

                {error && (
                    <div style={{ padding: '16px 24px', color: '#b91c1c', fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <div className="table-wrapper" style={{ margin: 0 }}>
                    <table style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>User</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Gateway</th>
                                <th>Reference / Method</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                                        Loading payment records...
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
                                        No payment records found yet.
                                    </td>
                                </tr>
                            ) : filteredPayments.map(payment => (
                                <tr key={payment.id}>
                                    <td style={{ fontFamily: 'monospace', color: '#6b7280', fontSize: 13 }}>{payment.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{payment.user.name}</div>
                                        <div style={{ color: '#6b7280', fontSize: 12 }}>{payment.user.email}</div>
                                    </td>
                                    <td style={{ textTransform: 'capitalize' }}>{payment.type}</td>
                                    <td style={{ fontWeight: 600, color: '#111827' }}>
                                        {formatAmount(payment.amount, payment.currency || 'INR')}
                                    </td>
                                    <td style={{ textTransform: 'capitalize' }}>{payment.gateway}</td>
                                    <td style={{ color: '#6b7280', fontSize: 13 }}>
                                        {payment.payuMihpayId
                                            ? `${payment.payuPaymentMode || 'PayU'} - ${payment.payuMihpayId}${payment.payuBankRefNum ? ` - ${payment.payuBankRefNum}` : ''}`
                                            : 'Captured via PayU hosted checkout'}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${
                                            payment.status === 'COMPLETED'
                                                ? 'green'
                                                : payment.status === 'FAILED'
                                                    ? 'red'
                                                    : 'yellow'
                                        }`}>
                                            {payment.status}
                                        </span>
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
