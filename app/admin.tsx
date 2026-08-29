import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Button } from '../src/components/UI';
import { Field } from '../src/components/Field';
import { BrandMark } from '../src/components/BrandMark';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';

export default function AdminGate() {
  const session = useAuth((s) => s.session);
  const login = useAuth((s) => s.login);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (session?.role === 'admin') return <Redirect href="/admin-home" />;

  const submit = () => {
    if (!identifier.trim() || password.length < 4) {
      setError('Entrez votre e-mail et votre mot de passe.');
      return;
    }
    const result = login(identifier, password, 'admin');
    if (result !== 'ok') {
      setError('Identifiants incorrects.');
      return;
    }
    router.replace('/admin-home');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <BrandMark size={84} style={s.logo} />
        <Text style={s.kicker}>Console</Text>
        <Text style={s.title}>Accès réservé</Text>
        <Text style={s.meta}>Identifiez-vous pour continuer.</Text>
        <Field
          label="E-mail"
          value={identifier}
          onChange={(v) => {
            setIdentifier(v);
            setError('');
          }}
          placeholder="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field
          label="Mot de passe"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setError('');
          }}
          placeholder="Mot de passe"
          secure
          autoCapitalize="none"
        />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <View style={{ marginTop: 8 }}>
          <Button title="Se connecter" onPress={submit} />
        </View>
        <Text onPress={() => router.replace('/auth' as Href)} style={s.back}>
          Retour
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { flexGrow: 1, padding: 24, paddingTop: 72, paddingBottom: 40 },
  logo: { alignSelf: 'center', marginBottom: 18 },
  kicker: { color: colors.blue, fontWeight: '800', fontSize: 13 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 6 },
  meta: { color: colors.muted, marginTop: 6, marginBottom: 22, lineHeight: 20 },
  error: { color: colors.danger, fontWeight: '700', marginBottom: 10 },
  back: { textAlign: 'center', marginTop: 22, color: colors.muted, fontWeight: '800' },
});
