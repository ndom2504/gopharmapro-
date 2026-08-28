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
      ? 'h-20 w-20 shrink-0 rounded-2xl p-1.5'
      : size === 'hero'
        ? 'aspect-[4/3] w-full max-h-[min(420px,55vh)] rounded-[18px] p-4'
        : 'aspect-[4/3] w-full rounded-t-[18px] p-3';
  return (
    <div className={`flex items-center justify-center overflow-hidden bg-mint ${box}`}>
      {src ? <img src={src} alt={alt} className="max-h-full max-w-full object-contain" /> : <span className="text-2xl">💊</span>}
    </div>
  );
}

export function CategoryPhoto({ src, alt, compact = false }: { src: string; alt: string; compact?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-mint ${
        compact ? 'h-14 p-1.5' : 'aspect-[4/3] p-3'
      }`}
    >
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
    </div>
  );
}
