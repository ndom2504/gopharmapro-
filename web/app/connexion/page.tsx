'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { displayName, homeFor, type UserRole } from '@/lib/accounts';

const roles: { id: UserRole; label: string }[] = [
  { id: 'client', label: 'Client' },
  { id: 'pharmacy', label: 'Pharmacie' },
  { id: 'courier', label: 'Livreur' },
];

const hints: Record<UserRole, { placeholder: string; hint: string; meta: string }> = {
  client: {
    placeholder: '77 00 00 00',
    hint: 'Démo : demo123 — 77 00 00 00 ou awa@pharmamarket.ga',
    meta: 'Suivez vos commandes et payez comme dans l’application.',
  },
  pharmacy: {
    placeholder: 'centre@pharma.ga',
    hint: 'Démo vérifiée : demo123 — centre@pharma.ga · En attente : palmiers@pharma.ga',
    meta: 'Gérez le catalogue, les commandes et les virements de l’officine.',
  },
  courier: {
    placeholder: '66 00 00 00',
    hint: 'Démo : demo123 — 66 00 00 00 ou livreur@gopharmapro.com',
    meta: 'Consultez vos courses, le code de ramassage et vos gains.',
  },
};

function parseRole(value: string | null): UserRole {
  if (value === 'pharmacy' || value === 'courier' || value === 'client') return value;
  return 'client';
}

function ConnexionInner() {
  const { login, register, registerPharmacy, registerCourier, session, logout } = useShop();
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState<UserRole>(parseRole(params.get('role')));
  const [mode, setMode] = useState<'login' | 'register'>(params.get('mode') === 'register' ? 'register' : 'login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacistName, setPharmacistName] = useState('');
  const [professionalNumber, setProfessionalNumber] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Libreville');
  const [vehicle, setVehicle] = useState('moto');
  const [plate, setPlate] = useState('');
  const [error, setError] = useState('');
  const copy = hints[tab];
  const next = params.get('next');

  const destination = useMemo(() => {
    if (tab !== 'client') return homeFor(tab);
    if (next && next.startsWith('/') && !next.startsWith('//')) return next;
    return homeFor('client');
  }, [tab, next]);

  const go = (path: string) => {
    router.replace(path);
    router.refresh();
  };

  if (session) {
        const href = session.role === 'client' ? '/commandes' : homeFor(session.role);
        return (
          <main className="mx-auto max-w-md px-4 py-16">
            <p className="text-sm font-extrabold text-brand">
              {session.role === 'pharmacy' ? 'Espace pharmacie' : session.role === 'courier' ? 'Espace livreur' : 'Espace client'}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink">Bonjour {displayName(session)}</h1>
            <p className="mt-2 text-sm text-muted">{session.email}</p>
            <div className="mt-8 flex flex-col gap-3">
              <Link href={href} className="btn-primary">
                {session.role === 'client' ? 'Mes commandes' : 'Ouvrir mon espace'}
              </Link>
          {session.role === 'client' ? (
            <Link href="/produits" className="btn-secondary">
              Continuer mes achats
            </Link>
          ) : null}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              logout();
              go('/');
            }}
          >
            Se déconnecter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold text-ink">Connexion</h1>
      <p className="mt-2 text-sm leading-6 text-muted">{copy.meta}</p>
      <div className="mt-6 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-white p-1">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => {
              setTab(r.id);
              setError('');
              setMode('login');
            }}
            className={`h-10 rounded-xl text-xs font-extrabold ${tab === r.id ? 'bg-brand text-white' : 'text-muted'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          if (mode === 'login') {
            if (login(identifier, password, tab) !== 'ok') {
              setError('Identifiants incorrects pour ce type de compte.');
              return;
            }
            go(destination);
            return;
          }
          if (tab === 'client') {
            if (!firstName || !lastName || !email || !phone || password.length < 4) {
              setError('Complétez tous les champs.');
              return;
            }
            if (register({ firstName, lastName, email, phone, password }) !== 'ok') {
              setError('Un compte client existe déjà avec cet e-mail ou ce téléphone.');
              return;
            }
            go(destination);
            return;
          }
          if (tab === 'pharmacy') {
            if (!pharmacyName || !pharmacistName || !email || !phone || password.length < 4 || !address) {
              setError('Complétez les informations de l’officine.');
              return;
            }
            if (
              registerPharmacy({
                pharmacyName,
                pharmacistName,
                professionalNumber,
                email,
                phone,
                password,
                address,
                area,
                city,
              }) !== 'ok'
            ) {
              setError('Une pharmacie existe déjà avec cet e-mail ou ce téléphone.');
              return;
            }
            go(homeFor('pharmacy'));
            return;
          }
          if (!firstName || !lastName || !email || !phone || password.length < 4) {
            setError('Complétez tous les champs.');
            return;
          }
          if (registerCourier({ firstName, lastName, email, phone, password, vehicle, plate, city }) !== 'ok') {
            setError('Un livreur existe déjà avec cet e-mail ou ce téléphone.');
            return;
          }
          go(homeFor('courier'));
        }}
      >
        {mode === 'register' && tab === 'client' ? (
          <>
            <Field label="Prénom" value={firstName} onChange={setFirstName} />
            <Field label="Nom" value={lastName} onChange={setLastName} />
            <Field label="E-mail" value={email} onChange={setEmail} />
            <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="77 00 00 00" />
          </>
        ) : null}
        {mode === 'register' && tab === 'pharmacy' ? (
          <>
            <Field label="Nom de l’officine" value={pharmacyName} onChange={setPharmacyName} />
            <Field label="Pharmacien responsable" value={pharmacistName} onChange={setPharmacistName} />
            <Field label="N° professionnel" value={professionalNumber} onChange={setProfessionalNumber} placeholder="ONPG-…" />
            <Field label="E-mail" value={email} onChange={setEmail} />
            <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="77 11 22 33" />
            <Field label="Adresse" value={address} onChange={setAddress} />
            <Field label="Quartier" value={area} onChange={setArea} />
            <Field label="Ville" value={city} onChange={setCity} />
          </>
        ) : null}
        {mode === 'register' && tab === 'courier' ? (
          <>
            <Field label="Prénom" value={firstName} onChange={setFirstName} />
            <Field label="Nom" value={lastName} onChange={setLastName} />
            <Field label="E-mail" value={email} onChange={setEmail} />
            <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="66 00 00 00" />
            <label className="block">
              <span className="text-sm font-extrabold text-ink">Véhicule</span>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="mt-1 h-12 w-full rounded-2xl border border-border bg-white px-4 font-semibold text-ink outline-none focus:border-brand"
              >
                <option value="moto">Moto</option>
                <option value="voiture">Voiture</option>
                <option value="other">Autre</option>
              </select>
            </label>
            <Field label="Immatriculation" value={plate} onChange={setPlate} placeholder="LBV-204-GA" />
            <Field label="Ville" value={city} onChange={setCity} />
          </>
        ) : null}
        {mode === 'login' ? (
          <Field label="Téléphone ou e-mail" value={identifier} onChange={setIdentifier} placeholder={copy.placeholder} />
        ) : null}
        <Field label="Mot de passe" value={password} onChange={setPassword} type="password" />
        {error ? <p className="text-sm font-bold text-danger">{error}</p> : <p className="text-xs text-muted">{copy.hint}</p>}
        <button type="submit" className="btn-primary w-full">
          {mode === 'login' ? 'Se connecter' : tab === 'pharmacy' ? 'Créer l’espace pharmacie' : tab === 'courier' ? 'Créer l’espace livreur' : 'Créer mon compte'}
        </button>
        <button
          type="button"
          className="w-full text-sm font-extrabold text-brand"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login'
            ? tab === 'pharmacy'
              ? 'Inscrire mon officine'
              : tab === 'courier'
                ? 'Devenir livreur'
                : 'Créer un compte client'
            : 'J’ai déjà un compte'}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold text-ink">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="mt-1 h-12 w-full rounded-2xl border border-border bg-white px-4 font-semibold text-ink outline-none focus:border-brand"
      />
    </label>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionInner />
    </Suspense>
  );
}
