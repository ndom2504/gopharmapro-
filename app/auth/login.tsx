import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/components/UI';
import { Field } from '../../src/components/Field';
import { colors } from '../../src/theme';
import { UserRole } from '../../src/types';
import { useAuth } from '../../src/store/auth';
import { GoogleButton } from '../../src/components/GoogleButton';

export default function Login() {
  const params = useLocalSearchParams<{ role?: string }>();
  const [role, setRole] = useState<UserRole>(params.role === 'pharmacy' ? 'pharmacy' : 'client');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuth((s) => s.login);
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);

  const submit = () => {
    if (!identifier.trim() || password.length < 4) {
      setError('Entrez votre téléphone ou e-mail, puis votre mot de passe.');
      return;
    }
    const result = login(identifier, password, role);
    if (result !== 'ok') {
      setError('Identifiants incorrects pour ce type de compte.');
      return;
    }
    router.replace(role === 'pharmacy' ? '/pharmacy-home' : '/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.switch}>
          <Pressable onPress={() => setRole('client')} style={[s.tab, role === 'client' && s.tabOn]}>
            <Text style={role === 'client' ? s.tabOnText : s.tabText}>Client</Text>
          </Pressable>
          <Pressable onPress={() => setRole('pharmacy')} style={[s.tab, role === 'pharmacy' && s.tabOn]}>
            <Text style={role === 'pharmacy' ? s.tabOnText : s.tabText}>Pharmacie</Text>
          </Pressable>
        </View>
        <Text style={s.title}>{role === 'pharmacy' ? 'Espace pharmacie' : 'Espace client'}</Text>
        <Text style={s.meta}>
          {role === 'pharmacy'
            ? 'Connectez-vous pour gérer les commandes de votre officine.'
            : 'Connectez-vous pour suivre vos commandes et adresses.'}
        </Text>
        <Field
          label={role === 'pharmacy' ? 'E-mail ou téléphone' : 'Téléphone ou e-mail'}
          value={identifier}
          onChange={(v) => {
            setIdentifier(v);
            setError('');
          }}
          placeholder={role === 'pharmacy' ? 'centre@pharma.ga' : '77 00 00 00'}
          autoCapitalize="none"
          keyboardType={role === 'pharmacy' ? 'email-address' : 'default'}
        />
        <Field
          label="Mot de passe"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setError('');
          }}
          placeholder="Votre mot de passe"
          secure
          autoCapitalize="none"
        />
        {error ? <Text style={s.error}>{error}</Text> : <Text style={s.hint}>Démo : demo123 — client 77 00 00 00 · pharmacie centre@pharma.ga</Text>}
        <View style={{ marginTop: 8 }}>
          <Button title="Se connecter" onPress={submit} />
        </View>
        {role === 'client' ? (
          <>
            <Text style={s.or}>ou</Text>
            <GoogleButton
              onProfile={(profile) => {
                const result = loginWithGoogle(profile);
                if (result === 'pharmacy') {
                  setError('Cet e-mail Google est déjà lié à un compte pharmacie.');
                  return;
                }
                if (result !== 'ok') {
                  setError('Connexion Google impossible.');
                  return;
                }
                router.replace('/(tabs)');
              }}
            />
          </>
        ) : null}
        {role === 'client' ? (
          <Text onPress={() => router.push('/auth/register-client')} style={s.link}>
            Créer un compte client
          </Text>
        ) : (
          <Text onPress={() => router.push('/auth/register-pharmacy')} style={s.link}>
            Créer le compte de ma pharmacie
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 40 },
  switch: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 4, marginBottom: 22 },
  tab: { flex: 1, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.primary },
  tabText: { fontWeight: '800', color: colors.text },
  tabOnText: { fontWeight: '800', color: '#fff' },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6, marginBottom: 22, lineHeight: 20 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 10 },
  error: { color: colors.danger, fontWeight: '700', marginBottom: 10 },
  or: { textAlign: 'center', marginVertical: 16, color: colors.muted, fontWeight: '700' },
  link: { textAlign: 'center', marginTop: 18, color: colors.primary, fontWeight: '800' },
});
