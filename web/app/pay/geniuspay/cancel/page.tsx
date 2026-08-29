import Link from 'next/link';

export default function GeniusPayCancel() {
  return (
    <main className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-ink">Paiement annulé</h1>
      <p className="mt-3 text-muted">Aucun montant n’a été débité. Vous pouvez réessayer depuis le panier.</p>
      <Link href="/commande" className="btn-primary mt-8 inline-flex">
        Retour à la commande
      </Link>
    </main>
  );
}
