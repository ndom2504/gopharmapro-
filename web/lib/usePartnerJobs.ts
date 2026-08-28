'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { partnerOrders, type PartnerOrder } from '@/lib/accounts';

const KEY = 'gpp-jobs-v1';
const AVAIL_KEY = 'gpp-courier-available';

type Overlay = {
  courierId: Record<string, string | null>;
  status: Record<string, PartnerOrder['status']>;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function usePartnerJobs() {
  const [overlay, setOverlay] = useState<Overlay>({ courierId: {}, status: {} });
  const [available, setAvailableState] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOverlay(read<Overlay>(KEY, { courierId: {}, status: {} }));
    setAvailableState(read<boolean>(AVAIL_KEY, true));
    setReady(true);
  }, []);

  const persist = useCallback((next: Overlay) => {
    setOverlay(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const jobs = useMemo<PartnerOrder[]>(
    () =>
      partnerOrders.map((o) => ({
        ...o,
        courierId: o.id in overlay.courierId ? overlay.courierId[o.id] || undefined : o.courierId,
        status: overlay.status[o.id] || o.status,
      })),
    [overlay],
  );

  const accept = (id: string, courierId: string) => {
    persist({
      courierId: { ...overlay.courierId, [id]: courierId },
      status: { ...overlay.status, [id]: 'accepted' },
    });
  };

  const setStatus = (id: string, status: PartnerOrder['status']) => {
    persist({ ...overlay, status: { ...overlay.status, [id]: status } });
  };

  const setAvailable = (value: boolean) => {
    setAvailableState(value);
    localStorage.setItem(AVAIL_KEY, JSON.stringify(value));
  };

  return { ready, jobs, available, setAvailable, accept, setStatus };
}
