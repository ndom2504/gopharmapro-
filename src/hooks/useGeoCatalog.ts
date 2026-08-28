import { useEffect, useMemo } from 'react';
import { pharmacies, products } from '../data/mock';
import { locatePharmacies, locateProducts } from '../lib/geo';
import { useLocation } from '../store/location';

export function useGeoCatalog() {
  const status = useLocation((s) => s.status);
  const coords = useLocation((s) => s.coords);
  const address = useLocation((s) => s.address);
  const outsideGabon = useLocation((s) => s.outsideGabon);
  const refresh = useLocation((s) => s.refresh);

  useEffect(() => {
    if (status === 'idle') refresh();
  }, [status, refresh]);

  const nearbyPharmacies = useMemo(() => locatePharmacies(pharmacies, coords), [coords]);
  const locatedProducts = useMemo(() => locateProducts(products, coords), [coords]);

  return { status, coords, address, outsideGabon, refresh, nearbyPharmacies, locatedProducts };
}
