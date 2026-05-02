'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Lock, Music2, UploadCloud } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ReleaseAccess = {
  hasAccess: boolean;
  state?: 'NO_PLAN' | 'PAYMENT_REQUIRED' | 'PENDING_REVIEW' | 'REJECTED' | 'APPROVED' | 'PAID';
  submissionId: string | null;
  serviceName: string | null;
  plan: {
    id: string;
    title: string;
    price: number | null;
    bestFor: string | null;
  } | null;
  paymentCompletedAt: string | null;
};

type Song = {
  id: string;
  title: string;
  status: string;
  plays: number;
  artUrl: string;
  genre: string;
  language: string;
  createdAt: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusBadge(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === 'APPROVED') return 'badge-green';
  if (normalized === 'REJECTED') return 'badge-red';
  if (normalized === 'PENDING') return 'badge-yellow';
  return 'badge-blue';
}

function getLockedReleaseCopy(access: ReleaseAccess | null) {
  if (access?.state === 'PENDING_REVIEW') {
    return {
      kicker: 'Payment received',
      title: 'Your release payment is complete.',
      body: 'My Releases unlocks as soon as PayU confirms the paid release plan. If admin later rejects it, it will move into the refund queue.',
      cta: 'View release plans',
    };
  }

  if (access?.state === 'REJECTED') {
    return {
      kicker: 'Release plan rejected',
      title: 'This paid release plan was rejected by admin.',
      body: 'Rejected paid release plans are sent to the refund queue. Choose another plan when you are ready to submit again.',
      cta: 'Choose another plan',
    };
  }

  if (access?.state === 'PAYMENT_REQUIRED') {
    return {
      kicker: 'Payment required',
      title: 'Complete PayU payment before uploading music.',
      body: 'Your release plan has been selected, but My Releases stays locked until PayU confirms the payment.',
      cta: 'Choose a release plan',
    };
  }

  return {
    kicker: 'Release plan required',
    title: 'My Releases is locked until you complete a release payment.',
    body: 'Choose Single, Pro, or Premium Release first. After PayU confirms payment, this workspace unlocks.',
    cta: 'Choose a release plan',
  };
}

export default function MyReleasesPage() {
  const { token, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const [access, setAccess] = useState<ReleaseAccess | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPlays = useMemo(
    () => songs.reduce((total, song) => total + (Number(song.plays) || 0), 0),
    [songs],
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!token) {
      setIsLoading(false);
      openAuthModal('login', '/dashboard/release/my-releases');
      return;
    }

    let isMounted = true;

    async function loadReleaseWorkspace() {
      setIsLoading(true);
      setError(null);

      try {
        const [accessResponse, songsResponse] = await Promise.all([
          fetch(`${API_URL}/api/songs/release-access`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }),
          fetch(`${API_URL}/api/songs/my/songs`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }),
        ]);

        const accessPayload = await accessResponse.json().catch(() => null) as ReleaseAccess | { error?: string } | null;
        const songsPayload = await songsResponse.json().catch(() => null) as Song[] | { error?: string } | null;

        if (!accessResponse.ok || !accessPayload || !('hasAccess' in accessPayload)) {
          throw new Error(
            accessPayload && typeof accessPayload === 'object' && 'error' in accessPayload && accessPayload.error
              ? accessPayload.error
              : 'Unable to verify release access.',
          );
        }

        if (!songsResponse.ok || !Array.isArray(songsPayload)) {
          throw new Error(
            songsPayload && typeof songsPayload === 'object' && 'error' in songsPayload && songsPayload.error
              ? songsPayload.error
              : 'Unable to load your songs.',
          );
        }

        if (!isMounted) {
          return;
        }

        setAccess(accessPayload);
        setSongs(songsPayload);
      } catch (requestError) {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load release workspace.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadReleaseWorkspace();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, openAuthModal, token]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="release-workspace">
        <div className="release-loading-panel">Loading your release workspace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="release-workspace">
        <div className="release-lock-panel">
          <div className="release-lock-icon">
            <Lock size={28} />
          </div>
          <h1>Unable to load My Releases</h1>
          <p>{error}</p>
          <Link href="/dashboard/release" className="release-workspace-primary">
            Back to release plans
          </Link>
        </div>
      </div>
    );
  }

  if (!access?.hasAccess) {
    const lockedCopy = getLockedReleaseCopy(access);

    return (
      <div className="release-workspace">
        <div className="breadcrumb">
          <Link href="/dashboard">Home</Link>
          <span>/</span>
          My Releases
        </div>

        <section className="release-lock-panel">
          <div className="release-lock-icon">
            <Lock size={30} />
          </div>
          <span className="release-kicker">{lockedCopy.kicker}</span>
          <h1>{lockedCopy.title}</h1>
          <p>{lockedCopy.body}</p>
          <Link href="/dashboard/release" className="release-workspace-primary">
            {lockedCopy.cta}
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="release-workspace">
      <div className="breadcrumb">
        <Link href="/dashboard">Home</Link>
        <span>/</span>
        My Releases
      </div>

      <div className="release-workspace-header">
        <div>
          <span className="release-kicker">Unlocked workspace</span>
          <h1>My Releases</h1>
          <p>
            {access.plan?.title || 'Release plan'} is active. Upload audio, artwork, and track details for release review.
          </p>
        </div>
        <Link href="/dashboard/release/create" className="release-workspace-primary">
          <UploadCloud size={18} />
          Upload Song
        </Link>
      </div>

      <div className="release-metric-strip">
        <div>
          <span>Active plan</span>
          <strong>{access.plan?.title || access.serviceName || 'Release Plan'}</strong>
        </div>
        <div>
          <span>Paid on</span>
          <strong>{formatDate(access.paymentCompletedAt)}</strong>
        </div>
        <div>
          <span>Total uploads</span>
          <strong>{songs.length}</strong>
        </div>
        <div>
          <span>Total plays</span>
          <strong>{totalPlays.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {songs.length === 0 ? (
        <section className="release-empty-panel">
          <Music2 size={36} />
          <h2>No songs submitted yet</h2>
          <p>Upload your first release and keep your Bouut catalog ready for review.</p>
          <Link href="/dashboard/release/create" className="release-workspace-primary">
            Upload your first song
          </Link>
        </section>
      ) : (
        <div className="release-table-shell">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Song</th>
                <th>Genre</th>
                <th>Status</th>
                <th>Plays</th>
                <th>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, index) => (
                <tr key={song.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="release-song-cell">
                      <img src={song.artUrl} alt={song.title} />
                      <div>
                        <strong>{song.title}</strong>
                        <span>{song.language || 'Music'}</span>
                      </div>
                    </div>
                  </td>
                  <td>{song.genre || 'General'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(song.status)}`}>
                      <CheckCircle2 size={12} />
                      {song.status}
                    </span>
                  </td>
                  <td>{Number(song.plays || 0).toLocaleString('en-IN')}</td>
                  <td>{formatDate(song.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
