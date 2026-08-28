import { useLayoutEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../src/components/UI';
import { ChoiceChips, Field, PhoneField, ToggleRow } from '../../src/components/Field';
import { DocRow, StepHeader } from '../../src/components/pharmacy-wizard/WizardUI';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/store/auth';
import { GoogleButton } from '../../src/components/GoogleButton';
import { parseGabonPhone } from '../../src/data/payments';
import { citiesOf, communesOf, provinces, quartiersOf } from '../../src/data/gabon';
import { emptyCourierForm, toCourierAccount, vehicleOptions } from '../../src/courier-onboarding/defaults';
import { CourierVehicle } from '../../src/types';

function emailOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function RegisterCourier() {
  const navigation = useNavigation();
  const register = useAuth((s) => s.registerCourier);
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState(emptyCourierForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const patch = (partial: Partial<typeof form>) => setForm((f) => ({ ...f, ...partial }));

  useLayoutEffect(() => {
    navigation.setOptions({
      title: done ? 'Demande envoyée' : 'Étape ' + step + '/4',
      headerLeft: () => (
        <Pressable
          onPress={() => {
            if (done) router.replace('/courier-home');
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
      if (form.firstName.trim().length < 2) e.firstName = 'Indiquez votre prénom.';
      if (form.lastName.trim().length < 2) e.lastName = 'Indiquez votre nom.';
      if (!parseGabonPhone(form.phone)) e.phone = 'Numéro gabonais invalide.';
      if (!emailOk(form.email)) e.email = 'E-mail requis et valide.';
      if (form.password.length < 6) e.password = 'Au moins 6 caractères.';
      if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas.';
    }
    if (step === 2) {
      if (form.vehicle === 'other' && form.vehicleOther.trim().length < 2) e.vehicleOther = 'Précisez le type de véhicule.';
      if (form.plate.trim().length < 3) e.plate = 'Indiquez l’immatriculation.';
      if (!parseGabonPhone(form.payoutPhone || form.phone)) e.payoutPhone = 'Numéro mobile money invalide.';
    }
    if (step === 3) {
      if (!form.area) e.area = 'Choisissez votre quartier de rattachement.';
    }
    if (step === 4) {
      const missing = form.documents.filter((d) => d.required && !d.fileName);
      if (missing.length) e.documents = 'Joignez les documents obligatoires.';
      if (!form.termsAccepted) e.terms = 'Acceptez les conditions pour continuer.';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const attach = (key: string) => {
    Alert.alert('Document privé', 'Joignez un PDF, JPG ou PNG. Il n’est pas public.', [
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

  const next = () => {
    if (!validate()) return;
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    const phone = parseGabonPhone(form.phone)!;
    const payout = parseGabonPhone(form.payoutPhone || form.phone)!;
    const account = toCourierAccount({ ...form, phone: phone.display, payoutPhone: payout.display }, 'tmp');
    const { id: _id, role: _role, status: _status, provider: _provider, googleId: _gid, ...rest } = account;
    const result = register({ ...rest, password: form.password });
    if (result === 'exists') {
      setStep(1);
      setErrors({ phone: 'Un compte livreur existe déjà avec ce numéro ou cet e-mail.' });
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <ScrollView contentContainerStyle={s.page}>
        <Text style={{ fontSize: 52, textAlign: 'center', marginTop: 20 }}>🛵</Text>
        <Text style={s.doneTitle}>Demande envoyée</Text>
        <Text style={s.meta}>
          Votre dossier livreur est en vérification. Vous pourrez prendre des courses dès que le compte sera actif.
        </Text>
        <Card style={{ marginTop: 18 }}>
          <Text style={s.label}>Prochaines étapes</Text>
          <Text style={s.meta}>1. Contrôle de la pièce d’identité et du permis</Text>
          <Text style={s.meta}>2. Validation du véhicule et de la zone</Text>
          <Text style={s.meta}>3. Activation — les commandes livrables apparaîtront ici</Text>
        </Card>
        <View style={{ marginTop: 22 }}>
          <Button title="Ouvrir l’espace livreur" onPress={() => router.replace('/courier-home')} />
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        {step === 1 ? (
          <>
            <StepHeader
              step={1}
              total={4}
              title="Identité du livreur"
              subtitle="Pour récupérer les commandes en pharmacie et les livrer aux clients au Gabon."
            />
            <GoogleButton
              label="S’inscrire avec Google"
              onProfile={(profile) => {
                const result = loginWithGoogle(profile, 'courier');
                if (result === 'conflict') {
                  Alert.alert('Compte existant', 'Cet e-mail Google est déjà utilisé par un client ou une pharmacie.');
                  return;
                }
                if (result !== 'ok') {
                  Alert.alert('Google', 'Inscription Google impossible.');
                  return;
                }
                router.replace('/courier-home');
              }}
            />
            <Text style={s.or}>ou remplir le formulaire</Text>
            <Field label="Prénom *" value={form.firstName} onChange={(firstName) => patch({ firstName })} placeholder="Jean" error={errors.firstName} autoCapitalize="words" />
            <Field label="Nom *" value={form.lastName} onChange={(lastName) => patch({ lastName })} placeholder="Mba" error={errors.lastName} autoCapitalize="words" />
            <PhoneField label="Téléphone *" value={form.phone} onChange={(phone) => patch({ phone })} error={errors.phone} />
            <Field
              label="E-mail *"
              value={form.email}
              onChange={(email) => patch({ email })}
              placeholder="vous@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <Field label="Mot de passe *" value={form.password} onChange={(password) => patch({ password })} placeholder="6 caractères minimum" secure autoCapitalize="none" error={errors.password} />
            <Field label="Confirmer le mot de passe *" value={form.confirm} onChange={(confirm) => patch({ confirm })} placeholder="Répétez le mot de passe" secure autoCapitalize="none" error={errors.confirm} />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <StepHeader step={2} total={4} title="Véhicule et paiement" subtitle="Le type de véhicule et le numéro qui recevra vos gains." />
            <Text style={s.label}>Véhicule *</Text>
            <ChoiceChips
              options={vehicleOptions.map((v) => ({ id: v.id, label: v.label }))}
              value={form.vehicle}
              onChange={(id) => patch({ vehicle: id as CourierVehicle })}
            />
            {form.vehicle === 'other' ? (
              <Field label="Précisez le véhicule *" value={form.vehicleOther} onChange={(vehicleOther) => patch({ vehicleOther })} placeholder="Tricycle, vélo…" error={errors.vehicleOther} />
            ) : null}
            <Field
              label="Immatriculation *"
              value={form.plate}
              onChange={(plate) => patch({ plate })}
              placeholder="LBV-204-GA"
              autoCapitalize="characters"
              error={errors.plate}
            />
            <PhoneField
              label="Mobile money pour vos gains *"
              value={form.payoutPhone}
              onChange={(payoutPhone) => patch({ payoutPhone })}
              error={errors.payoutPhone}
            />
            <Text style={s.hint}>Airtel Money, Moov Money ou MobiCash. Par défaut on peut reprendre votre téléphone.</Text>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <StepHeader step={3} total={4} title="Zone d’activité" subtitle="Les courses vous seront proposées autour de ce quartier." />
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
            <Text style={s.label}>Quartier de rattachement *</Text>
            <ChoiceChips
              options={quartiersOf(form.province, form.city, form.commune).map((id) => ({ id, label: id }))}
              value={form.area}
              onChange={(area) => patch({ area })}
            />
            {errors.area ? <Text style={s.error}>{errors.area}</Text> : null}
            <Field
              label="Autres quartiers desservis"
              value={form.zones}
              onChange={(zones) => patch({ zones })}
              placeholder="Glass, Louis, Batterie IV…"
            />
          </>
        ) : null}

        {step === 4 ? (
          <>
            <StepHeader step={4} total={4} title="Documents et validation" subtitle="Ces fichiers restent privés. Ils servent uniquement à la vérification." />
            {form.documents.map((d) => (
              <DocRow key={d.key} label={d.label} required={d.required} fileName={d.fileName} status={d.status} onPick={() => attach(d.key)} />
            ))}
            {errors.documents ? <Text style={s.error}>{errors.documents}</Text> : null}
            <ToggleRow
              label="J’accepte les conditions livreur"
              hint="Pièces justes, courses avec code de ramassage, respect des délais."
              value={form.termsAccepted}
              onChange={(termsAccepted) => patch({ termsAccepted })}
            />
            {errors.terms ? <Text style={s.error}>{errors.terms}</Text> : null}
            <Card style={{ backgroundColor: colors.mint, borderColor: '#BCE9D8' }}>
              <Text style={s.label}>Après envoi</Text>
              <Text style={s.meta}>Le compte reste en vérification. Les courses apparaissent une fois le dossier accepté.</Text>
            </Card>
          </>
        ) : null}

        <View style={{ marginTop: 8 }}>
          <Button title={step === 4 ? 'Envoyer ma demande' : 'Continuer'} onPress={next} />
        </View>
        {step === 1 ? (
          <Text onPress={() => router.replace({ pathname: '/auth/login', params: { role: 'courier' } })} style={s.link}>
            J’ai déjà un compte
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  doneTitle: { fontSize: 28, fontWeight: '900', color: colors.text, textAlign: 'center', marginTop: 12 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  label: { fontWeight: '800', color: colors.text, marginBottom: 8 },
  error: { color: colors.danger, fontWeight: '700', marginBottom: 12, fontSize: 12 },
  or: { textAlign: 'center', marginVertical: 16, color: colors.muted, fontWeight: '700' },
  link: { textAlign: 'center', marginTop: 18, color: colors.primary, fontWeight: '800' },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: -6, marginBottom: 12 },
});
