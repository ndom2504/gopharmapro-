import Link from 'next/link';

export function ProductPhoto({
  src,
  alt,
  size = 'card',
}: {
  src?: string;
  alt: string;
  size?: 'thumb' | 'card' | 'hero';
}) {
  const box =
    size === 'thumb'
      ? 'relative h-20 w-20 shrink-0 rounded-2xl'
      : size === 'hero'
        ? 'relative aspect-square w-full max-h-[min(420px,70vw)] rounded-[18px]'
        : 'relative aspect-square w-full rounded-t-[18px]';
  return (
    <div className={`overflow-hidden bg-[#F3F7F4] ${box}`}>
      {src ? (
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover object-center" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-2xl">💊</span>
      )}
    </div>
  );
}

export function CategoryPhoto({ src, alt }: { src: string; alt: string; compact?: boolean }) {
  return (
    <span className="relative block aspect-square w-full overflow-hidden bg-[#F3F7F4]">
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover object-center" />
    </span>
  );
}

export function CategoryTile({
  href,
  src,
  name,
  icon,
}: {
  href: string;
  src?: string;
  name: string;
  icon?: string;
}) {
  return (
    <Link href={href} className="card flex min-w-0 flex-col overflow-hidden p-0">
      <span className="relative block aspect-square w-full overflow-hidden bg-[#F3F7F4]">
        {src ? (
          <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-3xl">{icon}</span>
        )}
      </span>
      <span className="bg-mint px-2 py-1.5 text-center text-[12px] leading-snug font-extrabold text-ink">
        {name}
      </span>
    </Link>
  );
}
