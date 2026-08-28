export type GoogleProfile = {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type GoogleRole = 'client' | 'courier';

export function googleWebClientId() {
  const id = (process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || '').trim().replace(/^["']|["']$/g, '');
  if (!id || id.startsWith('GOCSPX-')) return '';
  return /\.apps\.googleusercontent\.com$/.test(id) ? id : '';
}

export function isGoogleConfigured() {
  return Boolean(googleWebClientId());
}

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

type TokenClient = { requestAccessToken: (opts?: { prompt?: string }) => void };

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

let gisPromise: Promise<void> | null = null;

export function loadGoogleIdentity(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('window'));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gpp-gis]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gis')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.dataset.gppGis = '1';
    script.onload = () => resolve();
    script.onerror = () => {
      gisPromise = null;
      reject(new Error('gis'));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
}
