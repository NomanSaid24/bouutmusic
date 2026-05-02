'use client';

import { useParams } from 'next/navigation';
import { PublicEpkPage } from '@/components/Artist/PublicEpkPage';

export default function PublicArtistSlugPage() {
    const params = useParams<{ slug: string }>();

    return <PublicEpkPage identifier={params.slug} />;
}

