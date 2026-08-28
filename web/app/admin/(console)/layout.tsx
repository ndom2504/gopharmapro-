import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/adminAuth';
import { AdminNav } from '@/components/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminSession())) redirect('/admin/login');
  return (
    <div className="flex min-h-screen flex-col bg-page md:flex-row">
      <AdminNav />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
