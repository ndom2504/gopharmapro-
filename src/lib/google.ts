import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';

type GoogleIds = {
  webClientId: string;
  iosClientId: string;
  androidClientId: string;
};

const EXPO_PROXY_PROJECT = '@ndom2504/pharmarket-mobile';

function extra(key: string) {
  const fromEnv = String(process.env[key] || '').trim().replace(/^["']|["']$/g, '');
  const bag = (Constants.expoConfig?.extra || {}) as Record<string, string>;
  const fromExtra =
    bag[key] ||
    bag[key.replace('EXPO_PUBLIC_', '')] ||
    (key.includes('WEB') ? bag.googleWebClientId : '') ||
    (key.includes('IOS') ? bag.googleIosClientId : '') ||
    (key.includes('ANDROID') ? bag.googleAndroidClientId : '') ||
    '';
  return fromEnv || String(fromExtra || '').trim();
}

export function isGoogleConfigured() {
  const ids = getGoogleClientIds();
  return Boolean(ids.webClientId || ids.iosClientId || ids.androidClientId);
}

/** Client ID Google : xxx.apps.googleusercontent.com — jamais le secret GOCSPX- */
export function isGoogleClientId(value: string) {
  const id = value.trim();
  if (!id || id.startsWith('GOCSPX-')) return false;
  return /\.apps\.googleusercontent\.com$/.test(id);
}

export function getGoogleClientIds(): GoogleIds {
  const webClientId = extra('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  const iosClientId = extra('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');
  const androidClientId = extra('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID');
  return {
    webClientId: isGoogleClientId(webClientId) ? webClientId.trim() : '',
    iosClientId: isGoogleClientId(iosClientId) ? iosClientId.trim() : '',
    androidClientId: isGoogleClientId(androidClientId) ? androidClientId.trim() : '',
  };
}

export function isExpoGo() {
  return isRunningInExpoGo() || Constants.appOwnership === 'expo';
}

export function expoProxyRedirectUri() {
  const owner = Constants.expoConfig?.owner;
  const slug = Constants.expoConfig?.slug;
  const full =
    Constants.expoConfig?.originalFullName ||
    (owner && slug ? `@${owner}/${slug}` : EXPO_PROXY_PROJECT);
  return `https://auth.expo.io/${full}`;
}

/** URI enregistrée chez Google. En Expo Go le navigateur doit y passer via /start (returnUrl). */
export function googleRedirectUri() {
  return isExpoGo() ? expoProxyRedirectUri() : undefined;
}

/** Adresse de retour vers l’app (exp://…), distincte de l’URI Google. */
export function googleAppReturnUrl() {
  return AuthSession.getDefaultReturnUrl();
}

/**
 * Sans /start, Google atterrit sur auth.expo.io sans returnUrl
 * → « Something went wrong trying to finish signing in ».
 */
export function expoProxyStartUrl(authUrl: string, returnUrl: string) {
  const qs = new URLSearchParams({ authUrl, returnUrl });
  return `${expoProxyRedirectUri()}/start?${qs.toString()}`;
}

export type GoogleProfile = {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
};

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: 'Bearer ' + accessToken },
  });
  if (!res.ok) throw new Error('google-profile');
  const data = (await res.json()) as {
    id?: string;
    sub?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    name?: string;
  };
  const full = (data.name || '').trim().split(/\s+/);
  const firstName = data.given_name || full[0] || 'Client';
  const lastName = data.family_name || full.slice(1).join(' ') || 'Google';
  return {
    googleId: data.id || data.sub || '',
    email: (data.email || '').toLowerCase(),
    firstName,
    lastName,
  };
}
