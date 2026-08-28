import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-extrabold text-ink">
            <span>💊</span> {site.name}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">{site.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-extrabold text-ink">Découvrir</p>
          <div className="mt-3 flex flex-col gap-2 text-sm font-semibold text-muted">
            <Link href="/produits">Comparer les produits</Link>
            <Link href="/pharmacies">Pharmacies partenaires</Link>
            <Link href="/rejoindre">Inscrire mon officine</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-extrabold text-ink">Gabon</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Libreville · Mobile money · Livraison et retrait.
          </p>
        </div>
      </div>
      <p className="border-t border-border px-4 py-5 text-center text-xs leading-5 text-muted">
        Prototype. {site.name} ne fournit pas de conseil médical. Les médicaments soumis à
        ordonnance ne sont payés qu’après validation par la pharmacie.
      </p>
    </footer>
  );
}
