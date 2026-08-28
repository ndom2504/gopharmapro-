import Constants from 'expo-constants';

type GoogleIds = {
  webClientId: string;
  iosClientId: string;
  androidClientId: string;
};

function extra(key: string) {
  const fromEnv = process.env[key] || '';
  const extra = (Constants.expoConfig?.extra || {}) as Record<string, string>;
  return fromEnv || extra[key] || extra[key.replace('EXPO_PUBLIC_', '')] || '';
}

export function getGoogleClientIds(): GoogleIds {
  const webClientId = extra('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID') || extra('googleWebClientId');
  const iosClientId = extra('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID') || extra('googleIosClientId');
  const androidClientId = extra('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID') || extra('googleAndroidClientId');
  return { webClientId, iosClientId, androidClientId };
}

export function isGoogleConfigured() {
  const ids = getGoogleClientIds();
  return Boolean(ids.webClientId || ids.iosClientId || ids.androidClientId);
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
