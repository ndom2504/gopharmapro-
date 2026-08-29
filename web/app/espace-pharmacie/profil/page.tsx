'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/FormField';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy } from '@/lib/accounts';
import { IdentityVerify } from '@/components/IdentityVerify';

export default function PharmacyProfilePage() {
  const { session, logout, updateAccount } = useShop();
  const router = useRouter();
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacistName, setPharmacistName] = useState('');
  const [professionalNumber, setProfessionalNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    if (!isPharmacy(session)) return;
    setPharmacyName(session.pharmacyName);
    setPharmacistName(session.pharmacistName);
    setProfessionalNumber(session.professionalNumber);
    setPhone(session.phone);
    setEmail(session.email);
    setAddress(session.address);
    setArea(session.area);
    setCity(session.city);
  }, [session]);

  if (!isPharmacy(session)) {
    return (
      <RequireRole role="pharmacy">
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

  const manager =
    session.managerRole === 'titulaire' ? 'Pharmacien titulaire' : session.managerRole === 'gerant' ? 'Gérant' : 'Responsable';
  const pendingDocs = session.documents.filter((d) => d.fileName && d.status === 'pending').length;

  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <RoleSubnav items={pharmacyNav} />
        <h1 className="text-3xl font-extrabold text-ink">Profil</h1>
        {saved ? <p className="mt-3 text-sm font-extrabold text-brand">{saved}</p> : null}
        {error ? <p className="mt-3 text-sm font-extrabold text-danger">{error}</p> : null}

        <form
          className="card mt-6 space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            apply({ pharmacyName, pharmacistName, professionalNumber, phone, email, address, area, city, commune: city });
          }}
        >
          <p className="text-sm font-extrabold text-ink">Officine</p>
          <FormField label="Nom de la pharmacie" value={pharmacyName} onChange={setPharmacyName} />
          <FormField label="Pharmacien responsable" value={pharmacistName} onChange={setPharmacistName} />
          <FormField label="Numéro professionnel" value={professionalNumber} onChange={setProfessionalNumber} />
          <p className="text-sm text-muted">{manager}</p>
          <FormField label="Téléphone" value={phone} onChange={setPhone} />
          <FormField label="E-mail" value={email} onChange={setEmail} type="email" />
          <FormField label="Adresse" value={address} onChange={setAddress} />
          <FormField label="Quartier" value={area} onChange={setArea} />
          <FormField label="Ville" value={city} onChange={setCity} />
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

        {session.documents.length ? (
          <section className="card mt-4 p-5">
            <p className="text-sm font-extrabold text-ink">Documents</p>
            <p className="mt-1 text-sm text-muted">{pendingDocs} document(s) en attente.</p>
            <ul className="mt-3 space-y-2">
              {session.documents
                .filter((d) => d.fileName)
                .map((d) => (
                  <li key={d.key} className="text-sm font-semibold text-ink">
                    {d.status === 'verified' ? '🟢' : d.status === 'rejected' ? '🔴' : '🟠'} {d.label}
                  </li>
                ))}
            </ul>
          </section>
        ) : null}
        <IdentityVerify />
        <button
          type="button"
          className="btn-secondary mt-8 w-full"
          onClick={() => {
            logout();
            router.replace('/connexion?role=pharmacy');
          }}
        >
          Déconnexion
        </button>
      </main>
    </RequireRole>
  );
}
