'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isClient } from '@/lib/accounts';
import { useShop } from '@/components/ShopProvider';

export function ClientCartBadge() {
  const { session } = useShop();
  const path = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isClient(session)) return;
    fetch('/api/v1/client/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: session.id, country: session.country, city: session.city, address: session.address }),
    })
      .then(() => fetch('/api/v1/cart'))
      .then((r) => r.json())
      .then((data: { cart?: { itemCount?: number } }) => setCount(data.cart?.itemCount || 0))
      .catch(() => setCount(0));
  }, [session, path]);

  return (
    <Link
      href="/dashboard/client/cart"
      aria-label={count ? `Panier, ${count} article(s)` : 'Panier'}
      className="relative flex h-9 items-center gap-2 rounded-2xl bg-white/10 px-2 text-brand hover:bg-white/15 sm:h-10 sm:px-2.5"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 8h15l-1.4 8.4a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5 5H2"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1.4" fill="currentColor" />
        <circle cx="18" cy="20" r="1.4" fill="currentColor" />
      </svg>
      {count ? (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-extrabold text-black">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  );
}
