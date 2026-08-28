import Link from 'next/link';
import { site } from '@/lib/site';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold text-ink">Page introuvable</h1>
      <p className="mt-3 text-muted">Ce lien n’existe pas encore sur {site.name}.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        Retour à l’accueil
      </Link>
    </main>
  );
}
