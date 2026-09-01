'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { ClientCartBadge } from '@/components/ClientCartBadge';
import { useShop } from '@/components/ShopProvider';
import { displayName, homeFor, isClient } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';
import { cartCount, cartSubtotal } from '@/lib/cartMoney';

const clientLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/dashboard/client', label: 'Rechercher' },
  { href: '/dashboard/client/cart', label: 'Panier' },
  { href: '/dashboard/client/orders', label: 'Commandes' },
  { href: '/compte', label: 'Profil' },
];

const pharmacyLinks = [
  { href: '/espace-pharmacie', label: 'Dashboard' },
  { href: '/espace-pharmacie/identite', label: 'Identité' },
  { href: '/dashboard/pharmacy/orders', label: 'Commandes' },
  { href: '/espace-pharmacie/produits', label: 'Produits' },
  { href: '/dashboard/pharmacy/catalog', label: 'Catalogue' },
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
  const count = cartCount(cart);
  const subtotal = cartSubtotal(cart);
  const shopper = !session || isClient(session);
  const links = session?.role === 'pharmacy' ? pharmacyLinks : session?.role === 'courier' ? courierLinks : clientLinks;
  const accountHref = session ? (isClient(session) ? '/compte' : homeFor(session.role)) : '/connexion';
  const accountLabel = session ? (isClient(session) ? displayName(session) : 'Mon espace') : 'Connexion';
  const isOn = (href: string) =>
    href === '/espace-pharmacie' || href === '/espace-livreur' || href === '/'
      ? path === href
      : Boolean(path === href || path?.startsWith(href + '/'));

  return (
    <header className="sticky top-0 z-40 max-w-[100vw] overflow-x-clip bg-black">
      <div className="mx-auto flex h-[72px] min-w-0 max-w-6xl items-center justify-between gap-2 px-3 sm:h-[88px] sm:gap-3 sm:px-6">
        <Link href="/" aria-label="Gopharmapro, accueil" className="flex min-w-0 shrink items-center">
          <BrandLogo
            size="md"
            priority
            className="!h-9 !max-w-[min(44vw,190px)] sm:!h-12 sm:!max-w-[280px] lg:!h-14 lg:!max-w-[360px]"
          />
        </Link>
        <nav className="hidden min-w-0 items-center gap-5 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-bold hover:text-white ${isOn(l.href) ? 'text-white' : 'text-white/70'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isClient(session) ? (
            <ClientCartBadge />
          ) : shopper ? (
            <Link
              href="/panier"
              aria-label={count ? `Panier, ${count} article(s), ${formatFcfa(subtotal)}` : 'Panier'}
              className="relative flex h-9 items-center gap-2 rounded-2xl bg-white/10 px-2 text-brand hover:bg-white/15 sm:h-10 sm:px-2.5"
            >
              <CartIcon />
              {count ? (
                <>
                  <span className="hidden text-xs font-extrabold text-white sm:inline">{formatFcfa(subtotal)}</span>
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-extrabold text-black">
                    {count > 9 ? '9+' : count}
                  </span>
                </>
              ) : null}
            </Link>
          ) : null}
          <Link
            href={accountHref}
            className="btn-primary flex !h-9 max-w-[38vw] items-center gap-2 !px-2.5 text-xs !text-black sm:!h-10 sm:max-w-none sm:!px-3 sm:text-sm"
          >
            {isClient(session) && session.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.photoDataUrl} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover sm:h-7 sm:w-7" />
            ) : null}
            <span className="truncate">{accountLabel}</span>
          </Link>
        </div>
      </div>
      <nav className="flex max-w-[100vw] gap-1.5 overflow-x-auto overscroll-x-contain border-t border-white/10 px-3 py-2 [scrollbar-width:thin] lg:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold ${
              isOn(l.href) ? 'bg-brand text-black' : 'text-white/70'
            }`}
          >
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
