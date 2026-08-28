import { site } from '@/lib/site';

async function stripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) return null;
  const { default: Stripe } = await import('stripe');
  return new Stripe(secret);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    amount?: number;
    returnUrl?: string;
    label?: string;
  };
  const amount = Math.round(Number(body.amount) || 0);
  if (amount < 100) {
    return Response.json({ error: 'Montant invalide' }, { status: 400 });
  }

  const client = await stripeClient();
  if (!client) {
    return Response.json({ demo: true });
  }

  const origin = req.headers.get('origin') || site.url;
  const returnUrl = String(body.returnUrl || '').trim();
  const success =
    `${origin}/pay/stripe/success?session_id={CHECKOUT_SESSION_ID}` +
    (returnUrl ? `&return=${encodeURIComponent(returnUrl)}` : '');

  try {
    const session = await client.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'xaf',
            unit_amount: amount,
            product_data: { name: body.label || 'Commande Go Pharma Pro' },
          },
        },
      ],
      success_url: success,
      cancel_url: `${origin}/pay/stripe/cancel`,
      metadata: { source: 'gopharmapro-mobile' },
    });
    return Response.json({ id: session.id, url: session.url, demo: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'stripe';
    return Response.json({ demo: true, error: message });
  }
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') || '';
  const client = await stripeClient();
  if (!client || !id) return Response.json({ paid: false, demo: true });
  try {
    const session = await client.checkout.sessions.retrieve(id);
    return Response.json({
      paid: session.payment_status === 'paid',
      id: session.id,
      demo: false,
    });
  } catch {
    return Response.json({ paid: false, demo: true });
  }
}
