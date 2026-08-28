const API = String(process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

export type StripeSessionResult =
  | { demo: true }
  | { demo: false; url: string; id: string };

export async function createStripeCheckout(input: {
  amount: number;
  returnUrl: string;
  label: string;
}): Promise<StripeSessionResult> {
  if (!API) return { demo: true };
  try {
    const res = await fetch(API + '/payments/stripe/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { url?: string; id?: string; demo?: boolean };
    if (data?.url && data.id && !data.demo) return { demo: false, url: data.url, id: data.id };
    return { demo: true };
  } catch {
    return { demo: true };
  }
}

export function formatCardNumber(input: string) {
  return input.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatCardExpiry(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + '/' + digits.slice(2);
}

export function isStripeTestCard(number: string, expiry: string, cvc: string) {
  const digits = number.replace(/\D/g, '');
  const exp = expiry.replace(/\D/g, '');
  return digits === '4242424242424242' && exp.length === 4 && /^\d{3}$/.test(cvc);
}

export function cardBrandLabel(number: string) {
  const digits = number.replace(/\D/g, '');
  return 'Visa •••• ' + digits.slice(-4);
}
