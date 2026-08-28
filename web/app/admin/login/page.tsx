import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/adminAuth';
import { AdminLoginForm } from './LoginForm';

export const metadata = { title: 'Administration' };

export default async function AdminLoginPage() {
  if (await isAdminSession()) redirect('/admin');
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <p className="text-sm font-extrabold text-brand">Go Pharma Pro</p>
      <h1 className="mt-2 text-3xl font-extrabold text-ink">Administration</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Validez les pharmacies, livreurs, produits soumis à ordonnance et virements.
      </p>
      <AdminLoginForm />
      <p className="mt-6 text-xs leading-5 text-muted">
        Démo locale : <span className="font-bold text-ink">admin@gopharmapro.com</span> /{' '}
        <span className="font-bold text-ink">demo123</span>
        . Sur Vercel, utilisez <code>ADMIN_EMAIL</code> et <code>ADMIN_PASSWORD</code>.
      </p>
    </main>
  );
}
