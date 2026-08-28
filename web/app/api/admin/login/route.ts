import { NextResponse } from 'next/server';
import { credentialsOk, setAdminCookie } from '@/lib/adminAuth';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = String(body.email || '');
  const password = String(body.password || '');
  if (!credentialsOk(email, password)) {
    return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
