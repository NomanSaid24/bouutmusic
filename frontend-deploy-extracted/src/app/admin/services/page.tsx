'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Search } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type AdminService = {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string;
    isActive: boolean;
};

function formatAmount(amount: number, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function AdminServicesPage() {
    const { token } = useAuth();
    const [services, setServices] = useState<AdminService[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        let isMounted = true;

        async function loadServices() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/api/admin/services`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                const payload = await response.json().catch(() => null) as AdminService[] | { error?: string } | null;

                if (!response.ok || !Array.isArray(payload)) {
                    throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Failed to load services');
                }

                if (isMounted) {
                    setServices(payload);
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError instanceof Error ? loadError.message : 'Failed to load services');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadServices();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        service.description.toLowerCase().includes(query.trim().toLowerCase()),
    );

    function updateLocalService(id: string, patch: Partial<AdminService>) {
        setServices(previous => previous.map(service => service.id === id ? { ...service, ...patch } : service));
    }

    async function saveService(service: AdminService) {
        if (!token) {
            return;
        }

        try {
            setSavingId(service.id);
            setError(null);

            const response = await fetch(`${API_URL}/api/admin/services/${service.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: service.name,
                    description: service.description,
                    price: Number(service.price),
                    features: service.features,
                    isActive: service.isActive,
                }),
            });

            const payload = await response.json().catch(() => null) as AdminService | { error?: string } | null;

            if (!response.ok || !payload || !('id' in payload)) {
                throw new Error(payload && typeof payload === 'object' && 'error' in payload && payload.error ? payload.error : 'Failed to save service');
            }

            updateLocalService(service.id, payload);
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Failed to save service');
        } finally {
            setSavingId(null);
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Services & Pricing</h1>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
                        Manage promo tool pricing and activation used by the submission and payment flows.
                    </div>
                </div>
                <div style={{ position: 'relative', width: 280 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search service..."
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        style={{ paddingLeft: 36, height: 40, background: 'white' }}
                    />
                </div>
            </div>

            {error && <div style={{ marginBottom: 16, color: '#b91c1c', fontSize: 14 }}>{error}</div>}

            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrapper" style={{ margin: 0 }}>
                    <table style={{ margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading services...</td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No services found.</td>
                                </tr>
                            ) : filteredServices.map(service => (
                                <tr key={service.id}>
                                    <td style={{ minWidth: 220 }}>
                                        <input
                                            className="input-field"
                                            value={service.name}
                                            onChange={event => updateLocalService(service.id, { name: event.target.value })}
                                        />
                                    </td>
                                    <td style={{ minWidth: 300 }}>
                                        <textarea
                                            className="input-field"
                                            style={{ minHeight: 72 }}
                                            value={service.description}
                                            onChange={event => updateLocalService(service.id, { description: event.target.value })}
                                        />
                                    </td>
                                    <td style={{ minWidth: 150 }}>
                                        <input
                                            className="input-field"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={service.price}
                                            onChange={event => updateLocalService(service.id, { price: Number(event.target.value) })}
                                        />
                                        <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                                            {formatAmount(service.price)}
                                        </div>
                                    </td>
                                    <td style={{ minWidth: 140 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151', fontSize: 13 }}>
                                            <input
                                                type="checkbox"
                                                checked={service.isActive}
                                                onChange={event => updateLocalService(service.id, { isActive: event.target.checked })}
                                            />
                                            {service.isActive ? 'Active' : 'Inactive'}
                                        </label>
                                    </td>
                                    <td style={{ textAlign: 'right', minWidth: 130 }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-sm"
                                            style={{ padding: '6px 12px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                            disabled={savingId === service.id}
                                            onClick={() => void saveService(service)}
                                        >
                                            <Save size={14} />
                                            {savingId === service.id ? 'Saving...' : 'Save'}
                                        </button>
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
