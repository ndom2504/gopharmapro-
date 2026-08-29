import { serviceZoneAnd, serviceZoneShort } from '@/lib/places';

export const metadata = { title: 'Configuration' };
export const dynamic = 'force-dynamic';

export default function AdminConfigPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Configuration</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
        Paramètres du prototype : zones {serviceZoneAnd()}, codes de livraison à 6 chiffres, paiement bloqué tant qu’une
        ordonnance n’est pas validée.
      </p>
      <div className="mt-8 space-y-3">
        <Row label="Zones" value={serviceZoneShort()} />
        <Row label="Frais de livraison démo" value="1 000 – 2 000 FCFA" />
        <Row label="Code de confirmation" value="6 chiffres" />
        <Row label="Paiement ordonnance" value="Bloqué jusqu’à validation pharmacie" />
        <Row label="Encaissement" value="Go Pharma Pro, puis virement officine / livreur" />
        <Row label="Paiement Bénin" value="GeniusPay · MTN MoMo / Moov Money · XOF" />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="card flex items-start justify-between gap-4 p-5">
      <p className="font-extrabold text-ink">{label}</p>
      <p className="text-right text-sm font-semibold text-muted">{value}</p>
    </div>
  );
}
