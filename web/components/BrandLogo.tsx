const sizes = {
  sm: 'h-9 w-auto',
  md: 'h-12 w-auto sm:h-[52px]',
  lg: 'h-16 w-auto sm:h-20',
};

export function BrandLogo({
  size = 'md',
  framed = false,
  mark = false,
  priority = false,
}: {
  size?: keyof typeof sizes;
  framed?: boolean;
  mark?: boolean;
  priority?: boolean;
}) {
  const img = (
    <span className={mark ? 'relative inline-flex' : 'logo-pharma relative inline-flex items-center'}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mark ? '/brand/mark.png?v=5' : '/brand/logo.png?v=3'}
        alt="Gopharmapro"
        className={mark ? 'h-10 w-10 rounded-xl object-cover' : sizes[size]}
        {...(priority ? { fetchPriority: 'high' as const } : {})}
      />
      {mark ? null : <span className="logo-pharma-glow" aria-hidden="true" />}
    </span>
  );
  if (framed) {
    return <span className="inline-flex items-center overflow-hidden rounded-2xl bg-black px-2 py-1.5">{img}</span>;
  }
  return img;
}
