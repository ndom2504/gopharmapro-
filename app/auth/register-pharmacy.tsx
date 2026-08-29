import { useLayoutEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../src/components/UI';
import { ChoiceChips, Field, PhoneField, ToggleRow } from '../../src/components/Field';
import { DocRow, HoursTable, MapPinCard, StepHeader } from '../../src/components/pharmacy-wizard/WizardUI';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/store/auth';
import { parseGabonPhone } from '../../src/data/payments';
import { citiesOf, communesOf, provinces, quartiersOf } from '../../src/data/gabon';
import { defaultHours, emptyPharmacyForm, managerRoleOptions, structureOptions, toPharmacyAccount } from '../../src/pharmacy-onboarding/defaults';
import { ManagerRole, StructureType } from '../../src/types';
import { isInGabon } from '../../src/lib/geo';

function emailOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function RegisterPharmacy() {
  const navigation = useNavigation();
  const register = useAuth((s) => s.registerPharmacy);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState(emptyPharmacyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsLoading, setGpsLoading] = useState(false);

  const patch = (partial: Partial<typeof form>) => setForm((f) => ({ ...f, ...partial }));

  useLayoutEffect(() => {
    navigation.setOptions({
      title: done ? 'Demande envoyée' : 'Étape ' + step + '/6',
      headerLeft: () => (
        <Pressable
          onPress={() => {
            if (done) router.replace('/pharmacy-home');
            else if (step > 1) setStep(step - 1);
            else router.back();
          }}
          style={{ paddingHorizontal: 6 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, step, done]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (form.pharmacyName.trim().length < 3) e.pharmacyName = 'Indiquez le nom officiel.';
      if (form.structureType === 'other' && form.structureTypeOther.trim().length < 2) e.structureTypeOther = 'Précisez le type de structure.';
      if (!parseGabonPhone(form.phone)) e.phone = 'Téléphone professionnel invalide.';
      if (!emailOk(form.email)) e.email = 'E-mail professionnel invalide.';
    }
    if (step === 2) {
      if (form.managerFirstName.trim().length < 2) e.managerFirstName = 'Prénom requis.';
      if (form.managerLastName.trim().length < 2) e.managerLastName = 'Nom requis.';
      if (!parseGabonPhone(form.managerPhone)) e.managerPhone = 'Téléphone du responsable invalide.';
      if (!emailOk(form.managerEmail)) e.managerEmail = 'E-mail du responsable invalide.';
      if (form.managerRole === 'other' && form.managerRoleOther.trim().length < 2) e.managerRoleOther = 'Précisez la fonction.';
      if (form.managerRole === 'titulaire' && form.professionalNumber.trim().length < 3) e.professionalNumber = 'N° d’ordre requis pour le titulaire.';
    }
    if (step === 3) {
      if (!form.area) e.area = 'Choisissez un quartier.';
      if (form.address.trim().length < 5) e.address = 'Indiquez l’adresse complète.';
      if (!form.gpsConfirmed) e.gps = 'Confirmez la position GPS sur la carte.';
    }
    if (step === 4) {
      if (!form.services.pickup && !form.services.delivery && !form.services.onlineOrder) e.services = 'Sélectionnez au moins un service.';
      if (form.services.delivery) {
        if (!form.deliveryRadiusKm.trim()) e.deliveryRadiusKm = 'Indiquez le rayon de livraison.';
        if (!form.deliveryFee.trim()) e.deliveryFee = 'Indiquez les frais de livraison.';
        if (!form.deliveryEta.trim()) e.deliveryEta = 'Indiquez le délai moyen.';
      }
    }
    if (step === 5) {
      const missing = form.documents.filter((d) => d.required && !d.fileName);
      if (missing.length) e.documents = 'Joignez les documents obligatoires.';
    }
    if (step === 6) {
      if (!emailOk(form.email)) e.email = 'E-mail professionnel invalide.';
      if (form.password.length < 6) e.password = 'Au moins 6 caractères.';
      if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas.';
      if (!form.termsAccepted) e.terms = 'Acceptez les conditions d’utilisation.';
      if (!form.privacyAccepted) e.privacy = 'Acceptez la politique de confidentialité.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < 6) {
      setStep(step + 1);
      return;
    }
    const phone = parseGabonPhone(form.phone)!;
    const managerPhone = parseGabonPhone(form.managerPhone)!;
    const account = toPharmacyAccount(
      {
        ...form,
        phone: phone.display,
        managerPhone: managerPhone.display,
        phoneSecondary: parseGabonPhone(form.phoneSecondary)?.display || form.phoneSecondary,
        documents: form.documents.map((d) => ({ ...d, status: d.fileName ? 'pending' : d.status })),
      },
      'ph-' + Date.now(),
      'pending',
    );
    const result = register({ ...account, password: form.password });
    if (result === 'exists') {
      setErrors({ email: 'Un compte pharmacie existe déjà avec cet e-mail ou ce téléphone.' });
      return;
    }
    setDone(true);
  };

  const useGps = async () => {
    setGpsLoading(true);
    setErrors((e) => ({ ...e, gps: '' }));
    try {
      const current = await Location.requestForegroundPermissionsAsync();
      if (current.status !== 'granted') {
        setErrors({ gps: 'Autorisez la localisation pour placer la pharmacie.' });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      patch({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        gpsConfirmed: false,
      });
    } catch {
      setErrors({ gps: 'Impossible d’obtenir la position. Réessayez.' });
    } finally {
      setGpsLoading(false);
    }
  };

  const attach = (key: string) => {
    Alert.alert('Document privé', 'Joignez un PDF, JPG ou PNG. Il ne sera jamais affiché sur la marketplace.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Joindre',
        onPress: () =>
          setForm((f) => ({
            ...f,
            documents: f.documents.map((d) => (d.key === key ? { ...d, fileName: d.key + '.pdf', status: 'pending' } : d)),
          })),
      },
    ]);
  };

  if (done) {
    return (
      <ScrollView contentContainerStyle={s.page}>
        <Text style={{ fontSize: 52, textAlign: 'center', marginTop: 20 }}>🎉</Text>
        <Text style={s.successTitle}>Votre demande a été envoyée</Text>
        <Text style={s.meta}>
          Votre pharmacie n’est pas encore visible sur la marketplace. Elle sera activée après vérification des informations et des documents.
        </Text>
        <Card style={{ marginTop: 18 }}>
          {['Inscription', 'Documents envoyés', 'Vérification', 'Décision'].map((label, i) => (
            <View key={label} style={s.flowRow}>
              <View style={[s.flowDot, i < 2 && s.flowOn]} />
              <Text style={s.flowLabel}>{label}</Text>
            </View>
          ))}
        </Card>
        <View style={{ marginTop: 22 }}>
          <Button title="Accéder à mon espace pharmacie" onPress={() => router.replace('/pharmacy-home')} />
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        {step === 1 ? (
          <>
            <StepHeader step={1} title="Votre pharmacie" subtitle="Référencez votre officine et permettez à vos clients de trouver vos produits." />
            <Field label="Nom officiel de la pharmacie *" value={form.pharmacyName} onChange={(pharmacyName) => patch({ pharmacyName })} placeholder="Pharmacie du Centre" error={errors.pharmacyName} />
            <Field label="Nom commercial (si différent)" value={form.tradeName} onChange={(tradeName) => patch({ tradeName })} placeholder="Facultatif" />
            <Text style={s.label}>Type de structure *</Text>
            <ChoiceChips options={structureOptions} value={form.structureType} onChange={(id) => patch({ structureType: id as StructureType })} />
            {form.structureType === 'other' ? <Field label="Précisez" value={form.structureTypeOther} onChange={(structureTypeOther) => patch({ structureTypeOther })} error={errors.structureTypeOther} /> : null}
            <Field label="Numéro d’autorisation / agrément" value={form.authorizationNumber} onChange={(authorizationNumber) => patch({ authorizationNumber })} placeholder="MS/…/PH-…" autoCapitalize="characters" />
            <Field label="Numéro d’identification de la structure" value={form.structureIdNumber} onChange={(structureIdNumber) => patch({ structureIdNumber })} placeholder="NIF / identifiant" autoCapitalize="characters" />
            <PhoneField label="Téléphone professionnel *" value={form.phone} onChange={(phone) => patch({ phone })} error={errors.phone} />
            <Field label="Email professionnel *" value={form.email} onChange={(email) => patch({ email })} placeholder="pharmacie@email.ga" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
            <PhoneField label="Téléphone secondaire" value={form.phoneSecondary} onChange={(phoneSecondary) => patch({ phoneSecondary })} />
            <Field label="Site web (facultatif)" value={form.website} onChange={(website) => patch({ website })} placeholder="https://" keyboardType="url" autoCapitalize="none" />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <StepHeader step={2} title="Responsable de la pharmacie" subtitle="Le compte principal est rattaché à une personne responsable de la structure." />
            <Field label="Prénom(s) *" value={form.managerFirstName} onChange={(managerFirstName) => patch({ managerFirstName })} placeholder="Ndong" autoCapitalize="words" error={errors.managerFirstName} />
            <Field label="Nom *" value={form.managerLastName} onChange={(managerLastName) => patch({ managerLastName })} placeholder="Mba" autoCapitalize="words" error={errors.managerLastName} />
            <Text style={s.label}>Fonction *</Text>
            <ChoiceChips options={managerRoleOptions} value={form.managerRole} onChange={(id) => patch({ managerRole: id as ManagerRole })} />
            {form.managerRole === 'other' ? <Field label="Précisez la fonction" value={form.managerRoleOther} onChange={(managerRoleOther) => patch({ managerRoleOther })} error={errors.managerRoleOther} /> : null}
            <PhoneField label="Téléphone *" value={form.managerPhone} onChange={(managerPhone) => patch({ managerPhone })} error={errors.managerPhone} />
            <Field label="Email *" value={form.managerEmail} onChange={(managerEmail) => patch({ managerEmail })} placeholder="responsable@email.ga" keyboardType="email-address" autoCapitalize="none" error={errors.managerEmail} />
            <Field
              label="N° professionnel / ordre, si applicable"
              value={form.professionalNumber}
              onChange={(professionalNumber) => patch({ professionalNumber })}
              placeholder="ONPG-…"
              autoCapitalize="characters"
              error={errors.professionalNumber}
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <StepHeader step={3} title="Localisation" subtitle="Cette position servira à afficher « pharmacie à 1,4 km de vous »." />
            <Text style={s.label}>Province *</Text>
            <ChoiceChips
              options={provinces.map((id) => ({ id, label: id }))}
              value={form.province}
              onChange={(province) => {
                const city = citiesOf(province)[0] || '';
                const commune = communesOf(province, city)[0] || '';
                patch({ province, city, commune, area: '' });
              }}
            />
            <Text style={s.label}>Ville *</Text>
            <ChoiceChips
              options={citiesOf(form.province).map((id) => ({ id, label: id }))}
              value={form.city}
              onChange={(city) => {
                const commune = communesOf(form.province, city)[0] || '';
                patch({ city, commune, area: '' });
              }}
            />
            <Text style={s.label}>Commune *</Text>
            <ChoiceChips
              options={communesOf(form.province, form.city).map((id) => ({ id, label: id }))}
              value={form.commune}
              onChange={(commune) => patch({ commune, area: '' })}
            />
            <Text style={s.label}>Quartier *</Text>
            <ChoiceChips
              options={quartiersOf(form.province, form.city, form.commune).map((id) => ({ id, label: id }))}
              value={form.area}
              onChange={(area) => patch({ area })}
            />
            {errors.area ? <Text style={s.error}>{errors.area}</Text> : null}
            <Field label="Adresse complète *" value={form.address} onChange={(address) => patch({ address })} placeholder="Rue, immeuble, PK…" error={errors.address} />
            <Field label="Point de repère" value={form.landmark} onChange={(landmark) => patch({ landmark })} placeholder="Face à la poste, près du marché…" />
            <Text style={s.label}>Position GPS *</Text>
            <MapPinCard
              latitude={form.latitude}
              longitude={form.longitude}
              confirmed={form.gpsConfirmed}
              loading={gpsLoading}
              onUseLocation={useGps}
              onConfirm={() => {
                patch({ gpsConfirmed: true });
                setErrors((e) => ({ ...e, gps: '' }));
              }}
            />
            {!isInGabon({ latitude: form.latitude, longitude: form.longitude }) ? (
              <Text style={s.warn}>Cette position semble hors Gabon. Vérifiez avant de confirmer.</Text>
            ) : null}
            {errors.gps ? <Text style={s.error}>{errors.gps}</Text> : null}
          </>
        ) : null}

        {step === 4 ? (
          <>
            <StepHeader step={4} title="Services et horaires" subtitle="Quand êtes-vous ouverts, et quels services proposez-vous ?" />
            <HoursTable hours={form.hours} onChange={(day, nextDay) => patch({ hours: { ...form.hours, [day]: nextDay }, open24h: false })} />
            <ToggleRow
              label="Ouvert 24h/24"
              hint="Applique 00:00 – 23:59 tous les jours."
              value={form.open24h}
              onChange={(open24h) => {
                if (!open24h) return patch({ open24h });
                const hours = defaultHours();
                (Object.keys(hours) as (keyof typeof hours)[]).forEach((d) => {
                  hours[d] = { closed: false, open: '00:00', close: '23:59' };
                });
                patch({ open24h, hours });
              }}
            />
            <ToggleRow label="Service de garde" hint="La pharmacie peut être de garde selon le planning officiel." value={form.nightDuty} onChange={(nightDuty) => patch({ nightDuty })} />
            <Text style={[s.label, { marginTop: 8 }]}>Quels services proposez-vous ?</Text>
            <ToggleRow label="Commande en ligne" hint="Les clients commandent depuis l’application." value={form.services.onlineOrder} onChange={(onlineOrder) => patch({ services: { ...form.services, onlineOrder } })} />
            <ToggleRow label="Retrait en pharmacie" hint="Click & collect à l’officine." value={form.services.pickup} onChange={(pickup) => patch({ services: { ...form.services, pickup } })} />
            <ToggleRow label="Livraison" hint="Livraison à domicile autour de la pharmacie." value={form.services.delivery} onChange={(delivery) => patch({ services: { ...form.services, delivery } })} />
            <ToggleRow label="Commandes sur ordonnance" hint="Le client transmet l’ordonnance, vous validez, puis le paiement." value={form.services.prescription} onChange={(prescription) => patch({ services: { ...form.services, prescription } })} />
            <ToggleRow label="Produits de parapharmacie" hint="Hygiène, bébé, dermocosmétique…" value={form.services.parapharmacy} onChange={(parapharmacy) => patch({ services: { ...form.services, parapharmacy } })} />
            <ToggleRow label="Produits de santé" hint="Vitamines, dispositifs médicaux, etc." value={form.services.health} onChange={(health) => patch({ services: { ...form.services, health } })} />
            {errors.services ? <Text style={s.error}>{errors.services}</Text> : null}
            {form.services.delivery ? (
              <>
                <Field label="Rayon de livraison (km)" value={form.deliveryRadiusKm} onChange={(deliveryRadiusKm) => patch({ deliveryRadiusKm })} placeholder="8" keyboardType="phone-pad" error={errors.deliveryRadiusKm} />
                <Field label="Zones desservies" value={form.deliveryZones} onChange={(deliveryZones) => patch({ deliveryZones })} placeholder="Glass, Louis, Centre-ville…" />
                <Field label="Frais de livraison (FCFA)" value={form.deliveryFee} onChange={(deliveryFee) => patch({ deliveryFee })} placeholder="1000" keyboardType="phone-pad" error={errors.deliveryFee} />
                <Field label="Livraison gratuite à partir de (FCFA)" value={form.freeDeliveryFrom} onChange={(freeDeliveryFrom) => patch({ freeDeliveryFrom })} placeholder="25000" keyboardType="phone-pad" />
                <Field label="Délai moyen" value={form.deliveryEta} onChange={(deliveryEta) => patch({ deliveryEta })} placeholder="30-45 min" error={errors.deliveryEta} />
              </>
            ) : null}
          </>
        ) : null}

        {step === 5 ? (
          <>
            <StepHeader step={5} title="Documents de vérification" subtitle="Ces fichiers restent privés. Ils ne sont jamais affichés sur la marketplace." />
            {form.documents.map((d) => (
              <DocRow key={d.key} label={d.label} required={d.required} fileName={d.fileName} status={d.status} onPick={() => attach(d.key)} />
            ))}
            {errors.documents ? <Text style={s.error}>{errors.documents}</Text> : null}
            <Card style={{ backgroundColor: colors.mint, borderColor: colors.mintBorder }}>
              <Text style={s.noteTitle}>Statuts</Text>
              <Text style={s.note}>🟠 En attente · 🟢 Vérifié · 🔴 Rejeté — après contrôle de l’administration PharmaMarket.</Text>
            </Card>
          </>
        ) : null}

        {step === 6 ? (
          <>
            <StepHeader step={6} title="Compte de connexion" subtitle="Créez vos identifiants. L’e-mail professionnel sert aussi de login." />
            <Field label="Email professionnel *" value={form.email} onChange={(email) => patch({ email })} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
            <Field label="Mot de passe *" value={form.password} onChange={(password) => patch({ password })} placeholder="6 caractères minimum" secure autoCapitalize="none" error={errors.password} />
            <Field label="Confirmation du mot de passe *" value={form.confirm} onChange={(confirm) => patch({ confirm })} placeholder="Répétez le mot de passe" secure autoCapitalize="none" error={errors.confirm} />
            <ToggleRow label="J’accepte les conditions d’utilisation" hint="Compte professionnel soumis à vérification." value={form.termsAccepted} onChange={(termsAccepted) => patch({ termsAccepted })} />
            {errors.terms ? <Text style={s.error}>{errors.terms}</Text> : null}
            <ToggleRow label="J’accepte la politique de confidentialité" hint="Les documents d’agrément ne sont pas publics." value={form.privacyAccepted} onChange={(privacyAccepted) => patch({ privacyAccepted })} />
            {errors.privacy ? <Text style={s.error}>{errors.privacy}</Text> : null}
          </>
        ) : null}

        <View style={s.footer}>
          {step > 1 ? (
            <View style={{ flex: 1 }}>
              <Button title="Retour" kind="secondary" onPress={() => setStep(step - 1)} />
            </View>
          ) : null}
          <View style={{ flex: 1.4 }}>
            <Button title={step === 6 ? 'Créer mon compte pharmacie' : 'Continuer'} onPress={next} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 40 },
  label: { fontWeight: '800', color: colors.text, marginBottom: 8 },
  error: { color: colors.danger, fontWeight: '700', marginBottom: 12, fontSize: 13 },
  warn: { color: colors.warning, fontWeight: '700', marginTop: 10 },
  footer: { flexDirection: 'row', gap: 10, marginTop: 8 },
  noteTitle: { fontWeight: '800', color: colors.text, marginBottom: 6 },
  note: { color: colors.muted, lineHeight: 20, fontSize: 13 },
  successTitle: { fontSize: 26, fontWeight: '900', color: colors.text, textAlign: 'center', marginTop: 12 },
  meta: { color: colors.muted, marginTop: 10, lineHeight: 22, textAlign: 'center' },
  flowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40 },
  flowDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  flowOn: { backgroundColor: colors.primary },
  flowLabel: { fontWeight: '700', color: colors.text },
});
