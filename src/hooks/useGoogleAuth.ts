import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { fetchGoogleProfile, getGoogleClientIds, GoogleProfile } from '../lib/google';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onProfile: (profile: GoogleProfile) => void) {
  const ids = getGoogleClientIds();
  const fallback = ids.webClientId || ids.iosClientId || ids.androidClientId;
  const cb = useRef(onProfile);
  cb.current = onProfile;
  const [busy, setBusy] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId: fallback,
      webClientId: ids.webClientId || fallback,
      iosClientId: ids.iosClientId || fallback,
      androidClientId: ids.androidClientId || fallback,
      selectAccount: true,
      scopes: ['openid', 'profile', 'email'],
      language: 'fr',
    },
    { scheme: 'pharmarket' },
  );

  useEffect(() => {
    if (response?.type === 'error') {
      Alert.alert('Google', 'La connexion Google a été refusée ou interrompue.');
      return;
    }
    if (response?.type !== 'success') return;
    const token = response.authentication?.accessToken || response.params.access_token;
    if (!token) {
      Alert.alert('Google', 'Impossible de récupérer le jeton Google.');
      return;
    }
    setBusy(true);
    fetchGoogleProfile(token)
      .then((profile) => cb.current(profile))
      .catch(() => Alert.alert('Google', 'Impossible de lire le profil Google.'))
      .finally(() => setBusy(false));
  }, [response]);

  const signIn = async () => {
    setBusy(true);
    try {
      await promptAsync();
    } finally {
      setBusy(false);
    }
  };

  return { busy, ready: !!request, signIn };
}
