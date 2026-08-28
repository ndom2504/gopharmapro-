import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { GoogleProfile, isGoogleConfigured } from '../lib/google';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

function GoogleLook({ busy, label, onPress }: { busy: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={busy} style={({ pressed }) => [s.btn, pressed && { opacity: 0.85 }]}>
      <View style={s.mark}>
        <Text style={s.g}>G</Text>
      </View>
      {busy ? <ActivityIndicator color={colors.text} /> : <Text style={s.label}>{label}</Text>}
    </Pressable>
  );
}

function LiveGoogleButton({
  onProfile,
  label,
}: {
  onProfile: (profile: GoogleProfile) => void;
  label: string;
}) {
  const { busy, signIn } = useGoogleAuth(onProfile);
  return <GoogleLook busy={busy} label={label} onPress={signIn} />;
}

export function GoogleButton({
  onProfile,
  label = 'Continuer avec Google',
}: {
  onProfile: (profile: GoogleProfile) => void;
  label?: string;
}) {
  if (!isGoogleConfigured()) {
    return (
      <GoogleLook
        busy={false}
        label={label}
        onPress={() =>
          Alert.alert(
            'Configurer Google',
            'Créez un identifiant OAuth de type Web dans Google Cloud Console, copiez le Client ID dans .env (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID), puis relancez Expo. URI autorisées : pharmarket:// et https://auth.expo.io/@votre-compte/pharmarket-mobile',
          )
        }
      />
    );
  }
  return <LiveGoogleButton onProfile={onProfile} label={label} />;
}

const s = StyleSheet.create({
  btn: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  mark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  g: { fontWeight: '900', fontSize: 16, color: '#4285F4' },
  label: { fontWeight: '800', color: colors.text, fontSize: 15 },
});
