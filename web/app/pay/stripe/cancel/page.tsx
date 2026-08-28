import Link from 'next/link';

export default function StripeCancel() {
  return (
    <main className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-ink">Paiement annulé</h1>
      <p className="mt-3 text-muted">Vous pouvez fermer cette page et choisir un autre moyen de paiement dans l’app.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        Retour au site
      </Link>
    </main>
  );
}
