'use client';

import Image from 'next/image';
import { useState } from 'react';

const sizes = {
  thumb: 'h-20 w-20',
  card: 'h-24 w-24',
  hero: 'aspect-square w-full max-h-[min(420px,70vw)]',
} as const;

function Placeholder({ alt, className }: { alt: string; className: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl bg-[#E8F1EA] text-brand-dark ${className}`}
      role="img"
      aria-label={alt}
    >
      <span className="text-lg font-extrabold leading-none">G</span>
      <span className="mt-0.5 px-1 text-center text-[9px] font-extrabold leading-tight">GoPharmaPro</span>
    </div>
  );
}

export function CatalogProductImage({
  src,
  alt,
  size = 'thumb',
  priority = false,
}: {
  src?: string | null;
  alt: string;
  size?: keyof typeof sizes;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const label = alt.trim() || 'Produit';
  const box = `relative shrink-0 overflow-hidden rounded-2xl bg-[#F3F7F4] ${sizes[size]}`;
  if (!src || failed) return <Placeholder alt={label} className={`${sizes[size]} shrink-0`} />;
  const remote = src.startsWith('https://') || src.startsWith('http://');
  return (
    <div className={box}>
      {remote ? (
        <Image
          src={src}
          alt={label}
          fill
          sizes={size === 'hero' ? '80vw' : '80px'}
          className="object-contain p-1"
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setFailed(true)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="h-full w-full object-contain p-1" onError={() => setFailed(true)} />
      )}
    </div>
  );
}
