import Link from 'next/link';
import { site } from '@/lib/site';

const links = [
  { href: '/produits', label: 'Produits' },
  { href: '/pharmacies', label: 'Pharmacies' },
  { href: '/rejoindre', label: 'Espace pharmacie' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint text-lg">💊</span>
          <span className="text-[15px] font-extrabold tracking-tight text-ink">
            {site.name}
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-bold text-muted hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/produits" className="btn-primary !h-10 !px-4 text-sm">
          Commander
        </Link>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-border px-4 py-2.5 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="shrink-0 text-sm font-bold text-muted">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
