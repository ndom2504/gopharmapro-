'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/FormField';
import { useShop } from '@/components/ShopProvider';
import { displayName, homeFor, isClient } from '@/lib/accounts';
import { paymentMethods } from '@/lib/catalog';
import { site } from '@/lib/site';

export default function ComptePage() {
  const { session, logout, ready, updateAccount } = useShop();
  const router = useRouter();
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Libreville');
  const [preferredPayment, setPreferredPayment] = useState('airtel-money');
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyOffers, setNotifyOffers] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!ready) return;
    if (session && !isClient(session)) router.replace(homeFor(session.role));
  }, [ready, session, router]);

  useEffect(() => {
    if (!isClient(session)) return;
    setFirstName(session.firstName);
    setLastName(session.lastName);
    setPhone(session.phone);
    setEmail(session.email);
    setPhoto(session.photoDataUrl || '');
    setAddress(session.address || '');
    setArea(session.area || '');
    setCity(session.city || 'Libreville');
    setPreferredPayment(session.preferredPayment || 'airtel-money');
    setNotifyOrders(session.notifyOrders !== false);
    setNotifyOffers(Boolean(session.notifyOffers));
  }, [session]);

  if (!ready || (session && !isClient(session))) return null;
  if (!session) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">Mon compte</h1>
        <Link href="/connexion?next=/compte" className="btn-primary mt-8 inline-flex">
          Connexion
        </Link>
      </main>
    );
  }

  const apply = (patch: Parameters<typeof updateAccount>[0], ok = 'Enregistré.') => {
    setError('');
    const result = updateAccount(patch);
    if (result === 'exists') {
      setSaved('');
      setError('Cet e-mail ou ce téléphone est déjà utilisé.');
      return;
    }
    if (result !== 'ok') {
      setSaved('');
      setError('Vérifiez les informations, notamment le mot de passe actuel.');
      return;
    }
    setSaved(ok);
  };

  const pickPhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => apply({ photoDataUrl: String(reader.result || '') }, 'Photo mise à jour.');
    reader.readAsDataURL(file);
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Mon compte</h1>
      <p className="mt-2 text-sm text-muted">Modifiez vos informations. Elles sont enregistrées sur cet appareil.</p>
      {saved ? <p className="mt-4 text-sm font-extrabold text-brand">{saved}</p> : null}
      {error ? <p className="mt-4 text-sm font-extrabold text-danger">{error}</p> : null}

      <div className="card mt-6 p-5">
        <div className="flex items-center gap-4">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-lg font-extrabold text-brand">
              {displayName(session)[0]}
              {session.lastName[0]}
            </div>
          )}
          <div>
            <p className="font-extrabold text-ink">
              {session.firstName} {session.lastName}
            </p>
            <p className="text-sm text-muted">{session.phone}</p>
            <p className="text-sm text-muted">{session.email}</p>
          </div>
        </div>
      </div>

      <form
        className="card mt-4 space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ firstName, lastName });
        }}
      >
        <p className="font-extrabold text-ink">Informations personnelles</p>
        <FormField label="Prénom" value={firstName} onChange={setFirstName} />
        <FormField label="Nom" value={lastName} onChange={setLastName} />
        <button type="submit" className="btn-primary w-full">
          Enregistrer
        </button>
      </form>

      <form
        className="card mt-4 space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ phone });
        }}
      >
        <p className="font-extrabold text-ink">Téléphone</p>
        <FormField label="Numéro" value={phone} onChange={setPhone} placeholder="77 00 00 00" />
        <button type="submit" className="btn-primary w-full">
          Enregistrer
        </button>
      </form>

      <form
        className="card mt-4 space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ email });
        }}
      >
        <p className="font-extrabold text-ink">Email</p>
        <FormField label="Adresse e-mail" value={email} onChange={setEmail} type="email" />
        <button type="submit" className="btn-primary w-full">
          Enregistrer
        </button>
      </form>

      <section className="card mt-4 p-5">
        <p className="font-extrabold text-ink">Photo</p>
        <label className="btn-secondary mt-3 inline-flex cursor-pointer">
          Choisir une photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => pickPhoto(e.target.files?.[0])} />
        </label>
        {photo ? (
          <button type="button" className="mt-3 block text-sm font-extrabold text-danger" onClick={() => apply({ photoDataUrl: '' }, 'Photo retirée.')}>
            Retirer la photo
          </button>
        ) : null}
      </section>

      <form
        className="card mt-4 space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ address, area, city });
        }}
      >
        <p className="font-extrabold text-ink">Mes adresses</p>
        <FormField label="Adresse de livraison" value={address} onChange={setAddress} placeholder="Rue, immeuble, repère" />
        <FormField label="Quartier" value={area} onChange={setArea} placeholder="Centre-ville" />
        <FormField label="Ville" value={city} onChange={setCity} />
        <button type="submit" className="btn-primary w-full">
          Enregistrer
        </button>
      </form>

      <div className="mt-4 space-y-2">
        <Link href="/commandes" className="card block p-4 font-extrabold text-ink">
          Mes commandes
        </Link>
        <Link href="/ordonnances" className="card block p-4 font-extrabold text-ink">
          Mes ordonnances
        </Link>
        <Link href="/favoris" className="card block p-4 font-extrabold text-ink">
          Mes favoris
        </Link>
      </div>

      <form
        className="card mt-4 space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ preferredPayment, phone });
        }}
      >
        <p className="font-extrabold text-ink">Moyens de paiement</p>
        <p className="text-sm text-muted">Choisissez le moyen utilisé à la commande. Le numéro ci-dessus sert au mobile money.</p>
        <div className="space-y-2">
          {paymentMethods.map((m) => (
            <label key={m.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 py-3">
              <input
                type="radio"
                name="pay"
                checked={preferredPayment === m.id}
                onChange={() => setPreferredPayment(m.id)}
              />
              <span className="font-extrabold text-ink">{m.name}</span>
            </label>
          ))}
        </div>
        <button type="submit" className="btn-primary w-full">
          Enregistrer
        </button>
      </form>

      <form
        className="card mt-4 space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ notifyOrders, notifyOffers });
        }}
      >
        <p className="font-extrabold text-ink">Notifications</p>
        <label className="flex items-center gap-3 font-semibold text-ink">
          <input type="checkbox" checked={notifyOrders} onChange={(e) => setNotifyOrders(e.target.checked)} />
          Suivi de commandes et livraisons
        </label>
        <label className="flex items-center gap-3 font-semibold text-ink">
          <input type="checkbox" checked={notifyOffers} onChange={(e) => setNotifyOffers(e.target.checked)} />
          Offres et rappels de stock
        </label>
        <button type="submit" className="btn-primary w-full">
          Enregistrer
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
        {session.provider === 'google' && !session.phone ? (
          <p className="text-sm text-muted">Compte Google : le mot de passe se gère chez Google.</p>
        ) : (
          <>
            <FormField label="Mot de passe actuel" value={currentPassword} onChange={setCurrentPassword} type="password" />
            <FormField label="Nouveau mot de passe" value={password} onChange={setPassword} type="password" />
            <button type="submit" className="btn-primary w-full">
              Changer le mot de passe
            </button>
          </>
        )}
      </form>

      <a href={`mailto:${site.email}`} className="card mt-4 block p-4 font-extrabold text-ink">
        Aide & support
      </a>
      <Link href="/conditions" className="card mt-2 block p-4 font-extrabold text-ink">
        Conditions d’utilisation
      </Link>

      <button
        type="button"
        className="btn-secondary mt-6 w-full"
        onClick={() => {
          logout();
          router.replace('/');
        }}
      >
        Déconnexion
      </button>
    </main>
  );
}
