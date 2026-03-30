import { Router, Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
    buildArtistSlug,
    calculateProfileProgress,
    sanitizeArtistTypes,
    serializeArtistTypes,
} from '../utils/profile';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const authUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    slug: true,
    avatar: true,
    banner: true,
    bio: true,
    artistTypes: true,
    genre: true,
    country: true,
    state: true,
    city: true,
    website: true,
    instagram: true,
    facebook: true,
    twitter: true,
    youtube: true,
    spotify: true,
    isPro: true,
    onboardingCompleted: true,
    profileProgress: true,
    createdAt: true,
};

type AuthUserRecord = {
    id: string;
    name: string;
    email: string;
    role: string;
    slug: string | null;
    avatar: string | null;
    banner: string | null;
    bio: string | null;
    artistTypes: string | null;
    genre: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    youtube: string | null;
    spotify: string | null;
    isPro: boolean;
    onboardingCompleted: boolean;
    profileProgress: number;
    createdAt: Date;
};

const buildAuthUser = (user: AuthUserRecord) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    slug: user.slug,
    avatar: user.avatar,
    banner: user.banner,
    bio: user.bio,
    artistTypes: sanitizeArtistTypes(user.artistTypes),
    genre: user.genre,
    country: user.country,
    state: user.state,
    city: user.city,
    website: user.website,
    instagram: user.instagram,
    facebook: user.facebook,
    twitter: user.twitter,
    youtube: user.youtube,
    spotify: user.spotify,
    isPro: user.isPro,
    onboardingCompleted: user.onboardingCompleted,
    profileProgress: user.profileProgress,
    createdAt: user.createdAt,
});

function normalizeOptionalString(value: unknown) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed || null;
}

async function ensureProfileDefaults(user: AuthUserRecord) {
    const artistTypes = sanitizeArtistTypes(user.artistTypes);
    const nextSlug = user.slug || buildArtistSlug(user.name, user.email, user.id);
    const nextProgress = calculateProfileProgress({
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        artistTypes,
        genre: user.genre,
        country: user.country,
        state: user.state,
        city: user.city,
        website: user.website,
        instagram: user.instagram,
        facebook: user.facebook,
        twitter: user.twitter,
        youtube: user.youtube,
        spotify: user.spotify,
        onboardingCompleted: user.onboardingCompleted,
    });

    if (nextSlug === user.slug && nextProgress === user.profileProgress) {
        return user;
    }

    return prisma.user.update({
        where: { id: user.id },
        data: {
            slug: nextSlug,
            profileProgress: nextProgress,
        },
        select: authUserSelect,
    }) as Promise<AuthUserRecord>;
}

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, role = 'ARTIST' } = req.body;
        const normalizedName = typeof name === 'string' ? name.trim() : '';
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const safeRole = role === 'LISTENER' ? 'LISTENER' : 'ARTIST';

        if (!normalizedName || !normalizedEmail || !password) return res.status(400).json({ error: 'Missing fields' });

        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) return res.status(400).json({ error: 'Email already in use' });

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { name: normalizedName, email: normalizedEmail, passwordHash, role: safeRole }
        });
        const hydratedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                slug: buildArtistSlug(normalizedName, normalizedEmail, user.id),
                profileProgress: 0,
            },
            select: authUserSelect,
        });

        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: buildAuthUser(hydratedUser) });
    } catch (err) {
        console.error('Register failed:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!normalizedEmail || !password) return res.status(400).json({ error: 'Missing fields' });

        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const authUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: authUserSelect,
        }) as AuthUserRecord | null;
        if (!authUser) return res.status(404).json({ error: 'User not found' });
        const hydratedUser = await ensureProfileDefaults(authUser);

        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: buildAuthUser(hydratedUser) });
    } catch (err) {
        console.error('Login failed:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: authUserSelect,
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const hydratedUser = await ensureProfileDefaults(user as AuthUserRecord);
        res.json(buildAuthUser(hydratedUser));
    } catch (error) {
        console.error('Profile fetch failed:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: authUserSelect,
        });
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        const {
            name,
            bio,
            artistTypes,
            genre,
            country,
            state,
            city,
            website,
            instagram,
            facebook,
            twitter,
            youtube,
            spotify,
            avatar,
            banner,
            onboardingCompleted,
        } = req.body;

        const nextName = normalizeOptionalString(name);
        const nextArtistTypes = artistTypes === undefined ? undefined : serializeArtistTypes(artistTypes);
        const nextProfile = {
            avatar: avatar === undefined ? currentUser.avatar : normalizeOptionalString(avatar),
            banner: banner === undefined ? currentUser.banner : normalizeOptionalString(banner),
            bio: bio === undefined ? currentUser.bio : normalizeOptionalString(bio),
            artistTypes: nextArtistTypes === undefined ? currentUser.artistTypes : nextArtistTypes,
            genre: genre === undefined ? currentUser.genre : normalizeOptionalString(genre),
            country: country === undefined ? currentUser.country : normalizeOptionalString(country),
            state: state === undefined ? currentUser.state : normalizeOptionalString(state),
            city: city === undefined ? currentUser.city : normalizeOptionalString(city),
            website: website === undefined ? currentUser.website : normalizeOptionalString(website),
            instagram: instagram === undefined ? currentUser.instagram : normalizeOptionalString(instagram),
            facebook: facebook === undefined ? currentUser.facebook : normalizeOptionalString(facebook),
            twitter: twitter === undefined ? currentUser.twitter : normalizeOptionalString(twitter),
            youtube: youtube === undefined ? currentUser.youtube : normalizeOptionalString(youtube),
            spotify: spotify === undefined ? currentUser.spotify : normalizeOptionalString(spotify),
            onboardingCompleted: typeof onboardingCompleted === 'boolean' ? onboardingCompleted : currentUser.onboardingCompleted,
        };

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: {
                name: nextName === undefined ? currentUser.name : (nextName || currentUser.name),
                avatar: nextProfile.avatar,
                banner: nextProfile.banner,
                bio: nextProfile.bio,
                artistTypes: nextProfile.artistTypes,
                genre: nextProfile.genre,
                country: nextProfile.country,
                state: nextProfile.state,
                city: nextProfile.city,
                website: nextProfile.website,
                instagram: nextProfile.instagram,
                facebook: nextProfile.facebook,
                twitter: nextProfile.twitter,
                youtube: nextProfile.youtube,
                spotify: nextProfile.spotify,
                onboardingCompleted: nextProfile.onboardingCompleted,
                profileProgress: calculateProfileProgress(nextProfile),
            },
            select: authUserSelect,
        });

        res.json(buildAuthUser(await ensureProfileDefaults(user as AuthUserRecord)));
    } catch (error) {
        console.error('Profile update failed:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

router.put('/onboarding', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { artistTypes, country, state, city } = req.body;
        const sanitizedArtistTypes = sanitizeArtistTypes(artistTypes);
        const normalizedCountry = normalizeOptionalString(country);
        const normalizedState = normalizeOptionalString(state);
        const normalizedCity = normalizeOptionalString(city);

        if (!sanitizedArtistTypes.length || !normalizedCountry || !normalizedState || !normalizedCity) {
            return res.status(400).json({ error: 'Please complete all onboarding fields' });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: authUserSelect,
        });
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        const nextProfile = {
            avatar: currentUser.avatar,
            banner: currentUser.banner,
            bio: currentUser.bio,
            artistTypes: sanitizedArtistTypes,
            genre: currentUser.genre,
            country: normalizedCountry,
            state: normalizedState,
            city: normalizedCity,
            website: currentUser.website,
            instagram: currentUser.instagram,
            facebook: currentUser.facebook,
            twitter: currentUser.twitter,
            youtube: currentUser.youtube,
            spotify: currentUser.spotify,
            onboardingCompleted: true,
        };

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: {
                artistTypes: serializeArtistTypes(sanitizedArtistTypes),
                country: normalizedCountry,
                state: normalizedState,
                city: normalizedCity,
                onboardingCompleted: true,
                profileProgress: calculateProfileProgress(nextProfile),
            },
            select: authUserSelect,
        });

        res.json(buildAuthUser(await ensureProfileDefaults(user as AuthUserRecord)));
    } catch (error) {
        console.error('Onboarding update failed:', error);
        res.status(500).json({ error: 'Failed to save onboarding details' });
    }
});

router.put('/password', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Incorrect current password' });

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
        res.json({ success: true, message: 'Password updated' });
    } catch (error) {
        console.error('Password update failed:', error);
        res.status(500).json({ error: 'Password update failed' });
    }
});

export default router;
