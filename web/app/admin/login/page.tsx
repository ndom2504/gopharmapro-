import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/adminAuth';
import { AdminLoginForm } from './LoginForm';
import { BrandLogo } from '@/components/BrandLogo';

export const metadata = { title: 'Connexion', robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await isAdminSession()) redirect('/admin');
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
