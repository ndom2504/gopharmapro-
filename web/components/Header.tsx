'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { useShop } from '@/components/ShopProvider';
import { displayName, homeFor, isClient } from '@/lib/accounts';

const clientLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/produits', label: 'Rechercher' },
  { href: '/commandes', label: 'Commandes' },
  { href: '/compte', label: 'Profil' },
];

const pharmacyLinks = [
  { href: '/espace-pharmacie', label: 'Dashboard' },
  { href: '/espace-pharmacie/identite', label: 'Identité' },
  { href: '/espace-pharmacie/commandes', label: 'Commandes' },
  { href: '/espace-pharmacie/produits', label: 'Produits' },
  { href: '/espace-pharmacie/ordonnances', label: 'Ordonnances' },
  { href: '/espace-pharmacie/ventes', label: 'Ventes' },
  { href: '/espace-pharmacie/profil', label: 'Profil' },
];

const courierLinks = [
  { href: '/espace-livreur', label: 'Accueil' },
  { href: '/espace-livreur/livraisons', label: 'Livraisons' },
  { href: '/espace-livreur/carte', label: 'Carte' },
  { href: '/espace-livreur/revenus', label: 'Revenus' },
  { href: '/espace-livreur/profil', label: 'Profil' },
];

export function Header() {
  const path = usePathname();
  const { session, cart } = useShop();
  if (path?.startsWith('/admin')) return null;
  const count = cart.reduce((a, i) => a + i.quantity, 0);
  const shopper = !session || isClient(session);
  const links = session?.role === 'pharmacy' ? pharmacyLinks : session?.role === 'courier' ? courierLinks : clientLinks;
  const accountHref = session ? (isClient(session) ? '/compte' : homeFor(session.role)) : '/connexion';
  const accountLabel = session ? (isClient(session) ? displayName(session) : 'Mon espace') : 'Connexion';

  return (
    <header className="sticky top-0 z-40 bg-black">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="Gopharmapro, accueil" className="shrink-0">
          <BrandLogo size="md" priority />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-bold text-white/70 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {shopper ? (
            <Link
              href="/panier"
              aria-label={count ? `Panier, ${count} article(s)` : 'Panier'}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-brand hover:bg-white/15"
            >
              <CartIcon />
              {count ? (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-extrabold text-black">
                  {count > 9 ? '9+' : count}
                </span>
              ) : null}
            </Link>
          ) : null}
          <Link href={accountHref} className="btn-primary !h-10 !px-4 text-sm !text-black">
            {accountLabel}
          </Link>
        </div>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-white/10 px-4 py-2.5 lg:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="shrink-0 text-sm font-bold text-white/70">
            {l.label}
          </Link>
        ))}
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
