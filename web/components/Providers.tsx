'use client';

import { ShopProvider } from '@/components/ShopProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ShopProvider>{children}</ShopProvider>;
}
