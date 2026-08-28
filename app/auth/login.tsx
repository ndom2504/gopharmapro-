import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/components/UI';
import { Field } from '../../src/components/Field';
import { colors } from '../../src/theme';
import { UserRole } from '../../src/types';
import { homeFor, useAuth } from '../../src/store/auth';
import { GoogleButton } from '../../src/components/GoogleButton';

function roleFromParam(value?: string): UserRole {
  if (value === 'pharmacy' || value === 'courier' || value === 'admin') return value;
  return 'client';
}

const copy: Record<UserRole, { title: string; meta: string; placeholder: string; hint: string }> = {
  client: {
    title: 'Espace client',
    meta: 'Connectez-vous pour suivre vos commandes et adresses.',
    placeholder: '77 00 00 00',
    hint: 'Démo : demo123 — 77 00 00 00',
  },
  courier: {
    title: 'Espace livreur',
    meta: 'Connectez-vous pour accepter et livrer les commandes.',
    placeholder: '66 00 00 00',
    hint: 'Démo : demo123 — 66 00 00 00 ou livreur@gopharmapro.com',
  },
  pharmacy: {
    title: 'Espace pharmacie',
    meta: 'Connectez-vous pour gérer les commandes de votre officine.',
    placeholder: 'centre@pharma.ga',
    hint: 'Démo vérifiée : demo123 — centre@pharma.ga · En attente : palmiers@pharma.ga',
  },
  admin: {
    title: 'Administration',
    meta: 'Validez les dossiers pharmacies et livreurs, le catalogue et les virements.',
    placeholder: 'admin@gopharmapro.com',
    hint: 'Démo : demo123 — admin@gopharmapro.com',
  },
};

export default function Login() {
  const params = useLocalSearchParams<{ role?: string }>();
  const [role, setRole] = useState<UserRole>(roleFromParam(params.role));
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuth((s) => s.login);
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);
  const text = copy[role];
  const googleOk = role === 'client' || role === 'courier';

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
    router.replace(homeFor(role));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.switch}>
          <Pressable onPress={() => setRole('client')} style={[s.tab, role === 'client' && s.tabOn]}>
            <Text style={role === 'client' ? s.tabOnText : s.tabText}>Client</Text>
          </Pressable>
          <Pressable onPress={() => setRole('courier')} style={[s.tab, role === 'courier' && s.tabOn]}>
            <Text style={role === 'courier' ? s.tabOnText : s.tabText}>Livreur</Text>
          </Pressable>
          <Pressable onPress={() => setRole('pharmacy')} style={[s.tab, role === 'pharmacy' && s.tabOn]}>
            <Text style={role === 'pharmacy' ? s.tabOnText : s.tabText}>Pharmacie</Text>
          </Pressable>
          <Pressable onPress={() => setRole('admin')} style={[s.tab, role === 'admin' && s.tabOn]}>
            <Text style={role === 'admin' ? s.tabOnText : s.tabText}>Admin</Text>
          </Pressable>
        </View>
        <Text style={s.title}>{text.title}</Text>
        <Text style={s.meta}>{text.meta}</Text>
        <Field
          label={role === 'pharmacy' || role === 'admin' ? 'E-mail ou téléphone' : 'Téléphone ou e-mail'}
          value={identifier}
          onChange={(v) => {
            setIdentifier(v);
            setError('');
          }}
          placeholder={text.placeholder}
          autoCapitalize="none"
          keyboardType={role === 'pharmacy' || role === 'admin' ? 'email-address' : 'default'}
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
        {error ? <Text style={s.error}>{error}</Text> : <Text style={s.hint}>{text.hint}</Text>}
        <View style={{ marginTop: 8 }}>
          <Button title="Se connecter" onPress={submit} />
        </View>
        {googleOk ? (
          <>
            <Text style={s.or}>ou</Text>
            <GoogleButton
              onProfile={(profile) => {
                if (role !== 'client' && role !== 'courier') return;
                const result = loginWithGoogle(profile, role);
                if (result === 'conflict') {
                  setError('Cet e-mail Google est déjà utilisé par un autre type de compte.');
                  return;
                }
                if (result !== 'ok') {
                  setError('Connexion Google impossible.');
                  return;
                }
                router.replace(homeFor(role));
              }}
            />
          </>
        ) : null}
        {role === 'client' ? (
          <Text onPress={() => router.push('/auth/register-client')} style={s.link}>
            Créer un compte client
          </Text>
        ) : null}
        {role === 'courier' ? (
          <Text onPress={() => router.push('/auth/register-courier')} style={s.link}>
            Créer un compte livreur
          </Text>
        ) : null}
        {role === 'pharmacy' ? (
          <Text onPress={() => router.push('/auth/register-pharmacy')} style={s.link}>
            Créer le compte de ma pharmacie
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 40 },
  switch: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 4, marginBottom: 22 },
  tab: { flex: 1, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.primary },
  tabText: { fontWeight: '800', color: colors.text, fontSize: 11 },
  tabOnText: { fontWeight: '800', color: '#fff', fontSize: 11 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6, marginBottom: 22, lineHeight: 20 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 10 },
  error: { color: colors.danger, fontWeight: '700', marginBottom: 10 },
  or: { textAlign: 'center', marginVertical: 16, color: colors.muted, fontWeight: '700' },
  link: { textAlign: 'center', marginTop: 18, color: colors.primary, fontWeight: '800' },
});
