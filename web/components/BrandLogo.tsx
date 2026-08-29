const sizes = {
  sm: 'h-10 w-auto max-w-[min(70vw,280px)] sm:h-12 sm:max-w-[320px]',
  md: 'h-12 w-auto max-w-[min(72vw,360px)] sm:h-14 sm:max-w-[420px]',
  lg: 'h-16 w-auto max-w-[min(88vw,400px)] sm:h-20 sm:max-w-[480px]',
};

const markSizes = {
  sm: 'h-8 w-8 rounded-lg object-cover',
  md: 'h-10 w-10 rounded-xl object-cover',
  lg: 'h-24 w-24 rounded-full border border-border bg-white object-cover',
};

export function BrandLogo({
  size = 'md',
  framed = false,
  mark = false,
  priority = false,
  className = '',
}: {
  size?: keyof typeof sizes;
  mark?: boolean;
  framed?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const img = (
    <span className="relative inline-flex min-w-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mark ? '/brand/mark.png?v=6' : '/brand/logo.png?v=9'}
        alt="Gopharmapro"
        className={
          mark ? `${markSizes[size]} ${className}` : `${sizes[size]} object-contain object-left ${className}`
        }
        {...(priority ? { fetchPriority: 'high' as const } : {})}
      />
    </span>
  );
  if (framed) {
    return <span className="inline-flex items-center overflow-hidden rounded-2xl bg-black px-2 py-1.5">{img}</span>;
  }
  return img;
}
