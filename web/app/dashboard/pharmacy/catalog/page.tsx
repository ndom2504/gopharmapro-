'use client';

import { RequireRole } from '@/components/RequireRole';
import { PharmacyCatalog } from '@/components/PharmacyCatalog';

export default function PharmacyDashboardCatalogPage() {
  return (
    <RequireRole role="pharmacy">
      <PharmacyCatalog />
    </RequireRole>
  );
}
