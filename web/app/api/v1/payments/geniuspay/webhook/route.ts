import { verifyGeniusPaySignature } from '@/lib/geniuspay';

export async function POST(req: Request) {
  const raw = await req.text();
  const timestamp = req.headers.get('x-webhook-timestamp') || '';
  const signature = req.headers.get('x-webhook-signature') || '';
  const event = req.headers.get('x-webhook-event') || '';

  if (process.env.GENIUSPAY_WEBHOOK_SECRET?.trim() && !verifyGeniusPaySignature(raw, timestamp, signature)) {
    return Response.json({ status: 401, detail: 'Invalid signature' }, { status: 401 });
  }

  let payload: { event?: string; data?: { reference?: string; status?: string } } = {};
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    return Response.json({ status: 400, detail: 'Invalid JSON' }, { status: 400 });
  }

  const kind = event || payload.event || '';
  if (kind === 'payment.success' || payload.data?.status === 'completed') {
    // Prototype : la commande est confirmée côté client après le checkout.
    // Le webhook valide que GeniusPay a bien encaissé (Bénin, XOF).
  }

  return Response.json({ received: true });
}
