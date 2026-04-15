'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    slug?: string | null;
    avatar?: string | null;
    banner?: string | null;
    bio?: string | null;
    artistTypes?: string[] | null;
    genre?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    website?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    spotify?: string | null;
    isPro: boolean;
    onboardingCompleted?: boolean;
    profileProgress: number;
    createdAt?: string;
}

type AuthMode = 'login' | 'register';

interface LoginPayload {
    email: string;
    password: string;
}

interface RegisterPayload extends LoginPayload {
    name: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    isAuthModalOpen: boolean;
    authMode: AuthMode;
    authError: string | null;
    isSubmitting: boolean;
    openAuthModal: (mode?: AuthMode, redirectTo?: string) => void;
    closeAuthModal: () => void;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<AuthUser | null>;
    setUser: (user: AuthUser | null) => void;
}

interface AuthResponse {
    token: string;
    user: AuthUser;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'bouut.user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getErrorMessage(payload: unknown, fallback: string) {
    if (payload && typeof payload === 'object' && 'error' in payload) {
        const error = (payload as { error?: unknown }).error;

        if (typeof error === 'string') {
            return error;
        }
    }

    return fallback;
}

async function parseJson(response: Response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUserState] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [authError, setAuthError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

    const persistSession = useCallback((nextToken: string, nextUser: AuthUser) => {
        setToken(nextToken);
        setUserState(nextUser);
        localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    }, []);

    const clearSession = useCallback(() => {
        setToken(null);
        setUserState(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
    }, []);

    const setUser = useCallback((nextUser: AuthUser | null) => {
        setUserState(nextUser);

        if (nextUser) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
            return;
        }

        localStorage.removeItem(USER_STORAGE_KEY);
    }, []);

    const refreshUser = useCallback(async () => {
        const authToken = localStorage.getItem(TOKEN_STORAGE_KEY);

        if (!authToken) {
            setIsLoading(false);
            return null;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                cache: 'no-store',
            });
            const payload = await parseJson(response);

            if (!response.ok) {
                throw new Error(getErrorMessage(payload, 'Session expired'));
            }

            const nextUser = payload as AuthUser;
            persistSession(authToken, nextUser);
            return nextUser;
        } catch {
            clearSession();
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [clearSession, persistSession]);

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (storedToken) {
            setToken(storedToken);
        }

        if (storedUser) {
            try {
                setUserState(JSON.parse(storedUser) as AuthUser);
            } catch {
                localStorage.removeItem(USER_STORAGE_KEY);
            }
        }

        if (storedToken) {
            void refreshUser();
            return;
        }

        setIsLoading(false);
    }, [refreshUser]);

    const openAuthModal = useCallback((mode: AuthMode = 'login', redirectTo?: string) => {
        setAuthMode(mode);
        setAuthError(null);
        setPendingRedirect(current => redirectTo === undefined ? current : redirectTo);
        setIsAuthModalOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setAuthError(null);
        setPendingRedirect(null);
        setIsAuthModalOpen(false);
    }, []);

    const handleAuthSuccess = useCallback(async (payload: AuthResponse) => {
        persistSession(payload.token, payload.user);
        setAuthError(null);
        setIsAuthModalOpen(false);

        const destination = pendingRedirect || (payload.user.role === 'ADMIN' ? '/admin' : '/dashboard');
        setPendingRedirect(null);

        // A full navigation avoids protected-route races immediately after
        // saving a fresh session in localStorage on production deploys.
        if (typeof window !== 'undefined') {
            window.location.assign(destination);
            return;
        }

        router.push(destination);
    }, [pendingRedirect, persistSession, router]);

    const login = useCallback(async ({ email, password }: LoginPayload) => {
        setIsSubmitting(true);
        setAuthError(null);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const payload = await parseJson(response);

            if (!response.ok) {
                throw new Error(getErrorMessage(payload, 'Sign in failed'));
            }

            await handleAuthSuccess(payload as AuthResponse);
        } catch (error) {
            setAuthError(error instanceof Error ? error.message : 'Sign in failed');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [handleAuthSuccess]);

    const register = useCallback(async ({ name, email, password }: RegisterPayload) => {
        setIsSubmitting(true);
        setAuthError(null);

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            const payload = await parseJson(response);

            if (!response.ok) {
                throw new Error(getErrorMessage(payload, 'Registration failed'));
            }

            await handleAuthSuccess(payload as AuthResponse);
        } catch (error) {
            setAuthError(error instanceof Error ? error.message : 'Registration failed');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [handleAuthSuccess]);

    const logout = useCallback(() => {
        closeAuthModal();
        clearSession();
        router.push('/');
    }, [clearSession, closeAuthModal, router]);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        isAuthModalOpen,
        authMode,
        authError,
        isSubmitting,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser,
        setUser,
    }), [
        authError,
        authMode,
        closeAuthModal,
        isAuthModalOpen,
        isLoading,
        isSubmitting,
        login,
        logout,
        openAuthModal,
        refreshUser,
        register,
        setUser,
        token,
        user,
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
