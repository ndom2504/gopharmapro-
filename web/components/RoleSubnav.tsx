'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function RoleSubnav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const path = usePathname();
  return (
    <nav className="mb-6 hidden gap-2 overflow-x-auto lg:flex">
      {items.map((item) => {
        const on =
          item.href === '/espace-livreur' || item.href === '/espace-pharmacie'
            ? path === item.href
            : path === item.href || Boolean(path?.startsWith(item.href + '/'));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-extrabold ${
              on ? 'bg-brand text-black' : 'border border-border bg-white text-muted'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export const courierNav = [
  { href: '/espace-livreur', label: 'Accueil' },
  { href: '/espace-livreur/livraisons', label: 'Livraisons' },
  { href: '/espace-livreur/carte', label: 'Carte' },
  { href: '/espace-livreur/revenus', label: 'Revenus' },
  { href: '/espace-livreur/profil', label: 'Profil' },
];

export const pharmacyNav = [
  { href: '/espace-pharmacie', label: 'Dashboard' },
  { href: '/espace-pharmacie/identite', label: 'Identité' },
  { href: '/espace-pharmacie/commandes', label: 'Commandes' },
  { href: '/espace-pharmacie/produits', label: 'Produits' },
  { href: '/espace-pharmacie/catalogue', label: 'Catalogue' },
  { href: '/espace-pharmacie/ordonnances', label: 'Ordonnances' },
  { href: '/espace-pharmacie/ventes', label: 'Ventes' },
  { href: '/espace-pharmacie/profil', label: 'Profil' },
];
