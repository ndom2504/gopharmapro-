import { site } from '@/lib/site';
import { createGeniusPayPayment, geniusPayConfigured, getGeniusPayPayment } from '@/lib/geniuspay';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    amount?: number;
    phone?: string;
    name?: string;
    email?: string;
    returnUrl?: string;
    label?: string;
  };
  const amount = Math.round(Number(body.amount) || 0);
  if (amount < 200) {
    return Response.json({ error: 'Montant invalide (minimum 200 XOF).' }, { status: 400 });
  }

  if (!geniusPayConfigured()) {
    return Response.json({ demo: true });
  }

  const origin = req.headers.get('origin') || site.url;
  const returnUrl = String(body.returnUrl || '').trim();
  const success =
    `${origin}/pay/geniuspay/success?return=${encodeURIComponent(returnUrl || origin)}`;
  const errorUrl = `${origin}/pay/geniuspay/cancel`;

  try {
    const session = await createGeniusPayPayment({
      amount,
      phone: body.phone,
      name: body.name,
      email: body.email,
      description: body.label || 'Commande Go Pharma Pro',
      successUrl: success,
      errorUrl,
    });
    return Response.json({
      demo: false,
      id: session.reference,
      reference: session.reference,
      url: session.checkoutUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'geniuspay';
    return Response.json({ demo: true, error: message });
  }
}

export async function GET(req: Request) {
  const reference = new URL(req.url).searchParams.get('reference') || new URL(req.url).searchParams.get('id') || '';
  if (!geniusPayConfigured() || !reference) {
    return Response.json({ paid: false, demo: true });
  }
  try {
    const payment = await getGeniusPayPayment(reference);
    return Response.json({
      paid: payment.status === 'completed',
      status: payment.status,
      reference: payment.reference,
      demo: false,
    });
  } catch {
    return Response.json({ paid: false, demo: true });
  }
}
