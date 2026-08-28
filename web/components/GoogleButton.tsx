'use client';

import { useState } from 'react';
import { fetchGoogleProfile, googleWebClientId, isGoogleConfigured, loadGoogleIdentity, type GoogleProfile } from '@/lib/google';

export function GoogleButton({
  onProfile,
  onError,
  label = 'Continuer avec Google',
}: {
  onProfile: (profile: GoogleProfile) => void;
  onError?: (message: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const ready = isGoogleConfigured();

  const fail = (message: string) => {
    setBusy(false);
    onError?.(message);
  };

  const signIn = async () => {
    if (!ready) {
      onError?.('Le Client ID Web Google n’est pas chargé. Vérifiez NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID, puis relancez le site.');
      return;
    }
    setBusy(true);
    try {
      await loadGoogleIdentity();
      const clientId = googleWebClientId();
      const api = window.google?.accounts?.oauth2;
      if (!clientId || !api) {
        fail('Connexion Google impossible.');
        return;
      }
      const client = api.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (resp) => {
          if (resp.error || !resp.access_token) {
            fail(resp.error === 'popup_closed_by_user' ? '' : 'Connexion Google impossible.');
            return;
          }
          try {
            const profile = await fetchGoogleProfile(resp.access_token);
            onProfile(profile);
          } catch {
            fail('Impossible de lire le profil Google.');
          } finally {
            setBusy(false);
          }
        },
        error_callback: (err) => {
          if (err.type === 'popup_closed') {
            setBusy(false);
            return;
          }
          fail('Connexion Google impossible.');
        },
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch {
      fail('Connexion Google impossible.');
    }
  };

  return (
    <button type="button" onClick={signIn} disabled={busy} className="btn-secondary w-full gap-2.5 disabled:opacity-50">
      <span className="text-base font-black text-[#4285F4]">G</span>
      {busy ? 'Connexion…' : label}
    </button>
  );
}
