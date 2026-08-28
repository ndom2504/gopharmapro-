import { stripeClient } from '@/lib/stripe';

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const client = await stripeClient();
  if (!client || !secret) {
    return Response.json({ received: true, demo: true });
  }
  const raw = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  try {
    const event = client.webhooks.constructEvent(raw, sig, secret);
    if (
      event.type === 'identity.verification_session.verified' ||
      event.type === 'identity.verification_session.requires_input' ||
      event.type === 'identity.verification_session.canceled'
    ) {
      const session = event.data.object as { id?: string; status?: string; metadata?: { pharmacyId?: string } };
      return Response.json({
        received: true,
        id: session.id,
        status: session.status,
        pharmacyId: session.metadata?.pharmacyId,
      });
    }
    return Response.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'webhook';
    return Response.json({ error: message }, { status: 400 });
  }
}
