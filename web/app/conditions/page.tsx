import { site } from '@/lib/site';

export const metadata = { title: 'Conditions d’utilisation' };

export default function ConditionsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Conditions d’utilisation</h1>
      <p className="mt-4 leading-7 text-muted">
        {site.name} est un prototype de commande de médicaments au Gabon. Il ne fournit pas de conseil médical. Les
        produits soumis à ordonnance ne sont payés qu’après validation par la pharmacie.
      </p>
      <p className="mt-4 leading-7 text-muted">
        Contact temporaire :{' '}
        <a href={`mailto:${site.email}`} className="font-extrabold text-brand">
          {site.email}
        </a>
      </p>
    </main>
  );
}
