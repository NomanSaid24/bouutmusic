export const ARTIST_TYPE_OPTIONS = [
    'Band',
    'Composer',
    'DJ',
    'Instrument Player',
    'Label',
    'Lyricist',
    'Producer',
    'Rapper',
    'Singer',
    'Singer-Songwriter',
    'Sound Engineer/Studio',
    'Video Editor/Producer',
] as const;

export const LOCATION_OPTIONS = {
    Afghanistan: {
        Badakhshan: ['Eshkashem', 'Fayzabad', 'Baharak'],
        Kabul: ['Kabul', 'Bagrami', 'Paghman'],
    },
    Pakistan: {
        Punjab: ['Lahore', 'Rawalpindi', 'Faisalabad'],
        Sindh: ['Karachi', 'Hyderabad', 'Sukkur'],
        Islamabad: ['Islamabad'],
    },
    India: {
        Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
        Delhi: ['New Delhi'],
        Karnataka: ['Bengaluru', 'Mysuru'],
        Kerala: ['Kochi', 'Thiruvananthapuram'],
        'West Bengal': ['Kolkata'],
        'Tamil Nadu': ['Chennai'],
        Punjab: ['Amritsar', 'Ludhiana'],
        'Uttar Pradesh': ['Varanasi', 'Lucknow'],
    },
    Bangladesh: {
        Dhaka: ['Dhaka', 'Gazipur'],
        Chattogram: ['Chattogram', "Cox's Bazar"],
    },
    Nepal: {
        Bagmati: ['Kathmandu', 'Lalitpur'],
        Gandaki: ['Pokhara'],
    },
    'United Arab Emirates': {
        Dubai: ['Dubai'],
        'Abu Dhabi': ['Abu Dhabi'],
    },
    'United Kingdom': {
        England: ['London', 'Manchester', 'Birmingham'],
        Scotland: ['Glasgow', 'Edinburgh'],
    },
    'United States': {
        California: ['Los Angeles', 'San Francisco'],
        'New York': ['New York City', 'Buffalo'],
        Texas: ['Austin', 'Houston'],
    },
    Canada: {
        Ontario: ['Toronto', 'Ottawa'],
        'British Columbia': ['Vancouver', 'Victoria'],
    },
    Australia: {
        'New South Wales': ['Sydney'],
        Victoria: ['Melbourne'],
    },
} as const;

export type CountryName = keyof typeof LOCATION_OPTIONS;
export type StateName<TCountry extends CountryName> = keyof typeof LOCATION_OPTIONS[TCountry];

export function getCountries() {
    return Object.keys(LOCATION_OPTIONS) as CountryName[];
}

export function getStates(country?: string) {
    if (!country || !(country in LOCATION_OPTIONS)) {
        return [] as string[];
    }

    return Object.keys(LOCATION_OPTIONS[country as CountryName]);
}

export function getCities(country?: string, state?: string) {
    if (!country || !state || !(country in LOCATION_OPTIONS)) {
        return [] as string[];
    }

    const stateMap = LOCATION_OPTIONS[country as CountryName];
    if (!(state in stateMap)) {
        return [] as string[];
    }

    return [...stateMap[state as keyof typeof stateMap]];
}

export function formatArtistLocation(parts: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
}) {
    return [parts.country, parts.city || parts.state].filter(Boolean).join(', ');
}

export function getPrimaryArtistType(artistTypes?: string[] | null) {
    return artistTypes?.[0] || 'Artist';
}
