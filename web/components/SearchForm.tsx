function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
      <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function SearchForm({ defaultValue = '', compact = false }: { defaultValue?: string; compact?: boolean }) {
  return (
    <form action="/produits" className={`relative ${compact ? '' : 'max-w-xl'}`}>
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted">
        <SearchIcon />
      </span>
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Médicament, vitamine, pharmacie…"
        className="h-14 w-full rounded-2xl border border-border bg-white pr-14 pl-12 text-[15px] text-ink outline-none placeholder:text-muted focus:border-brand"
        aria-label="Rechercher un médicament ou produit"
      />
      <button
        type="submit"
        aria-label="Rechercher"
        className="btn-primary absolute top-1.5 right-1.5 !h-11 !w-11 !px-0"
      >
        <SearchIcon />
      </button>
    </form>
  );
}
