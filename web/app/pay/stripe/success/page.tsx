'use client';

import { useEffect } from 'react';
import { site } from '@/lib/site';

export default function StripeSuccess() {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const sessionId = q.get('session_id') || '';
    const returnUrl = q.get('return') || '';
    if (returnUrl) {
      try {
        const target = new URL(returnUrl);
        target.searchParams.set('status', 'success');
        if (sessionId) target.searchParams.set('session_id', sessionId);
        window.location.replace(target.toString());
        return;
      } catch {
        //
      }
    }
    window.location.replace(site.url);
  }, []);

  return (
    <main className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-ink">Paiement confirmé</h1>
      <p className="mt-3 text-muted">Retour vers l’application Go Pharma Pro…</p>
    </main>
  );
}
