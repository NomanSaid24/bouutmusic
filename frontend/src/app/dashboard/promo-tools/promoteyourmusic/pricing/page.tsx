'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PromoteMusicPricingPage() {
    const router = useRouter();

    const handleSelectPlan = (planId: string) => {
        router.push(`/dashboard/promo-tools/cmnd249d0003zuy8o1zicok20?plan=${planId}`);
    };

    return (
        <div>
            <div className="breadcrumb">
                <Link href="/dashboard">Home</Link><span>/</span> 
                <Link href="/dashboard/promo-tools">Promote Tools</Link><span>/</span> 
                Promote Your Music
            </div>

            {/* Explanation Section (Moved to top, replacing header text) */}
            <div style={{ 
                maxWidth: 1080, 
                margin: '40px auto 60px', 
                backgroundColor: 'transparent',
                borderTop: '1px dashed var(--border)',
                paddingTop: 60,
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 60
            }}>
                {/* Text Side (Left) */}
                <div style={{ flex: '1 1 0%', minWidth: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 20, fontFamily: 'Oswald, sans-serif', lineHeight: 1.2 }}>
                        <span style={{ color: '#ffffff' }}>Our Mission: </span>
                        <span style={{ color: '#e6e5dd' }}>Transparent Music Business Administration</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
                        More than distribution, we're your growth partners. We replicate the core theme of music administration, making it a clear value proposition statement about empowering artists. Integrate a powerful photo of an artist working, with stylized data points floating around them.
                    </p>
                    {/* <Link href="/dashboard/promo-tools" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        padding: '10px 24px',
                        borderRadius: 999,
                        fontWeight: 700,
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 1.2,
                        alignSelf: 'flex-start',
                        textDecoration: 'none',
                        transition: 'background 0.2s',
                    }}>
                        LEARN MORE &nbsp; <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
                    </Link> */}
                </div>

                {/* Image Side (Right) */}
                <div style={{ flex: '1 1 0%', minWidth: 320, position: 'relative', minHeight: 360 }}>
                    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, border: '1px dashed #4b4b4b', borderRadius: 20, overflow: 'hidden' }}>
                        <Image 
                            src="/images/music_promo_art.png" 
                            alt="Music Promotion abstract visualization" 
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>

            {/* Pricing Cards Row */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch',
                gap: 20,
                flexWrap: 'wrap',
                maxWidth: 1080,
                margin: '0 auto 60px auto',
                padding: '20px 10px'
            }}>
                
                {/* 1. Starter Boost (Left - Light BG) */}
                <div style={{ 
                    flex: '1 1 300px', 
                    maxWidth: 320,
                    minHeight: 460,
                    backgroundColor: '#e6e5dd', 
                    border: '2px dashed #9b918d',
                    borderRadius: 16, 
                    padding: '36px 28px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    color: '#201817' 
                }}>
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#111111' }}>Starter Boost</h3>
                        <p style={{ fontSize: 13, color: '#4b3416', marginBottom: 16 }}>Perfect for a quick bump</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>INR</span>
                            <span style={{ fontSize: 44, fontWeight: 900 }}>299</span>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: 32 }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#201817', color: '#e6e5dd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                                1 Story
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#201817', color: '#e6e5dd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                                1 Feed Post or Reel
                            </li>
                        </ul>
                    </div>
                    
                    <button 
                        style={{ 
                            width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700, borderRadius: 8, 
                            backgroundColor: '#201817', color: '#ffffff', border: 'none', cursor: 'pointer',
                            marginTop: 'auto'
                        }}
                        onClick={() => handleSelectPlan('starter-boost')}
                    >
                        Select Starter Boost
                    </button>
                </div>

                {/* 2. Growth Push (Middle - Header Gradient BG) */}
                <div style={{ 
                    flex: '1 1 300px', 
                    maxWidth: 340,
                    minHeight: 500, 
                    background: 'var(--header-bg)', 
                    border: '2px dashed #ffffff',
                    borderRadius: 16, 
                    padding: '44px 32px 36px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    color: '#ffffff',
                    boxShadow: '0 20px 40px rgba(233, 96, 97, 0.3)',
                    position: 'relative',
                    transform: 'scale(1.06)',
                    zIndex: 10
                }}>
                    <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', color: 'var(--primary)', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        Most Popular
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Growth Push</h3>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>For serious artists</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>INR</span>
                            <span style={{ fontSize: 48, fontWeight: 900 }}>899</span>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: 32 }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#ffffff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                                1 Reel
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#ffffff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                                1 Feed Post
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#ffffff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                                3-5 Stories
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#ffffff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>âœ“</div>
                                Friday Spotlight Access
                            </li>
                        </ul>
                    </div>
                    
                    <button 
                        style={{ 
                            width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700, borderRadius: 8, 
                            backgroundColor: '#ffffff', color: 'var(--primary)', border: 'none', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: 'auto'
                        }}
                        onClick={() => handleSelectPlan('growth-push')}
                    >
                        Select Growth Push
                    </button>
                </div>

                {/* 3. Viral Launch (Right - Light BG) */}
                <div style={{ 
                    flex: '1 1 300px', 
                    maxWidth: 320,
                    minHeight: 460,
                    backgroundColor: '#e6e5dd', 
                    border: '2px dashed #9b918d',
                    borderRadius: 16, 
                    padding: '36px 28px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    color: '#201817' 
                }}>
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#111111' }}>Viral Launch</h3>
                        <p style={{ fontSize: 13, color: '#4b3416', marginBottom: 16 }}>Maximum exposure</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>INR</span>
                            <span style={{ fontSize: 44, fontWeight: 900 }}>2,499</span>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: 32 }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#201817', color: '#e6e5dd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                                Pre-release hype campaign
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#201817', color: '#e6e5dd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                                2-3 Reels
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#201817', color: '#e6e5dd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                                8-10 Story sequence
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#201817', color: '#e6e5dd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>âœ“</div>
                                Friday Spotlight Access
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#201817', color: '#e6e5dd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✓</div>
                                Highlight placement
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#201817', color: '#e6e5dd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>âœ“</div>
                                Weekly top picks access
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#201817', color: '#e6e5dd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>âœ“</div>
                                Artist Introduction
                            </li>
                        </ul>
                    </div>
                    
                    <button 
                        style={{ 
                            width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700, borderRadius: 8, 
                            backgroundColor: '#201817', color: '#ffffff', border: 'none', cursor: 'pointer',
                            marginTop: 'auto'
                        }}
                        onClick={() => handleSelectPlan('viral-launch')}
                    >
                        Select Viral Launch
                    </button>
                </div>
            </div>
            
        </div>
    );
}
