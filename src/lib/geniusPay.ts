const API = String(process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

export type GeniusPaySessionResult =
  | { demo: true }
  | { demo: false; url: string; reference: string };

export async function createGeniusPayCheckout(input: {
  amount: number;
  phone?: string;
  returnUrl: string;
  label: string;
}): Promise<GeniusPaySessionResult> {
  if (!API) return { demo: true };
  try {
    const res = await fetch(API + '/payments/geniuspay/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { url?: string; reference?: string; id?: string; demo?: boolean };
    const reference = data.reference || data.id;
    if (data?.url && reference && !data.demo) return { demo: false, url: data.url, reference };
    return { demo: true };
  } catch {
    return { demo: true };
  }
}
