'use client';

export default function CommunityGuidelinesPage() {
  return (
    <div style={{ paddingTop: '120px', paddingBottom: '100px', backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#e6e5dd', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 840, width: '100%', padding: '0 24px', fontFamily: 'var(--font-sans), sans-serif' }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, color: '#ffffff' }}>Community Guidelines</h1>
            <p style={{ color: '#9b918d', marginBottom: 48, fontSize: 14 }}>Last Updated: May 1, 2026</p>
            
            <div style={{ lineHeight: 1.8, fontSize: 16, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
                <div>Welcome to Bouut Music. We're building a space where artists, listeners, and creators can grow together. To keep this community safe, respectful, and valuable, please follow these guidelines.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>1. Respect Everyone</h2>
                <div>Treat all members with respect.
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>No hate speech, harassment, bullying, or discrimination</li>
                       <li>No personal attacks, threats, or abusive language</li>
                   </ul>
                   We support diversity across cultures, genres, and identities.
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>2. Keep It Music-Focused</h2>
                <div>Bouut Music is about music and creativity.
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Share content related to music, artists, and the industry</li>
                       <li>Avoid spam, irrelevant promotions, or misleading content</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>3. No Spam or Fake Engagement</h2>
                <div>
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Do not post repetitive comments, links, or self-promotion excessively</li>
                       <li>No fake streams, bots, or artificial engagement tactics</li>
                       <li>Follow/unfollow schemes and engagement pods are discouraged</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>4. Respect Copyright & Ownership</h2>
                <div>
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Only upload or share content you own or have rights to</li>
                       <li>Do not distribute copyrighted music without permission</li>
                       <li>Credit artists and collaborators properly</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>5. Authenticity Matters</h2>
                <div>
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Be genuine in your interactions</li>
                       <li>Do not impersonate artists, brands, or other users</li>
                       <li>Misleading or false information will be removed</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>6. Constructive Feedback Only</h2>
                <div>We encourage feedback but keep it helpful.
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Critique the music, not the person</li>
                       <li>No trolling or unnecessary negativity</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>7. No Harmful or Illegal Content</h2>
                <div>Strictly prohibited:
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Explicit violence, illegal activities, or dangerous behavior</li>
                       <li>Hate content or extremist material</li>
                       <li>Content that violates any laws or platform rules</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>8. Promotions & Features</h2>
                <div>
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Follow official submission processes for features and promotions</li>
                       <li>Do not DM spam for promotions</li>
                       <li>Any paid or free promotion must go through official Bouut Music channels</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>9. Reporting & Enforcement</h2>
                <div>If you see a violation: Report it through our platform or contact support.<br/>
                   We may take action including:
                   <ul style={{ marginLeft: 24, marginTop: 8 }}>
                       <li>Content removal</li>
                       <li>Temporary restrictions</li>
                       <li>Permanent bans</li>
                   </ul>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>10. Community First</h2>
                <div>Bouut Music is built for artists. Support each other, collaborate, and grow together.</div>

                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginTop: 32 }}>11. Updates to Guidelines</h2>
                <div>We may update these guidelines from time to time. Continued use of our platform means you agree to follow the latest version.</div>

                <div style={{ marginTop: 40, padding: 32, borderRadius: 16, backgroundColor: '#1a1a1a', border: '1px solid #333', textAlign: 'center' }}>
                    <h3 style={{ fontSize: 24, color: '#fff', fontWeight: 700, marginBottom: 12 }}>Final Note</h3>
                    <p style={{ margin: 0 }}>Be real. Be creative. Be respectful.<br/>Let's build something powerful for music together.</p>
                </div>
            </div>
        </div>
    </div>
  );
}
