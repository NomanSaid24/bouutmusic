'use client';
import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/Layout/AdminSidebar';
import { Header } from '@/components/Layout/Header';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <AdminSidebar />
      <Header />
      <main className="main-content" style={{ background: '#f9fafb' }}>
        {children}
      </main>
    </div>
  );
}
