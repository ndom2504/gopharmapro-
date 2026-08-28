import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType, type AuthSessionResult } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  expoProxyStartUrl,
  fetchGoogleProfile,
  getGoogleClientIds,
  googleAppReturnUrl,
  googleRedirectUri,
  isExpoGo,
  GoogleProfile,
} from '../lib/google';

WebBrowser.maybeCompleteAuthSession();

function tokenFrom(result: AuthSessionResult) {
  if (result.type !== 'success') return '';
  return result.authentication?.accessToken || result.params.access_token || '';
}

export function useGoogleAuth(onProfile: (profile: GoogleProfile) => void) {
  const ids = getGoogleClientIds();
  const expoGo = isExpoGo();
  const webId = ids.webClientId;
  const nativeIos = expoGo ? webId : ids.iosClientId || webId;
  const nativeAndroid = expoGo ? webId : ids.androidClientId || webId;
  const redirectUri = googleRedirectUri();
  const cb = useRef(onProfile);
  cb.current = onProfile;
  const seen = useRef<AuthSessionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webId || nativeAndroid || nativeIos,
    webClientId: webId,
    iosClientId: nativeIos,
    androidClientId: nativeAndroid,
    redirectUri,
    responseType: expoGo ? ResponseType.Token : undefined,
    selectAccount: true,
    scopes: ['openid', 'profile', 'email'],
    language: 'fr',
  });

  const applyResult = useCallback(async (result: AuthSessionResult | null) => {
    if (!result) return;
    if (result.type === 'cancel' || result.type === 'dismiss' || result.type === 'locked') return;
    if (result.type === 'error') {
      Alert.alert('Google', 'La connexion Google a été refusée ou interrompue.');
      return;
    }
    const token = tokenFrom(result);
    if (!token) {
      Alert.alert('Google', 'Impossible de récupérer le jeton Google.');
      return;
    }
    try {
      cb.current(await fetchGoogleProfile(token));
    } catch {
      Alert.alert('Google', 'Impossible de lire le profil Google.');
    }
  }, []);

  useEffect(() => {
    if (expoGo || !response || response === seen.current) return;
    seen.current = response;
    setBusy(true);
    void applyResult(response).finally(() => setBusy(false));
  }, [applyResult, expoGo, response]);

  const signIn = async () => {
    if (!request) {
      Alert.alert('Google', 'La connexion Google n’est pas encore prête. Réessayez dans un instant.');
      return;
    }
    setBusy(true);
    try {
      if (expoGo) {
        const authUrl = request.url;
        if (!authUrl) {
          Alert.alert('Google', 'Impossible de préparer la connexion Google.');
          return;
        }
        const returnUrl = googleAppReturnUrl();
        const browser = await WebBrowser.openAuthSessionAsync(
          expoProxyStartUrl(authUrl, returnUrl),
          returnUrl,
        );
        if (browser.type === 'cancel' || browser.type === 'dismiss') return;
        if (browser.type !== 'success' || !browser.url) {
          Alert.alert('Google', 'La connexion Google a été refusée ou interrompue.');
          return;
        }
        await applyResult(request.parseReturnUrl(browser.url));
        return;
      }
      await promptAsync();
    } catch {
      Alert.alert('Google', 'Impossible de terminer la connexion Google.');
    } finally {
      setBusy(false);
    }
  };

  return { busy, ready: !!request, signIn };
}
