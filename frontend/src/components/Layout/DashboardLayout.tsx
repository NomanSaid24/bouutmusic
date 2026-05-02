'use client';
import { useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/Layout/Header';
import { MusicPlayer } from '@/components/Layout/MusicPlayer';
import { AdminSidebar } from '@/components/Layout/AdminSidebar';
import { AdminHeader } from '@/components/Layout/AdminHeader';
import { Footer } from '@/components/Layout/Footer';
import { usePlayerStore } from '@/store/playerStore';
import { useAuth } from '@/components/providers/AuthProvider';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isPlayerVisible } = usePlayerStore();
  const { user, isLoading, openAuthModal } = useAuth();

  const isAdminRoute = pathname?.startsWith('/admin') ?? false;
  const isProtectedRoute = pathname?.startsWith('/dashboard') || isAdminRoute;
  const canAccessCurrentRoute = !isProtectedRoute || (!!user && (!isAdminRoute || user.role === 'ADMIN'));
  const showPlayer = !isAdminRoute && (isPlayerVisible || pathname?.startsWith('/playlists'));
  const showFooter = !isAdminRoute;

  useEffect(() => {
    if (!pathname || isLoading || canAccessCurrentRoute) {
      return;
    }

    if (isAdminRoute) {
      if (user) {
        router.replace('/dashboard');
        return;
      }

      openAuthModal('login', pathname);
      router.replace('/');
      return;
    }

    openAuthModal('login', pathname);
    router.replace('/');
  }, [canAccessCurrentRoute, isAdminRoute, isLoading, openAuthModal, pathname, router, user]);

  if (isProtectedRoute && !canAccessCurrentRoute) {
    return null;
  }

  return (
    <div className={`app-layout ${showPlayer ? 'has-player' : ''} ${isAdminRoute ? 'has-admin-sidebar' : 'no-app-sidebar'}`}>
      {isAdminRoute ? <AdminSidebar /> : null}
      {isAdminRoute ? <AdminHeader /> : <Header />}
      <main className={`main-content ${isAdminRoute ? 'admin-main-content' : ''}`}>
        {children}
        {showFooter && <Footer />}
      </main>
      {showPlayer && <MusicPlayer />}
    </div>
  );
}
