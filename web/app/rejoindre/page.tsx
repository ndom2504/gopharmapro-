import Link from 'next/link';
import { site } from '@/lib/site';

const steps = [
  { n: '1', title: 'Identité de l’officine', text: 'Nom, type de structure et informations légales.' },
  { n: '2', title: 'Pharmacien responsable', text: 'Titulaire, gérant ou responsable, avec numéro professionnel.' },
  { n: '3', title: 'Localisation', text: 'Province, ville, commune, quartier et GPS confirmé.' },
  { n: '4', title: 'Horaires et services', text: 'Ouverture, livraison, rayon et frais.' },
  { n: '5', title: 'Identité Stripe', text: 'Le pharmacien responsable confirme sa pièce d’identité et un selfie via Stripe Identity.' },
  { n: '6', title: 'Compte de connexion', text: 'E-mail, mot de passe et conditions.' },
];

export const metadata = { title: 'Espace pharmacie' };

export default function JoinPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="inline-flex rounded-full bg-mint px-3 py-1 text-sm font-bold text-brand-dark">
        Partenaires
      </p>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">Inscrivez votre pharmacie</h1>
      <p className="mt-3 leading-7 text-muted">
        Même parcours que l’application {site.name} : six étapes, puis une vérification du dossier. L’officine n’apparaît
        sur la marketplace qu’une fois le compte validé.
      </p>
      <div className="mt-8 grid gap-3">
        {steps.map((s) => (
          <div key={s.n} className="card flex gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mint font-extrabold text-brand">
              {s.n}
            </span>
            <div>
              <p className="font-extrabold text-ink">{s.title}</p>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/connexion?role=pharmacy&mode=register" className="btn-primary">
          Créer l’espace pharmacie
        </Link>
        <Link href="/connexion?role=pharmacy" className="btn-secondary">
          J’ai déjà un compte
        </Link>
      </div>
      <p className="mt-8 text-sm leading-6 text-muted">
        Vous livrez pour {site.name} ?{' '}
        <Link href="/connexion?role=courier&mode=register" className="font-extrabold text-brand">
          Devenir livreur
        </Link>
      </p>
    </main>
  );
}
