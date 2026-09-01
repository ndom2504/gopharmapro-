import { NextResponse } from 'next/server';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { readClientAccountId, requireClientProfile, setClientCookie, upsertClientProfile } from '@/lib/client/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!(await readClientAccountId())) return unauthorized();
    const profile = await requireClientProfile();
    return NextResponse.json({
      profile: {
        id: profile.id,
        accountId: profile.accountId,
        city: profile.city,
        address: profile.address,
        country: { id: profile.country.id, code: profile.country.code, name: profile.country.name },
      },
    });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      accountId?: string;
      email?: string;
      country?: string;
      city?: string;
      address?: string;
    };
    const accountId = String(body.accountId || '').trim();
    if (!accountId) throw new CatalogError(400, 'accountId requis.');
    const profile = await upsertClientProfile({
      accountId,
      country: body.country,
      city: body.city,
      address: body.address,
    });
    await setClientCookie(accountId);
    return NextResponse.json({
      ok: true,
      profile: {
        id: profile.id,
        accountId: profile.accountId,
        city: profile.city,
        address: profile.address,
        country: { id: profile.country.id, code: profile.country.code, name: profile.country.name },
      },
    });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
