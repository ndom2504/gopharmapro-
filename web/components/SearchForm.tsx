export function SearchForm({ defaultValue = '', compact = false }: { defaultValue?: string; compact?: boolean }) {
  return (
    <form action="/produits" className={`relative ${compact ? '' : 'max-w-xl'}`}>
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Rechercher un médicament ou produit..."
        className="h-14 w-full rounded-2xl border border-border bg-white pr-32 pl-4 text-[15px] text-ink outline-none placeholder:text-muted focus:border-brand"
      />
      <button type="submit" className="btn-primary absolute top-1.5 right-1.5 !h-11">
        Rechercher
      </button>
    </form>
  );
}
