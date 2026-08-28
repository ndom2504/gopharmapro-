import { site } from '@/lib/site';
import { stripeClient } from '@/lib/stripe';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    pharmacyId?: string;
    pharmacyName?: string;
  };
  const origin = req.headers.get('origin') || site.url;
  const client = await stripeClient();
  if (!client) {
    return Response.json({ demo: true });
  }

  try {
    const session = await client.identity.verificationSessions.create({
      type: 'document',
      provided_details: body.email ? { email: body.email } : undefined,
      metadata: {
        pharmacyId: body.pharmacyId || '',
        pharmacyName: body.pharmacyName || '',
        source: 'gopharmapro-pharmacy',
      },
      return_url: `${origin}/espace-pharmacie/identite`,
      options: {
        document: {
          allowed_types: ['passport', 'id_card', 'driving_license'],
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
    });
    return Response.json({
      demo: false,
      id: session.id,
      url: session.url,
      status: session.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'identity';
    return Response.json({ demo: true, error: message });
  }
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') || '';
  const client = await stripeClient();
  if (!client || !id) return Response.json({ status: 'unverified', demo: true });
  try {
    const session = await client.identity.verificationSessions.retrieve(id);
    return Response.json({
      demo: false,
      id: session.id,
      status: session.status,
    });
  } catch {
    return Response.json({ status: 'unverified', demo: true });
  }
}
