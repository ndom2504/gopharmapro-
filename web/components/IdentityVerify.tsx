'use client';

import { useState } from 'react';
import { isPharmacy, type IdentityStatus } from '@/lib/accounts';
import { useShop } from '@/components/ShopProvider';

const labels: Record<IdentityStatus, string> = {
  unverified: 'Identité non vérifiée',
  pending: 'Vérification Stripe en cours',
  verified: 'Identité vérifiée (Stripe)',
  canceled: 'Vérification annulée',
};

export function IdentityVerify() {
  const { session, setIdentity } = useShop();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [demoNote, setDemoNote] = useState('');
  if (!isPharmacy(session)) return null;
  const status = session.identityStatus || 'unverified';
  const done = status === 'verified';

  const start = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/v1/identity/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.email,
          pharmacyId: session.id,
          pharmacyName: session.pharmacyName,
        }),
      });
      const data = (await res.json()) as { demo?: boolean; url?: string; id?: string; error?: string };
      if (data.url && !data.demo) {
        if (data.id) {
          sessionStorage.setItem('gpp-identity-session', data.id);
          setIdentity('pending', data.id);
        }
        window.location.href = data.url;
        return;
      }
      if (data.error && !data.demo) {
        setError(data.error);
        return;
      }
      setIdentity('verified');
      setDemoNote('Mode démo : identité marquée comme vérifiée. Avec STRIPE_SECRET_KEY, Stripe ouvre le vrai contrôle pièce + selfie.');
    } catch {
      setError('Impossible de lancer Stripe Identity pour le moment.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className={`card mt-4 p-5 ${
        done ? 'border-[#BCE9D8] bg-[#E7F7F1]' : 'border-[#FFD8A8] bg-[#FFF4E6]'
      }`}
    >
      <p className="font-extrabold text-ink">Vérification d’identité Stripe</p>
      <p className="mt-1 text-sm leading-6 text-muted">
        Le pharmacien responsable confirme son identité (pièce officielle + selfie) via Stripe Identity, avant
        l’ouverture complète de l’officine.
      </p>
      <p className="mt-3 text-sm font-extrabold text-ink">{labels[status]}</p>
      {error ? <p className="mt-2 text-sm font-bold text-danger">{error}</p> : null}
      {demoNote ? <p className="mt-2 text-sm font-bold text-ink">{demoNote}</p> : null}
      {done ? (
        <span className="badge-green mt-4 inline-flex">Stripe Identity</span>
      ) : (
        <button type="button" className="btn-primary mt-4" disabled={busy} onClick={start}>
          {busy ? 'Ouverture…' : status === 'pending' ? 'Reprendre la vérification' : 'Vérifier mon identité'}
        </button>
      )}
    </section>
  );
}
