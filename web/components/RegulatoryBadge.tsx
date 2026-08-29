import { regulatoryLabel, type RegulatoryStatus } from '@/lib/taxonomy';

export function RegulatoryBadge({
  status,
  requiresPrescription,
}: {
  status?: RegulatoryStatus;
  requiresPrescription?: boolean;
}) {
  const id = status || (requiresPrescription ? 'rx' : 'otc');
  const label = regulatoryLabel(id);
  if (id === 'rx') return <span className="badge-red">{label}</span>;
  if (id === 'controlled') return <span className="badge-orange">{label}</span>;
  return (
    <span className="rounded-full border border-border bg-[#F6F8F7] px-2.5 py-1 text-xs font-extrabold text-ink">
      {label}
    </span>
  );
}
