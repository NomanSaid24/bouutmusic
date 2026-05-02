'use client';

import { useParams } from 'next/navigation';
import { PublicEpkPage } from '@/components/Artist/PublicEpkPage';

export default function ArtistProfilePage() {
    const params = useParams<{ id: string }>();

    return <PublicEpkPage identifier={params.id} />;
}

