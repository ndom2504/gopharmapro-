import { categories } from '@/lib/catalog';

export function PhonePreview() {
  return (
    <div className="mx-auto w-[280px] rounded-[2.2rem] border-[10px] border-[#17221E] bg-[#F6F8F7] p-3 shadow-2xl">
      <div className="mx-auto mb-3 h-5 w-20 rounded-full bg-[#17221E]" />
      <p className="text-sm text-muted">Bonjour 👋</p>
      <p className="mt-1 text-xl font-extrabold text-ink">Que recherchez-vous ?</p>
      <div className="mt-4 h-12 rounded-2xl border border-border bg-white" />
      <p className="mt-5 text-sm font-extrabold text-ink">Catégories</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {categories.slice(0, 6).map((c) => (
          <div key={c.name} className="rounded-2xl bg-white p-2 text-center">
            <div className="text-lg">{c.icon}</div>
            <p className="mt-1 text-[10px] font-bold leading-tight text-ink">{c.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
