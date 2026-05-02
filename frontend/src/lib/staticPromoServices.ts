export interface StaticPromoService {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    isHiddenFromGrid?: boolean;
}

export const staticPromoServices: StaticPromoService[] = [
    {
        id: 'cmnd248zp003wuy8opt3ejs49',
        name: 'Submit my demo',
        description: 'Accepting demos from all genres for review. Get featured on our page and attached for potentially big opportunities.',
        price: 0,
        features: ['Review within 7 days', 'All genres accepted', 'Social media feature potential'],
    },
    {
        id: 'release-music-service',
        name: 'Release My Music',
        description: 'Worldwide music distribution with metadata, Content ID, and release support.',
        price: 499,
        features: ['Single Release - Rs. 499', 'Pro Release - Rs. 999', 'Premium Release - Rs. 1,999'],
        isHiddenFromGrid: true,
    },
    {
        id: 'cmnd2496p003yuy8o33fj1gao',
        name: 'Get playlisted',
        description: 'Submit your tracks to our curated playlists and reach new audiences.',
        price: 0,
        features: ['Playlist consideration', 'Genre matching', 'Audience growth'],
    },
    {
        id: 'cmnd249d0003zuy8o1zicok20',
        name: 'Promote your music',
        description: 'Custom digital marketing campaigns to give your release the boost it needs.',
        price: 299,
        features: ['Story + post/reel plans', 'Friday Spotlight access', 'Artist introduction options'],
    },
    {
        id: 'cmnd249lt0040uy8o5pd9oz97',
        name: 'Collaborate with us',
        description: 'Looking to partner on projects or explore mutual growth? Let us connect.',
        price: 0,
        features: ['Brand partnerships', 'Event collaboration', 'Project pitch'],
        isHiddenFromGrid: true,
    },
];

export function getStaticPromoService(id: string) {
    return staticPromoServices.find(service => service.id === id) || null;
}

export function getVisiblePromoServices() {
    return staticPromoServices.filter(service => !service.isHiddenFromGrid);
}
