'use client';

import { useEffect } from 'react';
import { site } from '@/lib/site';

export default function GeniusPaySuccess() {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const returnUrl = q.get('return') || '';
    if (returnUrl) {
      try {
        const target = new URL(returnUrl);
        target.searchParams.set('status', 'success');
        window.location.replace(target.toString());
        return;
      } catch {
        //
      }
    }
    window.location.replace('/payer/geniuspay?status=success');
  }, []);

  return (
    <main className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-ink">Paiement GeniusPay confirmé</h1>
      <p className="mt-3 text-muted">Retour vers {site.name}…</p>
    </main>
  );
}
