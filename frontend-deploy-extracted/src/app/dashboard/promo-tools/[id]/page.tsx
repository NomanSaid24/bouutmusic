'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CollaborateWithUsForm } from '@/components/Promo/CollaborateWithUsForm';
import { DemoSubmissionForm } from '@/components/Promo/DemoSubmissionForm';
import { PlaylistSubmissionForm } from '@/components/Promo/PlaylistSubmissionForm';
import { PromoteMusicForm } from '@/components/Promo/PromoteMusicForm';
import { ReleaseMusicForm } from '@/components/Promo/ReleaseMusicForm';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
}

export default function ServiceFormPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const res = await fetch(`${apiUrl}/api/services`);
                if (res.ok) {
                    const services = await res.json();
                    const found = services.find((s: Service) => s.id === id);
                    setService(found);
                }
            } catch (error) {
                console.error('Failed to fetch service:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    const handleSubmit = async (formData: any) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/api/services/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ formData })
            });

            const payload = await res.json().catch(() => null) as {
                paymentRequired?: boolean;
                redirectUrl?: string;
                message?: string;
                error?: string;
            } | null;

            if (res.ok) {
                if (payload?.redirectUrl) {
                    router.push(payload.redirectUrl);
                    return;
                }

                alert(payload?.message || 'Submission successful! We will get back to you soon.');
                router.push('/dashboard/promo-tools');
            } else {
                alert(payload?.error || 'Failed to submit. Please try again.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('An error occurred during submission.');
        }
    };

    if (loading) {
        return (
            <div className="bouut-form-loader-screen" role="status" aria-live="polite">
                <div className="bouut-form-loader-card">
                    <div className="bouut-form-loader-spinner" />
                    <div className="bouut-form-loader-title">Preparing your form</div>
                    <div className="bouut-form-loader-text">
                        We&apos;re loading the promo request details and setting things up for you.
                    </div>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="bouut-form-loader-screen">
                <div className="bouut-form-loader-card bouut-form-loader-card-error">
                    <div className="bouut-form-loader-title">Service not found</div>
                    <div className="bouut-form-loader-text">
                        This promo form could not be loaded. Please go back and choose a service again.
                    </div>
                    <button type="button" className="btn btn-outline" onClick={() => router.push('/dashboard/promo-tools')}>
                        Back to Promo Tools
                    </button>
                </div>
            </div>
        );
    }

    const renderForm = () => {
        const lowerName = service.name.toLowerCase();
        if (lowerName.includes('demo')) {
            return <DemoSubmissionForm onSubmit={handleSubmit} onCancel={() => router.back()} />;
        }
        if (lowerName.includes('playlist')) {
            return <PlaylistSubmissionForm onSubmit={handleSubmit} onCancel={() => router.back()} />;
        }
        if (lowerName.includes('promote my music')) {
            return <PromoteMusicForm onSubmit={handleSubmit} onCancel={() => router.back()} />;
        }
        if (lowerName.includes('collaborate')) {
            return <CollaborateWithUsForm onSubmit={handleSubmit} onCancel={() => router.back()} />;
        }
        if (lowerName.includes('release')) {
            return <ReleaseMusicForm onSubmit={handleSubmit} onCancel={() => router.back()} />;
        }
        return (
            <div className="card p-8 text-center">
                <p className="text-gray-500 mb-4">The detailed form for "{service.name}" is currently under construction.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => router.back()} className="btn btn-outline">Go Back</button>
                    <button onClick={() => handleSubmit({})} className="btn btn-primary">Submit Simple Request</button>
                </div>
            </div>
        );
    };

    return (
        <div className="bouut-form-container">
            <nav className="bouut-form-breadcrumbs">
                <Link href="/dashboard">Home</Link>
                <span style={{ margin: '0 8px' }}>/</span>
                <Link href="/dashboard/promo-tools">Promote</Link>
                <span style={{ margin: '0 8px' }}>/</span>
                <span style={{ color: '#333', fontWeight: 500 }}>{service.name}</span>
            </nav>
            
            <header className="bouut-form-header">
                <h1>{service.name}</h1>
                <p>{service.description}</p>
            </header>

            <div className="bouut-demo-form">
                {renderForm()}
            </div>
        </div>
    );
}
