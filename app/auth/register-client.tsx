import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/UI';
import { Field } from '../../src/components/Field';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/store/auth';
import { GoogleButton } from '../../src/components/GoogleButton';
import { formatPhoneInput, parseGabonPhone } from '../../src/data/payments';

export default function RegisterClient() {
  const register = useAuth((s) => s.registerClient);
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (firstName.trim().length < 2) next.firstName = 'Indiquez votre prénom.';
    if (lastName.trim().length < 2) next.lastName = 'Indiquez votre nom.';
    const parsed = parseGabonPhone(phone);
    if (!parsed) next.phone = 'Numéro gabonais invalide.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'E-mail invalide.';
    if (password.length < 6) next.password = 'Au moins 6 caractères.';
    if (password !== confirm) next.confirm = 'Les mots de passe ne correspondent pas.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const result = register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: parsed!.display,
      email: email.trim().toLowerCase(),
      password,
    });
    if (result === 'exists') {
      setErrors({ phone: 'Un compte existe déjà avec ce numéro ou cet e-mail.' });
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Créer un compte client</Text>
        <Text style={s.meta}>Pour commander, suivre vos livraisons et enregistrer votre numéro mobile money.</Text>
        <GoogleButton
          label="S’inscrire avec Google"
          onProfile={(profile) => {
            const result = loginWithGoogle(profile);
            if (result === 'pharmacy') {
              Alert.alert('Compte pharmacie', 'Cet e-mail Google est déjà lié à un compte pharmacie.');
              return;
            }
            if (result !== 'ok') {
              Alert.alert('Google', 'Inscription Google impossible.');
              return;
            }
            router.replace('/(tabs)');
          }}
        />
        <Text style={s.or}>ou</Text>
        <Field label="Prénom" value={firstName} onChange={setFirstName} placeholder="Awa" error={errors.firstName} autoCapitalize="words" />
        <Field label="Nom" value={lastName} onChange={setLastName} placeholder="Diop" error={errors.lastName} autoCapitalize="words" />
        <Text style={s.label}>Téléphone</Text>
        <View style={[s.phoneBox, errors.phone ? { borderColor: colors.danger } : null]}>
          <Text style={s.prefix}>+241</Text>
          <TextInput
            value={phone}
            onChangeText={(v) => setPhone(formatPhoneInput(v))}
            placeholder="77 12 34 56"
            placeholderTextColor="#89958F"
            keyboardType="phone-pad"
            style={s.phoneInput}
          />
        </View>
        {errors.phone ? <Text style={s.error}>{errors.phone}</Text> : null}
        <Field
          label="E-mail (optionnel)"
          value={email}
          onChange={setEmail}
          placeholder="vous@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <Field label="Mot de passe" value={password} onChange={setPassword} placeholder="6 caractères minimum" secure autoCapitalize="none" error={errors.password} />
        <Field label="Confirmer le mot de passe" value={confirm} onChange={setConfirm} placeholder="Répétez le mot de passe" secure autoCapitalize="none" error={errors.confirm} />
        <Button title="Créer mon compte" onPress={submit} />
        <Text onPress={() => router.replace({ pathname: '/auth/login', params: { role: 'client' } })} style={s.link}>
          J’ai déjà un compte
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6, marginBottom: 22, lineHeight: 20 },
  label: { fontWeight: '800', color: colors.text, marginBottom: 8 },
  phoneBox: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 14,
  },
  prefix: { fontWeight: '800', color: colors.text, fontSize: 16 },
  phoneInput: { flex: 1, fontSize: 16, color: colors.text },
  error: { color: colors.danger, fontWeight: '700', marginTop: -8, marginBottom: 12, fontSize: 12 },
  or: { textAlign: 'center', marginVertical: 16, color: colors.muted, fontWeight: '700' },
  link: { textAlign: 'center', marginTop: 18, color: colors.primary, fontWeight: '800' },
});
