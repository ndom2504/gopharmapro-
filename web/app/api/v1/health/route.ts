import { hasDatabase } from '@/lib/db';
import { site } from '@/lib/site';

export function GET() {
  return Response.json({
    ok: true,
    service: 'gopharmapro',
    site: site.url,
    database: hasDatabase() ? 'neon' : 'catalog-local',
  });
}
