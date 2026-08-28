'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/FormField';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, courierNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isCourier } from '@/lib/accounts';

const vehicleLabel: Record<string, string> = { moto: 'Moto', voiture: 'Voiture', other: 'Autre' };

export default function CourierProfilePage() {
  const { session, logout, updateAccount } = useShop();
  const router = useRouter();
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [vehicle, setVehicle] = useState('moto');
  const [plate, setPlate] = useState('');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!isCourier(session)) return;
    setFirstName(session.firstName);
    setLastName(session.lastName);
    setPhone(session.phone);
    setEmail(session.email);
    setArea(session.area);
    setCity(session.city);
    setVehicle(session.vehicle);
    setPlate(session.plate);
    setPayoutPhone(session.payoutPhone || session.phone);
  }, [session]);

  if (!isCourier(session)) {
    return (
      <RequireRole role="courier">
        <div />
      </RequireRole>
    );
  }

  const apply = (patch: Parameters<typeof updateAccount>[0], ok = 'Profil enregistré.') => {
    setError('');
    const result = updateAccount(patch);
    if (result === 'exists') {
      setSaved('');
      setError('Cet e-mail ou ce téléphone est déjà utilisé.');
      return;
    }
    if (result !== 'ok') {
      setSaved('');
      setError('Vérifiez le mot de passe actuel.');
      return;
    }
    setSaved(ok);
  };

  const required = session.documents.filter((d) => d.required);
  const verifiedDocs = required.filter((d) => d.status === 'verified').length;

  return (
    <RequireRole role="courier">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={courierNav} />
        <h1 className="text-3xl font-extrabold text-ink">Profil livreur</h1>
        {saved ? <p className="mt-3 text-sm font-extrabold text-brand">{saved}</p> : null}
        {error ? <p className="mt-3 text-sm font-extrabold text-danger">{error}</p> : null}

        <form
          className="card mt-6 space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            apply({ firstName, lastName, phone, email, area, city, vehicle, plate, payoutPhone });
          }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint text-xl font-extrabold text-brand">
            {session.firstName[0]}
            {session.lastName[0]}
          </div>
          <FormField label="Prénom" value={firstName} onChange={setFirstName} />
          <FormField label="Nom" value={lastName} onChange={setLastName} />
          <FormField label="Téléphone" value={phone} onChange={setPhone} />
          <FormField label="E-mail" value={email} onChange={setEmail} type="email" />
          <FormField label="Quartier" value={area} onChange={setArea} />
          <FormField label="Ville" value={city} onChange={setCity} />
          <label className="block">
            <span className="text-sm font-extrabold text-ink">Véhicule</span>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="mt-1 h-12 w-full rounded-2xl border border-border bg-white px-4 font-semibold text-ink outline-none focus:border-brand"
            >
              {Object.entries(vehicleLabel).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <FormField label="Immatriculation" value={plate} onChange={setPlate} />
          <FormField label="Numéro de paiement" value={payoutPhone} onChange={setPayoutPhone} />
          <button type="submit" className="btn-primary w-full">
            Enregistrer le profil
          </button>
        </form>

        <form
          className="card mt-4 space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (password.length < 4) {
              setError('Le nouveau mot de passe doit avoir au moins 4 caractères.');
              setSaved('');
              return;
            }
            apply({ currentPassword, password }, 'Mot de passe mis à jour.');
            setCurrentPassword('');
            setPassword('');
          }}
        >
          <p className="font-extrabold text-ink">Sécurité</p>
          <FormField label="Mot de passe actuel" value={currentPassword} onChange={setCurrentPassword} type="password" />
          <FormField label="Nouveau mot de passe" value={password} onChange={setPassword} type="password" />
          <button type="submit" className="btn-primary w-full">
            Changer le mot de passe
          </button>
        </form>

        <section className="card mt-4 p-5">
          <p className="text-sm font-extrabold text-ink">Documents</p>
          <p className="text-sm text-muted">
            Statut de vérification : {verifiedDocs}/{required.length} validés
          </p>
        </section>

        <button
          type="button"
          className="btn-secondary mt-8 w-full"
          onClick={() => {
            logout();
            router.replace('/connexion?role=courier');
          }}
        >
          Déconnexion
        </button>
      </main>
    </RequireRole>
  );
}
