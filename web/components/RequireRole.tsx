'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { homeFor, type UserRole } from '@/lib/accounts';

export function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { ready, session } = useShop();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace(`/connexion?role=${role}&next=${homeFor(role)}`);
      return;
    }
    if (session.role !== role) router.replace(homeFor(session.role));
  }, [ready, session, role, router]);

  if (!ready || session?.role !== role) return null;
  return <>{children}</>;
}

export function RequireClient({ children }: { children: React.ReactNode }) {
  const { ready, session } = useShop();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (session && session.role !== 'client') router.replace(homeFor(session.role));
  }, [ready, session, router]);

  if (!ready) return null;
  if (session && session.role !== 'client') return null;
  return <>{children}</>;
}
