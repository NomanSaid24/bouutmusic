import path from 'path';

const DEFAULT_SONG_ART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="none"><rect width="640" height="640" rx="56" fill="#0f172a"/><rect x="56" y="56" width="528" height="528" rx="40" fill="#1e293b"/><circle cx="320" cy="320" r="146" fill="#f97316"/><circle cx="320" cy="320" r="72" fill="#fff7ed"/><path d="M404 198v174.763c11.732-6.741 25.333-10.593 39.833-10.593 44.274 0 80.167 35.893 80.167 80.166 0 44.274-35.893 80.167-80.167 80.167s-80.166-35.893-80.166-80.167c0-33.987 21.151-63.035 50.999-74.72V252.76L278 286.88v126.55c11.731-6.741 25.332-10.593 39.833-10.593 44.274 0 80.167 35.893 80.167 80.167S362.107 563.17 317.833 563.17s-80.166-35.892-80.166-80.166c0-33.987 21.15-63.036 50.999-74.72V248.715L404 198Z" fill="#0f172a"/></svg>`;
const FALLBACK_SONG_ART_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(DEFAULT_SONG_ART_SVG)}`;

type MediaRecord = Record<string, any>;

function hasPublicUrlProtocol(value: string) {
    return /^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:');
}

export function getBackendPublicUrl() {
    const configuredUrl = process.env.BACKEND_PUBLIC_URL?.trim();
    if (configuredUrl) {
        return configuredUrl.replace(/\/+$/, '');
    }

    return `http://localhost:${process.env.PORT || 3000}`;
}

export function resolvePublicMediaUrl(value: string | null | undefined) {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (hasPublicUrlProtocol(trimmed)) {
        return trimmed;
    }

    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${getBackendPublicUrl()}${normalizedPath}`;
}

export function getDefaultSongArtUrl() {
    const configuredUrl = process.env.DEFAULT_SONG_ART_URL?.trim();
    return resolvePublicMediaUrl(configuredUrl) || configuredUrl || FALLBACK_SONG_ART_URL;
}

export function getUploadRootDir() {
    const configuredPath = process.env.UPLOAD_DIR?.trim() || './uploads';
    return path.isAbsolute(configuredPath)
        ? configuredPath
        : path.resolve(process.cwd(), configuredPath);
}

export function getUploadSubdir(...segments: string[]) {
    return path.join(getUploadRootDir(), ...segments);
}

export function buildUploadUrl(...segments: string[]) {
    const sanitized = segments
        .map(segment => segment.replace(/^\/+|\/+$/g, ''))
        .filter(Boolean);

    return `/uploads/${sanitized.join('/')}`;
}

export function normalizeUserMedia<T extends MediaRecord | null | undefined>(user: T): T {
    if (!user) {
        return user;
    }

    return {
        ...user,
        avatar: resolvePublicMediaUrl(user.avatar),
        banner: resolvePublicMediaUrl(user.banner),
    } as T;
}

export function normalizeSongMedia<T extends MediaRecord | null | undefined>(song: T): T {
    if (!song) {
        return song;
    }

    return {
        ...song,
        artUrl: resolvePublicMediaUrl(song.artUrl) || getDefaultSongArtUrl(),
        audioUrl: resolvePublicMediaUrl(song.audioUrl),
        artist: song.artist ? normalizeUserMedia(song.artist) : song.artist,
    } as T;
}

export function normalizeAlbumMedia<T extends MediaRecord | null | undefined>(album: T): T {
    if (!album) {
        return album;
    }

    return {
        ...album,
        artUrl: resolvePublicMediaUrl(album.artUrl) || getDefaultSongArtUrl(),
        artist: album.artist ? normalizeUserMedia(album.artist) : album.artist,
        songs: Array.isArray(album.songs) ? album.songs.map(normalizeSongMedia) : album.songs,
    } as T;
}
