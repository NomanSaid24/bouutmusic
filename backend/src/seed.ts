import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const GENRES = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Folk', 'Indie', 'Bollywood', 'Sufi', 'Punjabi', 'EDM'];
const LANGUAGES = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu', 'Urdu', 'Marathi'];

const ARTISTS = [
    { name: 'Aryan Kapoor', genre: 'Bollywood', city: 'Mumbai', bio: 'Award-winning Bollywood composer and singer from Mumbai.' },
    { name: 'Priya Singh', genre: 'Pop', city: 'Delhi', bio: 'Indie pop artist blending Western and Eastern sounds.' },
    { name: 'DJ Maverick', genre: 'EDM', city: 'Bangalore', bio: 'Electronic music producer and live performer.' },
    { name: 'Meera Nair', genre: 'Folk', city: 'Kerala', bio: 'Soulful folk singer from Kerala.' },
    { name: 'Raza Khan', genre: 'Sufi', city: 'Lahore', bio: 'Sufi vocalist with a classical training background.' },
    { name: 'Zara Ahmed', genre: 'R&B', city: 'Karachi', bio: 'R&B and soul artist with global inspirations.' },
    { name: 'Dev Sharma', genre: 'Rock', city: 'Pune', bio: 'Lead vocalist of the rock band Storm.' },
    { name: 'Asha Verma', genre: 'Classical', city: 'Varanasi', bio: 'Hindustani classical vocalist trained under Pandit Jasraj.' },
    { name: 'Farhan Ali', genre: 'Hip-Hop', city: 'Mumbai', bio: 'Desi hip-hop artist representing the streets.' },
    { name: 'Noor Fatima', genre: 'Jazz', city: 'Kolkata', bio: 'Jazz pianist and vocalist performing originals and standards.' },
    { name: 'Vikram Das', genre: 'Indie', city: 'Chennai', bio: 'Indie musician creating dreamy alternative soundscapes.' },
    { name: 'Laila Hussain', genre: 'Punjabi', city: 'Amritsar', bio: 'Bhangra and Punjabi pop sensation.' },
    { name: 'Noman Said', genre: 'Pop', city: 'Karachi', bio: 'Rising pop artist from Karachi.' },
];

const SONG_TITLES = [
    'Dil Ka Safar', 'Midnight Dreams', 'Aasmaan', 'City Lights', 'Tere Bina',
    'Electric Soul', 'Pahadi Echoes', 'Noor', 'Street Code', 'Chandni Raat',
    'Ocean Waves', 'Kho Gaye Hum', 'Bass Drop', 'Meri Kahani', 'Sunset Boulevard',
    'Yaadein', 'Digital Love', 'Raat Bhar', 'Colors', 'Zindagi',
    'Jungle Beat', 'Mann Ko Chain', 'Fireflies', 'Ishq Hua', 'Galaxy',
    'Ik Pal', 'Neon Lights', 'Baatein', 'Heartstrings', 'Woh Din',
    'Thunder', 'Khwaab', 'Deep Waters', 'Tujhse Dur', 'Morning Light',
    'Roohani', 'Frequencies', 'Teri Aadat', 'Wanderer', 'Pehli Baar',
];

const ALBUM_TITLES = [
    'Echoes of the East', 'Midnight Sessions', 'Soul Frequency', 'Dil Ki Baat',
    'Urban Beats', 'Sufi Nights', 'Generation Z', 'Classical Reverie',
    'Street Tales', 'Love & Loss', 'Neon Dreams', 'Roots',
];

const COVER_IMAGES = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
];

const ARTIST_AVATARS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
];

// Use a free MP3 sample for all songs (for demo purposes)
const DEMO_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

async function main() {
    console.log('🌱 Seeding Bouut Music database...');

    // 1. Clear existing data (order matters for FK constraints)
    await prisma.message.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.playlistSong.deleteMany();
    await prisma.like.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.song.deleteMany();
    await prisma.album.deleteMany();
    await prisma.playlist.deleteMany();
    await prisma.post.deleteMany();
    await prisma.opportunity.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Cleared existing data');

    // 2. Create Admin user
    const adminHash = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
        data: {
            name: 'Bouut Admin',
            email: 'admin@bouutmusic.com',
            passwordHash: adminHash,
            role: 'ADMIN',
            isPro: true,
            bio: 'Platform administrator',
            genre: 'All',
            avatar: ARTIST_AVATARS[0],
            profileProgress: 100,
        },
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // 3. Create Artist users
    const artistUsers = [];
    for (let i = 0; i < ARTISTS.length; i++) {
        const a = ARTISTS[i];
        const hash = await bcrypt.hash('password123', 12);
        const user = await prisma.user.create({
            data: {
                name: a.name,
                email: `${a.name.toLowerCase().replace(/\s/g, '.')}@bouutmusic.com`,
                passwordHash: hash,
                role: 'ARTIST',
                bio: a.bio,
                genre: a.genre,
                city: a.city,
                avatar: ARTIST_AVATARS[i % ARTIST_AVATARS.length],
                isPro: i < 5,  // first 5 artists are Pro
                profileProgress: 20 + Math.floor(Math.random() * 80),
                instagram: `@${a.name.toLowerCase().replace(/\s/g, '_')}`,
                twitter: `@${a.name.toLowerCase().replace(/\s/g, '')}`,
                youtube: `https://youtube.com/${a.name.replace(/\s/g, '')}`,
            },
        });
        artistUsers.push(user);
    }
    console.log(`✅ ${artistUsers.length} artists created`);

    // 4. Create albums
    const albums = [];
    for (let i = 0; i < ALBUM_TITLES.length; i++) {
        const artist = artistUsers[i % artistUsers.length];
        const album = await prisma.album.create({
            data: {
                title: ALBUM_TITLES[i],
                artUrl: COVER_IMAGES[i % COVER_IMAGES.length],
                releaseDate: new Date(2020 + Math.floor(i / 4), i % 12, 1),
                genre: GENRES[i % GENRES.length],
                artistId: artist.id,
            },
        });
        albums.push(album);
    }
    console.log(`✅ ${albums.length} albums created`);

    // 5. Create songs
    const songs = [];
    for (let i = 0; i < SONG_TITLES.length; i++) {
        const artist = artistUsers[i % artistUsers.length];
        const album = albums[i % albums.length];
        const song = await prisma.song.create({
            data: {
                title: SONG_TITLES[i],
                genre: GENRES[i % GENRES.length],
                language: LANGUAGES[i % LANGUAGES.length],
                year: 2020 + Math.floor(i / 10),
                description: `${SONG_TITLES[i]} - A beautiful track by ${artist.name}. This song explores themes of love, life, and music.`,
                audioUrl: DEMO_AUDIO_URL,
                artUrl: COVER_IMAGES[i % COVER_IMAGES.length],
                plays: Math.floor(Math.random() * 500000),
                downloads: Math.floor(Math.random() * 50000),
                status: 'APPROVED',
                privacy: 'PUBLIC',
                artistId: artist.id,
                albumId: album.id,
            },
        });
        songs.push(song);
    }
    console.log(`✅ ${songs.length} songs created`);

    // 6. Create playlists
    const playlistNames = [
        'Top Hits 2026', 'Chill Vibes', 'Workout Anthems', 'Late Night Feels',
        'Bollywood Classics', 'Indie Picks', 'Sufi Meditations', 'Party Starter',
    ];
    for (let i = 0; i < playlistNames.length; i++) {
        const user = artistUsers[i % artistUsers.length];
        const playlist = await prisma.playlist.create({
            data: {
                name: playlistNames[i],
                description: `A curated collection of the best ${playlistNames[i]} tracks.`,
                artUrl: COVER_IMAGES[i % COVER_IMAGES.length],
                isPublic: true,
                userId: user.id,
            },
        });
        // Add 5 songs to each playlist
        for (let j = 0; j < 5; j++) {
            await prisma.playlistSong.create({
                data: { playlistId: playlist.id, songId: songs[(i * 5 + j) % songs.length].id, order: j },
            });
        }
    }
    console.log(`✅ 8 playlists created`);

    // 7. Add likes and follows
    for (let i = 0; i < 30; i++) {
        const user = artistUsers[i % artistUsers.length];
        const song = songs[(i * 3) % songs.length];
        try {
            await prisma.like.create({ data: { userId: user.id, songId: song.id } });
        } catch { }
    }
    for (let i = 0; i < 20; i++) {
        const follower = artistUsers[i % artistUsers.length];
        const following = artistUsers[(i + 1) % artistUsers.length];
        if (follower.id !== following.id) {
            try {
                await prisma.follow.create({ data: { followerId: follower.id, followingId: following.id } });
            } catch { }
        }
    }
    console.log(`✅ Likes and follows created`);

    // 8. Create opportunities
    const opportunities = [
        { title: 'Radio Airplay — Mirchi 98.3', type: 'radio', description: 'Submit your track for consideration on Radio Mirchi. Selected artists get 2 weeks of rotation.', deadline: new Date('2026-04-30'), reward: 'Rs. 5,000 + airplay' },
        { title: 'Spotify Playlist Feature', type: 'publication', description: 'Get featured on our editorial playlist with 100K+ followers.', deadline: new Date('2026-04-15'), reward: 'Playlist placement' },
        { title: 'Live Gig — Mumbai Music Fest', type: 'gig', description: 'Perform at the annual Mumbai Music Festival. 500+ audience.', deadline: new Date('2026-05-10'), reward: 'Rs. 20,000 + exposure' },
        { title: 'Songwriting Contest 2026', type: 'contest', description: 'Best original song wins a full studio recording session.', deadline: new Date('2026-06-01'), reward: 'Studio session worth Rs. 50,000' },
        { title: 'MTV Campus Rocks', type: 'radio', description: 'College tour performing opportunity across 10 cities.', deadline: new Date('2026-04-20'), reward: 'Tour + Rs. 30,000' },
        { title: 'Publication Feature — Rolling Stone India', type: 'publication', description: 'Featured artist profile in Rolling Stone India magazine.', deadline: new Date('2026-03-31'), isActive: false, reward: 'Magazine feature' },
    ];
    for (const opp of opportunities) {
        await prisma.opportunity.create({ data: { ...opp, isActive: true } });
    }
    console.log(`✅ ${opportunities.length} opportunities created`);

    // 9. Create services (Promo Tools)
    const services = [
        { name: 'Submit my demo', description: 'Accepting demos from all genres for review. Get featured on our page and attached for potentially big opportunities.', price: 0, features: ['Review within 7 days', 'All genres accepted', 'Social media feature potential'] },
        { name: 'Release your music with us', description: 'Professional distribution to all major platforms including Spotify, Apple Music, and Amazon Music.', price: 299, features: ['Fast distribution', 'Royalty collection', 'Technical support'] },
        { name: 'Get playlisted', description: 'Submit your tracks to our curated playlists and reach new audiences.', price: 1499, features: ['Playlist consideration', 'Genre matching', 'Audience growth'] },
        { name: 'Promote my music', description: 'Custom digital marketing campaigns to give your release the boost it needs.', price: 4999, features: ['Social ads', 'Influencer reach', 'Detailed analytics'] },
        { name: 'Collaborate with us', description: 'Looking to partner on projects or explore mutual growth? Let\'s connect.', price: 0, features: ['Brand partnerships', 'Event collaboration', 'Project pitch'] },
    ];
    for (const svc of services) {
        await prisma.service.create({ data: { ...svc, features: JSON.stringify(svc.features) } });
    }
    console.log(`✅ ${services.length} services created`);

    // 10. Create blog posts
    const posts = [
        {
            title: 'How to Promote Your Music on Social Media in 2026',
            slug: 'promote-music-social-media-2026',
            excerpt: 'Learn the best strategies to grow your fanbase and promote your music effectively on Instagram, YouTube, and TikTok.',
            body: `# How to Promote Your Music on Social Media in 2026\n\nThe music industry has transformed dramatically. As an independent artist, social media is your most powerful tool...\n\n## 1. Define Your Brand\nBefore anything else, establish who you are as an artist...\n\n## 2. Choose Your Platforms\nFocus on 2-3 platforms where your target audience spends most time...\n\n## 3. Create Consistent Content\nPost regularly - aim for at least 3 times per week...`,
            coverImage: COVER_IMAGES[0],
            tags: ['marketing', 'social media', 'tips'],
            published: true,
            publishedAt: new Date('2026-02-15'),
        },
        {
            title: 'Understanding Music Royalties: A Beginner\'s Guide',
            slug: 'music-royalties-beginners-guide',
            excerpt: 'Everything independent artists need to know about publishing royalties, performance rights, and how to collect what you\'re owed.',
            body: `# Understanding Music Royalties\n\nAs an independent artist, understanding royalties is crucial to building a sustainable music career...\n\n## Types of Royalties\n### Mechanical Royalties\nEarned from physical and digital sales of your music...\n\n### Performance Royalties\nEarned when your music is played on radio, TV, or live venues...`,
            coverImage: COVER_IMAGES[1],
            tags: ['royalties', 'business', 'distribution'],
            published: true,
            publishedAt: new Date('2026-02-28'),
        },
        {
            title: 'Top 10 Home Recording Studio Setup Tips',
            slug: 'home-recording-studio-setup-tips',
            excerpt: 'Build a professional-quality home recording studio without breaking the bank. Essential gear and acoustic treatment advice.',
            body: `# Top 10 Home Recording Studio Setup Tips\n\nYou don\'t need a million-dollar studio to record professional-sounding music...`,
            coverImage: COVER_IMAGES[2],
            tags: ['recording', 'studio', 'gear'],
            published: true,
            publishedAt: new Date('2026-03-05'),
        },
        {
            title: 'Artist Spotlight: Raza Khan\'s Journey into Sufi Music',
            slug: 'artist-spotlight-raza-khan-sufi',
            excerpt: 'We sit down with Raza Khan to discuss his journey from classical training to modern Sufi fusion.',
            body: `# Artist Spotlight: Raza Khan\n\nRaza Khan has been captivating audiences with his soulful Sufi vocals for over a decade...`,
            coverImage: COVER_IMAGES[3],
            tags: ['artist spotlight', 'sufi', 'interview'],
            published: true,
            publishedAt: new Date('2026-03-08'),
        },
    ];
    for (const post of posts) {
        await prisma.post.create({ data: { ...post, tags: JSON.stringify(post.tags), authorId: admin.id } });
    }
    console.log(`✅ ${posts.length} blog posts created`);

    // 11. Create welcome notifications for all artists
    for (const user of artistUsers) {
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'welcome',
                title: 'Welcome to Bouut Music! 🎵',
                message: 'Start by completing your profile and uploading your first song. Join 70,000+ artists.',
            },
        });
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'opportunity',
                title: 'New Opportunity Available',
                message: 'A new radio airplay opportunity is now open. Apply before April 30, 2026.',
            },
        });
    }
    console.log(`✅ Notifications created for all artists`);

    // 12. Create a test listener user
    const listenerHash = await bcrypt.hash('password123', 12);
    await prisma.user.create({
        data: {
            name: 'Test Listener',
            email: 'listener@bouutmusic.com',
            passwordHash: listenerHash,
            role: 'LISTENER',
        },
    });

    console.log('\n🎉 Database seeding complete!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin: admin@bouutmusic.com / admin123');
    console.log('  Artist: aryan.kapoor@bouutmusic.com / password123 (Pro)');
    console.log('  Artist: noman.said@bouutmusic.com / password123');
    console.log('  Listener: listener@bouutmusic.com / password123');
    console.log(`\n  Total: ${artistUsers.length + 2} users, ${songs.length} songs, ${albums.length} albums`);
}

main()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
