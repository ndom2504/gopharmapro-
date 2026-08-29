'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { IdentityVerify } from '@/components/IdentityVerify';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy } from '@/lib/accounts';

export default function PharmacyIdentityPage() {
  const { session, setIdentity } = useShop();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isPharmacy(session)) return;
    const id = sessionStorage.getItem('gpp-identity-session') || session.identitySessionId;
    if (!id) return;
    fetch('/api/v1/identity/session?id=' + encodeURIComponent(id))
      .then((r) => r.json())
      .then((data: { status?: string; demo?: boolean }) => {
        if (data.status === 'verified' && session.identityStatus !== 'verified') {
          setIdentity('verified', id);
          setNote('Stripe a confirmé l’identité du responsable.');
          return;
        }
        if (data.status === 'canceled' && session.identityStatus !== 'canceled') {
          setIdentity('canceled', id);
          setNote('La vérification a été annulée.');
          return;
        }
        if ((data.status === 'requires_input' || data.status === 'processing') && session.identityStatus !== 'pending') {
          setIdentity('pending', id);
          setNote('La vérification Stripe n’est pas encore terminée.');
        }
      })
      .catch(() => setNote(''));
  }, [session?.id, session && isPharmacy(session) ? session.identityStatus : '', session && isPharmacy(session) ? session.identitySessionId : '', setIdentity]);

  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <RoleSubnav items={pharmacyNav} />
        <h1 className="text-3xl font-extrabold text-ink">Identité Stripe</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Pièce d’identité et selfie du pharmacien responsable. Sans cette étape, l’officine reste en vérification.
        </p>
        {note ? <p className="mt-4 text-sm font-bold text-ink">{note}</p> : null}
        <IdentityVerify />
        <Link href="/espace-pharmacie" className="btn-secondary mt-6 inline-flex">
          Retour au dashboard
        </Link>
      </main>
    </RequireRole>
  );
}
