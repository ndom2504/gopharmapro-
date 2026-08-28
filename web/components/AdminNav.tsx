'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/pharmacies', label: 'Pharmacies' },
  { href: '/admin/clients', label: 'Clients' },
  { href: '/admin/couriers', label: 'Livreurs' },
  { href: '/admin/catalog', label: 'Produits' },
  { href: '/admin/orders', label: 'Commandes' },
  { href: '/admin/payouts', label: 'Paiements' },
  { href: '/admin/verifications', label: 'Vérifications' },
  { href: '/admin/stats', label: 'Statistiques' },
  { href: '/admin/config', label: 'Configuration' },
];

export function AdminNav() {
  const path = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <aside className="border-b border-border bg-white md:w-60 md:shrink-0 md:border-b-0 md:border-r">
      <div className="px-5 py-5">
        <p className="text-xs font-extrabold tracking-wide text-brand uppercase">Console</p>
        <p className="mt-1 text-lg font-extrabold text-ink">Go Pharma Pro</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:overflow-visible">
        {links.map((l) => {
          const on = l.href === '/admin' ? path === '/admin' : path?.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={
                on
                  ? 'shrink-0 rounded-xl bg-mint px-3 py-2 text-sm font-extrabold text-brand-dark'
                  : 'shrink-0 rounded-xl px-3 py-2 text-sm font-bold text-muted hover:bg-page'
              }
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden px-4 pb-6 md:block">
        <button type="button" onClick={logout} className="btn-secondary w-full !h-10 text-sm">
          Déconnexion
        </button>
      </div>
      <div className="border-t border-border px-4 py-3 md:hidden">
        <button type="button" onClick={logout} className="text-sm font-extrabold text-muted">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
