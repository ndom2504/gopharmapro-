'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { site } from '@/lib/site';

export function Footer() {
  const path = usePathname();
  if (path?.startsWith('/admin')) return null;
  return (
    <footer className="mt-auto bg-black">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <BrandLogo size="md" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">{site.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-extrabold text-white">Découvrir</p>
          <div className="mt-3 flex flex-col gap-2 text-sm font-semibold text-white/65">
            <Link href="/produits" className="hover:text-brand">
              Comparer les produits
            </Link>
            <Link href="/pharmacies" className="hover:text-brand">
              Pharmacies vérifiées
            </Link>
            <Link href="/panier" className="hover:text-brand">
              Panier
            </Link>
            <Link href="/connexion" className="hover:text-brand">
              Connexion
            </Link>
            <Link href="/connexion?role=courier" className="hover:text-brand">
              Espace livreur
            </Link>
            <Link href="/rejoindre" className="hover:text-brand">
              Inscrire mon officine
            </Link>
            <Link href="/conditions" className="hover:text-brand">
              Conditions d’utilisation
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-extrabold text-white">Gabon</p>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Libreville
            <br />
            <a href={`mailto:${site.email}`} className="hover:text-brand">
              {site.email}
            </a>
          </p>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-5 text-center text-xs leading-5 text-white/45">
        Prototype. {site.name} ne fournit pas de conseil médical. Les médicaments soumis à
        ordonnance ne sont payés qu’après validation par la pharmacie.
      </p>
    </footer>
  );
}
