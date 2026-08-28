import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/store/auth';
import { GoogleButton } from '../../src/components/GoogleButton';

export default function AuthWelcome() {
  const continueAsGuest = useAuth((s) => s.continueAsGuest);
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);
  const browse = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };
  return (
    <View style={s.page}>
      <View style={s.hero}>
        <View style={s.logo}>
          <Text style={{ fontSize: 36 }}>💊</Text>
        </View>
        <Text style={s.brand}>PharmaMarket</Text>
        <Text style={s.tag}>Médicaments et parapharmacie, livrés au Gabon.</Text>
      </View>
      <Text style={s.ask}>Comment souhaitez-vous continuer ?</Text>
      <View style={{ marginBottom: 16 }}>
        <GoogleButton
          label="Continuer avec Google"
          onProfile={(profile) => {
            const result = loginWithGoogle(profile);
            if (result === 'pharmacy') {
              Alert.alert('Compte pharmacie', 'Cet e-mail Google est déjà lié à un compte pharmacie. Connectez-vous avec e-mail et mot de passe.');
              return;
            }
            if (result !== 'ok') {
              Alert.alert('Google', 'Connexion Google impossible.');
              return;
            }
            router.replace('/(tabs)');
          }}
        />
      </View>
      <Pressable onPress={() => router.push({ pathname: '/auth/login', params: { role: 'client' } })} style={s.card}>
        <View style={s.icon}>
          <Ionicons name="person" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>Je suis un client</Text>
          <Text style={s.cardMeta}>Commander, comparer les pharmacies et payer en mobile money.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </Pressable>
      <Pressable onPress={() => router.push({ pathname: '/auth/login', params: { role: 'pharmacy' } })} style={s.card}>
        <View style={s.icon}>
          <Ionicons name="medkit" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>Je suis une pharmacie</Text>
          <Text style={s.cardMeta}>Recevoir des commandes et créer le compte de votre officine.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </Pressable>
      <Text onPress={browse} style={s.guest}>
        Continuer en invité
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 24, paddingTop: 72 },
  hero: { alignItems: 'center', marginBottom: 36 },
  logo: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brand: { fontSize: 30, fontWeight: '900', color: colors.text },
  tag: { marginTop: 8, color: colors.muted, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  ask: { fontWeight: '800', color: colors.text, fontSize: 16, marginBottom: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontWeight: '800', fontSize: 16, color: colors.text },
  cardMeta: { color: colors.muted, marginTop: 4, lineHeight: 18, fontSize: 13 },
  guest: { textAlign: 'center', marginTop: 18, color: colors.primary, fontWeight: '800' },
});
