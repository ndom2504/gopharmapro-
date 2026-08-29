import type { ReactNode } from 'react';
import { isAdminSession } from '@/lib/adminAuth';
import { AdminNav } from '@/components/AdminNav';
import { BrandLogo } from '@/components/BrandLogo';
import { AdminLoginForm } from '../login/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  if (!(await isAdminSession())) {
    return (
      <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
        <BrandLogo framed size="md" priority />
        <p className="mt-6 text-sm font-extrabold text-brand-blue">Console</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Accès réservé</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Identifiez-vous pour continuer.</p>
        <AdminLoginForm />
      </main>
    );
  }
  return (
    <div className="flex min-h-screen flex-col bg-page md:flex-row">
      <AdminNav />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
