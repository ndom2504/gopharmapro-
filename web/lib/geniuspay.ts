import { createHmac, timingSafeEqual } from 'crypto';

const BASE = 'https://geniuspay.ci/api/v1/merchant';

export function geniusPayConfigured() {
  return Boolean(process.env.GENIUSPAY_API_KEY?.trim() && process.env.GENIUSPAY_API_SECRET?.trim());
}

function headers() {
  return {
    'X-API-Key': process.env.GENIUSPAY_API_KEY!.trim(),
    'X-API-Secret': process.env.GENIUSPAY_API_SECRET!.trim(),
    'Content-Type': 'application/json',
  };
}

export type GeniusPaySession = {
  reference: string;
  checkoutUrl: string;
  status: string;
};

function beninE164(phone?: string) {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('229')) return '+' + digits;
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (/^[4569]\d{7}$/.test(digits)) return '+229' + digits;
  return undefined;
}

export async function createGeniusPayPayment(input: {
  amount: number;
  phone?: string;
  name?: string;
  email?: string;
  description?: string;
  successUrl: string;
  errorUrl: string;
  metadata?: Record<string, string>;
}): Promise<GeniusPaySession> {
  const res = await fetch(`${BASE}/payments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      amount: input.amount,
      currency: 'XOF',
      description: input.description || 'Commande Go Pharma Pro',
      customer: {
        name: input.name || 'Client Go Pharma Pro',
        email: input.email,
        phone: beninE164(input.phone),
        country: 'BJ',
      },
      success_url: input.successUrl,
      error_url: input.errorUrl,
      metadata: { source: 'gopharmapro', country: 'BJ', ...input.metadata },
    }),
  });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { reference?: string; checkout_url?: string; payment_url?: string; status?: string };
    error?: { message?: string };
  };
  const url = json.data?.checkout_url || json.data?.payment_url;
  const reference = json.data?.reference;
  if (!res.ok || !json.success || !url || !reference) {
    throw new Error(json.error?.message || 'Impossible de créer le paiement GeniusPay.');
  }
  return { reference, checkoutUrl: url, status: json.data?.status || 'pending' };
}

export async function getGeniusPayPayment(reference: string) {
  const res = await fetch(`${BASE}/payments/${encodeURIComponent(reference)}`, { headers: headers() });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { reference?: string; status?: string; amount?: number };
  };
  if (!res.ok || !json.success || !json.data) {
    throw new Error('Paiement GeniusPay introuvable.');
  }
  return json.data;
}

export function verifyGeniusPaySignature(rawBody: string, timestamp: string, signature: string) {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET?.trim();
  if (!secret || !timestamp || !signature) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
