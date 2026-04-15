const MAX_ARTIST_TYPES = 3;

function slugify(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

export function sanitizeArtistTypes(value: unknown) {
    if (!value) {
        return [] as string[];
    }

    const rawValues = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? (() => {
                try {
                    const parsed = JSON.parse(value);
                    return Array.isArray(parsed) ? parsed : [value];
                } catch {
                    return value.split(',');
                }
            })()
            : [];

    return rawValues
        .map(item => typeof item === 'string' ? item.trim() : '')
        .filter(Boolean)
        .slice(0, MAX_ARTIST_TYPES);
}

export function serializeArtistTypes(value: unknown) {
    const sanitized = sanitizeArtistTypes(value);
    return sanitized.length ? JSON.stringify(sanitized) : null;
}

export function buildArtistSlug(name: string, email: string, id: string) {
    const baseSource = email?.split('@')[0] || name || 'artist';
    const normalizedBase = slugify(baseSource) || slugify(name) || 'artist';
    const suffix = id.slice(-6).toLowerCase();
    return `${normalizedBase}-${suffix}`;
}

export function calculateProfileProgress(profile: {
    avatar?: string | null;
    banner?: string | null;
    bio?: string | null;
    genre?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    website?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    spotify?: string | null;
    artistTypes?: string[] | string | null;
    onboardingCompleted?: boolean | null;
}) {
    const artistTypes = sanitizeArtistTypes(profile.artistTypes);
    const checks = [
        artistTypes.length > 0,
        !!profile.country && !!profile.state && !!profile.city,
        !!profile.avatar,
        !!profile.banner,
        !!profile.bio,
        !!profile.genre,
        !!profile.website,
        !!(profile.instagram || profile.facebook || profile.twitter || profile.youtube || profile.spotify),
    ];

    const completed = checks.filter(Boolean).length;
    const progress = Math.round((completed / checks.length) * 100);

    if (profile.onboardingCompleted && progress < 25) {
        return 25;
    }

    return progress;
}

