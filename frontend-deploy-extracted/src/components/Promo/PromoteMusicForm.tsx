'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface PromoteMusicFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

interface PromotionServiceOption {
    id: string;
    title: string;
    price: number;
    description: string;
}

const PROMOTION_SERVICES: PromotionServiceOption[] = [
    {
        id: 'instagram-story',
        title: 'Instagram Story',
        price: 49,
        description: 'Instagram Story - INR 49',
    },
    {
        id: 'instagram-post',
        title: 'Instagram Post',
        price: 99,
        description: 'Instagram Post - INR 99',
    },
    {
        id: 'bundle-pack',
        title: 'Bundle Pack Includes (Story, Post, Reel)',
        price: 298,
        description: 'Unlock the VIP stage for your music on our Instagram page with stories, posts, and reels.',
    },
    {
        id: 'instagram-reel',
        title: 'Instagram Reel',
        price: 150,
        description: 'Instagram Reel - INR 150',
    },
    {
        id: 'upcoming-release-buzz',
        title: 'Create buzz for my upcoming release',
        price: 499,
        description: 'A 7-day pre-release campaign with posters, snippets, release alerts, and strategic marketing.',
    },
    {
        id: 'new-friday-music',
        title: 'Get my music listed to "New Friday Music"',
        price: 399,
        description: 'Get your music listed to Bouut Music’s fresh release playlist updated every Friday.',
    },
    {
        id: 'highlights',
        title: 'Reserve my spot in highlights',
        price: 199,
        description: 'Reserve your spot in our Instagram highlights so visitors and brands find your content first.',
    },
    {
        id: 'get-to-know-me',
        title: 'Get me listed to "Get To Know Me"',
        price: 199,
        description: 'Share your artist story and the journey behind your songs through our spotlight format.',
    },
    {
        id: 'infinite-promotion',
        title: 'Infinite Promotion',
        price: 999,
        description: 'Pay once and get year-round promotion support across multiple placements.',
    },
];

function formatCurrency(amount: number) {
    return `INR ${amount.toFixed(2)}`;
}

export function PromoteMusicForm({ onSubmit, onCancel }: PromoteMusicFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        linkToSong: '',
        artistFirstName: '',
        artistLastName: '',
        email: '',
        instagramHandle: '',
        mobile: '',
        trackInformation: '',
    });
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [couponState, setCouponState] = useState<'idle' | 'success' | 'error'>('idle');
    const [selectionError, setSelectionError] = useState('');

    useEffect(() => {
        const nameParts = (user?.name || '').trim().split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ');

        setFormData(current => ({
            ...current,
            artistFirstName: current.artistFirstName || firstName,
            artistLastName: current.artistLastName || lastName,
            email: current.email || user?.email || '',
            instagramHandle: current.instagramHandle || user?.instagram || '',
        }));
    }, [user?.email, user?.instagram, user?.name]);

    const selectedServiceDetails = PROMOTION_SERVICES.filter(service => selectedServices.includes(service.id));
    const subtotal = selectedServiceDetails.reduce((sum, service) => sum + service.price, 0);

    let discountAmount = 0;
    if (appliedCoupon === 'BOUUTMUSIC10' && selectedServices.includes('bundle-pack')) {
        discountAmount = 29.8;
    }
    const total = Math.max(0, subtotal - discountAmount);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(current => ({ ...current, [name]: value }));
    };

    const handleToggleService = (serviceId: string) => {
        setSelectedServices(current =>
            current.includes(serviceId)
                ? current.filter(id => id !== serviceId)
                : [...current, serviceId]
        );
        setSelectionError('');
    };

    const handleApplyCoupon = () => {
        const code = couponInput.trim().toUpperCase();

        if (!code) {
            setAppliedCoupon('');
            setCouponMessage('Enter a coupon code to apply.');
            setCouponState('error');
            return;
        }

        if (code === 'BOUUTMUSIC10') {
            if (!selectedServices.includes('bundle-pack')) {
                setAppliedCoupon('');
                setCouponMessage('BOUUTMUSIC10 works when the Bundle Pack is selected.');
                setCouponState('error');
                return;
            }

            setAppliedCoupon(code);
            setCouponMessage('Coupon applied. 10% off on Bundle Pack.');
            setCouponState('success');
            return;
        }

        if (code === 'BMMD30') {
            setAppliedCoupon('');
            setCouponMessage('BMMD30 applies to music distribution service, not this promotion form.');
            setCouponState('error');
            return;
        }

        setAppliedCoupon('');
        setCouponMessage('Invalid coupon code.');
        setCouponState('error');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedServices.length === 0) {
            setSelectionError('Please choose at least one service.');
            return;
        }

        onSubmit({
            ...formData,
            selectedServices: selectedServiceDetails,
            couponCode: appliedCoupon || couponInput.trim().toUpperCase(),
            subtotal,
            discountAmount,
            total,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bouut-demo-form">
            <div className="bouut-offers-card">
                <p><strong>Offers:</strong></p>
                <p>Use coupon code <strong>BOUUTMUSIC10</strong> to get straight 10% off on Bundle Pack.</p>
                <p>Use coupon code <strong>BMMD30</strong> to get 30% off on our music distribution service.</p>
            </div>

            <div className="bouut-form-divider" />

            <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                <label>Link to the song<span className="bouut-required">*</span></label>
                <input
                    type="url"
                    name="linkToSong"
                    required
                    placeholder="Target link where visitors will go after click"
                    value={formData.linkToSong}
                    onChange={handleChange}
                />
                <p className="bouut-help-text">Target Link where visitors will go after Click</p>
            </div>

            <div className="bouut-form-row">
                <div className="bouut-form-group">
                    <label>Main Artist First Name<span className="bouut-required">*</span></label>
                    <input
                        type="text"
                        name="artistFirstName"
                        required
                        placeholder="First Name"
                        value={formData.artistFirstName}
                        onChange={handleChange}
                    />
                    <p className="bouut-help-text">First Name</p>
                </div>
                <div className="bouut-form-group">
                    <label>Main Artist Last Name<span className="bouut-required">*</span></label>
                    <input
                        type="text"
                        name="artistLastName"
                        required
                        placeholder="Last Name"
                        value={formData.artistLastName}
                        onChange={handleChange}
                    />
                    <p className="bouut-help-text">Last Name</p>
                </div>
            </div>

            <div className="bouut-form-row">
                <div className="bouut-form-group">
                    <label>Email<span className="bouut-required">*</span></label>
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="example@example.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <p className="bouut-help-text">example@example.com</p>
                </div>
                <div className="bouut-form-group">
                    <label>Link to your Instagram handle<span className="bouut-required">*</span></label>
                    <input
                        type="url"
                        name="instagramHandle"
                        required
                        placeholder="https://instagram.com/yourhandle"
                        value={formData.instagramHandle}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="bouut-form-group full-width" style={{ marginBottom: '20px' }}>
                <label>Mobile / Whatsapp / Telegram No.<span className="bouut-required">*</span></label>
                <input
                    type="tel"
                    name="mobile"
                    required
                    placeholder="(000) 000-0000"
                    value={formData.mobile}
                    onChange={handleChange}
                />
                <p className="bouut-help-text">For faster communications</p>
            </div>

            <div className="bouut-form-group full-width" style={{ marginBottom: '24px' }}>
                <label>Track Information</label>
                <textarea
                    name="trackInformation"
                    placeholder="Type here..."
                    value={formData.trackInformation}
                    onChange={handleChange}
                />
                <p className="bouut-help-text">Be descriptive as possible</p>
            </div>

            <div className="bouut-form-group full-width" style={{ marginBottom: '16px' }}>
                <label>Our Services</label>
                <div className="bouut-service-list">
                    {PROMOTION_SERVICES.map(service => {
                        const selected = selectedServices.includes(service.id);

                        return (
                            <button
                                key={service.id}
                                type="button"
                                className={`bouut-service-option ${selected ? 'selected' : ''}`}
                                onClick={() => handleToggleService(service.id)}
                            >
                                <div className="bouut-service-option-check" aria-hidden="true">
                                    <span />
                                </div>
                                <div className="bouut-service-option-copy">
                                    <div className="bouut-service-option-head">
                                        <strong>{service.title}</strong>
                                        <span>{formatCurrency(service.price)}</span>
                                    </div>
                                    <p>{service.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {selectionError ? <p className="bouut-form-error">{selectionError}</p> : null}
            </div>

            <div className="bouut-coupon-summary">
                <div className="bouut-coupon-box">
                    <label htmlFor="promotion-coupon">Enter coupon</label>
                    <div className="bouut-coupon-row">
                        <input
                            id="promotion-coupon"
                            type="text"
                            placeholder="Enter Coupon Code"
                            value={couponInput}
                            onChange={e => setCouponInput(e.target.value)}
                        />
                        <button type="button" className="bouut-btn bouut-btn-cancel" onClick={handleApplyCoupon}>
                            Apply
                        </button>
                    </div>
                    {couponMessage ? (
                        <p className={`bouut-coupon-message ${couponState === 'success' ? 'success' : 'error'}`}>
                            {couponMessage}
                        </p>
                    ) : null}
                </div>

                <div className="bouut-total-box">
                    <div className="bouut-total-line">
                        <span>Subtotal</span>
                        <strong>{formatCurrency(subtotal)}</strong>
                    </div>
                    <div className="bouut-total-line">
                        <span>Discount</span>
                        <strong>- {formatCurrency(discountAmount)}</strong>
                    </div>
                    <div className="bouut-total-line bouut-total-line-final">
                        <span>Total</span>
                        <strong>{formatCurrency(total)}</strong>
                    </div>
                </div>
            </div>

            <div className="bouut-form-actions">
                <button type="button" onClick={onCancel} className="bouut-btn bouut-btn-cancel">
                    Cancel
                </button>
                <button type="submit" className="bouut-btn bouut-btn-submit">
                    Submit &amp; Pay
                </button>
            </div>
        </form>
    );
}
