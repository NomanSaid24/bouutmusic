'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Disc3, FileAudio, ImagePlus, Lock, UploadCloud } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ReleaseAccess = {
  hasAccess: boolean;
  state?: 'NO_PLAN' | 'PAYMENT_REQUIRED' | 'PENDING_REVIEW' | 'REJECTED' | 'APPROVED' | 'PAID';
  plan: {
    title: string;
  } | null;
};

type UploadForm = {
  title: string;
  genre: string;
  language: string;
  year: string;
  description: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  featuredArtists: string;
};

const INITIAL_FORM: UploadForm = {
  title: '',
  genre: 'Pop',
  language: 'English',
  year: String(new Date().getFullYear()),
  description: '',
  privacy: 'PUBLIC',
  featuredArtists: '',
};

const genres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Indie', 'Bollywood', 'Sufi', 'Punjabi', 'Classical'];
const languages = ['English', 'Hindi', 'Punjabi', 'Urdu', 'Tamil', 'Telugu', 'Marathi', 'Instrumental'];

function getFileLabel(file: File | null, fallback: string) {
  return file ? file.name : fallback;
}

function getUploadLockCopy(access: ReleaseAccess | null) {
  if (access?.state === 'PENDING_REVIEW') {
    return {
      kicker: 'Payment received',
      title: 'Your release payment is complete.',
      body: 'The upload form unlocks as soon as PayU confirms the paid release plan. If admin later rejects it, the form moves into refund handling.',
      cta: 'View release plans',
    };
  }

  if (access?.state === 'REJECTED') {
    return {
      kicker: 'Release plan rejected',
      title: 'This paid release plan was rejected.',
      body: 'Rejected paid release plans are sent to the refund queue. Choose another release plan to submit again.',
      cta: 'Choose another plan',
    };
  }

  if (access?.state === 'PAYMENT_REQUIRED') {
    return {
      kicker: 'Payment required',
      title: 'Complete PayU payment before uploading music.',
      body: 'Your release plan has been selected, but upload unlock happens after PayU confirms the payment.',
      cta: 'Choose a release plan',
    };
  }

  return {
    kicker: 'Release plan required',
    title: 'Choose a release plan before uploading music.',
    body: 'PayU payment unlocks the upload form and My Releases workspace for your distribution submission.',
    cta: 'Choose a release plan',
  };
}

export default function ReleaseCreatePage() {
  const router = useRouter();
  const { token, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const [access, setAccess] = useState<ReleaseAccess | null>(null);
  const [form, setForm] = useState<UploadForm>(INITIAL_FORM);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!token) {
      setIsLoading(false);
      openAuthModal('login', '/dashboard/release/create');
      return;
    }

    let isMounted = true;

    async function loadAccess() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/songs/release-access`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const payload = await response.json().catch(() => null) as ReleaseAccess | { error?: string } | null;

        if (!response.ok || !payload || !('hasAccess' in payload)) {
          throw new Error(
            payload && typeof payload === 'object' && 'error' in payload && payload.error
              ? payload.error
              : 'Unable to verify release plan access.',
          );
        }

        if (isMounted) {
          setAccess(payload);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to verify release plan access.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAccess();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, openAuthModal, token]);

  function updateField<K extends keyof UploadForm>(field: K, value: UploadForm[K]) {
    setForm(previous => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      openAuthModal('login', '/dashboard/release/create');
      return;
    }

    if (!form.title.trim()) {
      setError('Please enter a song title.');
      return;
    }

    if (!audioFile) {
      setError('Please choose an audio file.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append('title', form.title.trim());
      uploadData.append('genre', form.genre);
      uploadData.append('language', form.language);
      uploadData.append('year', form.year);
      uploadData.append('description', form.description.trim());
      uploadData.append('privacy', form.privacy);
      uploadData.append('featuredArtists', form.featuredArtists.trim());
      uploadData.append('audio', audioFile);

      if (artworkFile) {
        uploadData.append('artwork', artworkFile);
      }

      const response = await fetch(`${API_URL}/api/songs/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const payload = await response.json().catch(() => null) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || 'Upload failed.');
      }

      router.push('/dashboard/release/my-releases');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <div className="release-workspace">
        <div className="release-loading-panel">Checking release access...</div>
      </div>
    );
  }

  if (error && !access) {
    return (
      <div className="release-workspace">
        <div className="release-lock-panel">
          <div className="release-lock-icon">
            <Lock size={28} />
          </div>
          <h1>Unable to open upload</h1>
          <p>{error}</p>
          <Link href="/dashboard/release" className="release-workspace-primary">
            Back to release plans
          </Link>
        </div>
      </div>
    );
  }

  if (!access?.hasAccess) {
    const lockedCopy = getUploadLockCopy(access);

    return (
      <div className="release-workspace">
        <div className="breadcrumb">
          <Link href="/dashboard">Home</Link>
          <span>/</span>
          Upload Song
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
    <div className="release-upload-page">
      <div className="breadcrumb">
        <Link href="/dashboard">Home</Link>
        <span>/</span>
        <Link href="/dashboard/release/my-releases">My Releases</Link>
        <span>/</span>
        Upload Song
      </div>

      <div className="release-workspace-header">
        <div>
          <span className="release-kicker">New release upload</span>
          <h1>Submit your music</h1>
          <p>{access.plan?.title || 'Release plan'} is active. Add the core track details and files below.</p>
        </div>
        <Link href="/dashboard/release/my-releases" className="release-workspace-secondary">
          My Releases
        </Link>
      </div>

      <form className="release-upload-form" onSubmit={handleSubmit}>
        <section className="release-upload-panel">
          <div className="release-upload-panel-head">
            <Disc3 size={22} />
            <div>
              <h2>Track metadata</h2>
              <p>Use the official title and details you want reviewed for distribution.</p>
            </div>
          </div>

          <div className="release-form-grid">
            <label className="release-field release-field-wide">
              <span>Song title*</span>
              <input
                type="text"
                value={form.title}
                onChange={event => updateField('title', event.target.value)}
                placeholder="Enter your official song title"
              />
            </label>

            <label className="release-field">
              <span>Genre</span>
              <select value={form.genre} onChange={event => updateField('genre', event.target.value)}>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </label>

            <label className="release-field">
              <span>Language</span>
              <select value={form.language} onChange={event => updateField('language', event.target.value)}>
                {languages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </label>

            <label className="release-field">
              <span>Release year</span>
              <input
                type="number"
                min="1900"
                max="2100"
                value={form.year}
                onChange={event => updateField('year', event.target.value)}
              />
            </label>

            <label className="release-field">
              <span>Privacy</span>
              <select value={form.privacy} onChange={event => updateField('privacy', event.target.value as UploadForm['privacy'])}>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </label>

            <label className="release-field release-field-wide">
              <span>Featured artists</span>
              <input
                type="text"
                value={form.featuredArtists}
                onChange={event => updateField('featuredArtists', event.target.value)}
                placeholder="Separate multiple artists with commas"
              />
            </label>

            <label className="release-field release-field-wide">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={event => updateField('description', event.target.value)}
                placeholder="Add notes for the release team"
              />
            </label>
          </div>
        </section>

        <aside className="release-upload-panel">
          <div className="release-upload-panel-head">
            <UploadCloud size={22} />
            <div>
              <h2>Files</h2>
              <p>Upload the final audio. Artwork is optional here and can be updated later.</p>
            </div>
          </div>

          <div className="release-file-stack">
            <label className="release-file-drop">
              <FileAudio size={26} />
              <strong>{getFileLabel(audioFile, 'Choose audio file*')}</strong>
              <span>MP3, WAV, or FLAC up to 100MB</span>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.flac"
                onChange={event => setAudioFile(event.target.files?.[0] || null)}
              />
            </label>

            <label className="release-file-drop">
              <ImagePlus size={26} />
              <strong>{getFileLabel(artworkFile, 'Choose artwork')}</strong>
              <span>JPG or PNG square artwork recommended</span>
              <input
                type="file"
                accept="image/*,.jpg,.jpeg,.png"
                onChange={event => setArtworkFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>

          {error && <div className="release-form-error">{error}</div>}

          <button type="submit" className="release-submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Uploading...' : 'Submit Music'}
            <UploadCloud size={17} />
          </button>
        </aside>
      </form>
    </div>
  );
}
