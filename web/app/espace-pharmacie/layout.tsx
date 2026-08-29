import type { ReactNode } from 'react';

export default function PharmacySpaceLayout({ children }: { children: ReactNode }) {
  return <div className="w-full min-w-0 max-w-[100vw] overflow-x-hidden">{children}</div>;
}
