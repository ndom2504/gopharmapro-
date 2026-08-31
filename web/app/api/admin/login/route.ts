import { NextResponse } from 'next/server';
import { credentialsOk, setAdminCookie } from '@/lib/adminAuth';
import { adminConfigured, loadRootEnv } from '@/lib/loadRootEnv';

export async function POST(req: Request) {
  loadRootEnv();
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: 'Configuration admin introuvable. Vérifiez ADMIN_EMAIL et ADMIN_PASSWORD.' },
      { status: 503 },
    );
  }
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = String(body.email || '');
  const password = String(body.password || '');
  if (!credentialsOk(email, password)) {
    return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
