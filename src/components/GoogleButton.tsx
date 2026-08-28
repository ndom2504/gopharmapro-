import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { GoogleProfile, getGoogleClientIds, isGoogleConfigured } from '../lib/google';
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
  const ids = getGoogleClientIds();
  const ready = isGoogleConfigured() && Boolean(ids.webClientId || ids.androidClientId || ids.iosClientId);
  if (!ready) {
    return (
      <GoogleLook
        busy={false}
        label={label}
        onPress={() =>
          Alert.alert(
            'Configurer Google',
            'Le Client ID Web n’est pas chargé. Arrêtez Expo, relancez npx expo start --clear, puis réessayez.',
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
