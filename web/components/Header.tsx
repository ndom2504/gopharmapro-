'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { site } from '@/lib/site';
import { useShop } from '@/components/ShopProvider';
import { displayName, homeFor, isClient } from '@/lib/accounts';

const links = [
  { href: '/produits', label: 'Produits' },
  { href: '/pharmacies', label: 'Pharmacies' },
  { href: '/rejoindre', label: 'Espace pharmacie' },
];

export function Header() {
  const path = usePathname();
  const { session, cart } = useShop();
  if (path?.startsWith('/admin')) return null;
  const count = cart.reduce((a, i) => a + i.quantity, 0);
  const shopper = !session || isClient(session);
  const accountHref = session ? (isClient(session) ? '/commandes' : homeFor(session.role)) : '/connexion';
  const accountLabel = session ? displayName(session) : 'Connexion';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint text-lg">💊</span>
          <span className="text-[15px] font-extrabold tracking-tight text-ink">{site.name}</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-bold text-muted hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {shopper ? (
            <Link
              href="/panier"
              aria-label={count ? `Panier, ${count} article(s)` : 'Panier'}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-mint text-brand hover:bg-[#d8f0e6]"
            >
              <CartIcon />
              {count ? (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-extrabold text-white">
                  {count > 9 ? '9+' : count}
                </span>
              ) : null}
            </Link>
          ) : null}
          <Link href={accountHref} className="hidden max-w-[10rem] truncate text-sm font-extrabold text-ink sm:inline">
            {accountLabel}
          </Link>
          {session && !isClient(session) ? (
            <Link href={homeFor(session.role)} className="btn-primary !h-10 !px-4 text-sm">
              Mon espace
            </Link>
          ) : (
            <Link href="/produits" className="btn-primary !h-10 !px-4 text-sm">
              Commander
            </Link>
          )}
        </div>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-border px-4 py-2.5 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="shrink-0 text-sm font-bold text-muted">
            {l.label}
          </Link>
        ))}
        {shopper ? (
          <Link href="/panier" className="relative shrink-0 text-brand" aria-label="Panier">
            <CartIcon />
            {count ? (
              <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-extrabold text-white">
                {count > 9 ? '9+' : count}
              </span>
            ) : null}
          </Link>
        ) : null}
        <Link href={accountHref} className="shrink-0 text-sm font-bold text-muted">
          {session ? 'Compte' : 'Connexion'}
        </Link>
      </nav>
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8h15l-1.4 8.4a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5 5H2"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.4" fill="currentColor" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}
