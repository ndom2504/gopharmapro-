import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { LocationStatus } from '../store/location';

export function LocationBar({
  status,
  address,
  outsideGabon,
  onPress,
}: {
  status: LocationStatus;
  address: string | null;
  outsideGabon: boolean;
  onPress: () => void;
}) {
  const label =
    status === 'loading'
      ? 'Recherche de votre position…'
      : status === 'denied'
        ? 'Activez la localisation pour des distances réelles'
        : status === 'error'
          ? 'Position indisponible. Touchez pour réessayer.'
          : address || 'Position trouvée';
  const icon =
    status === 'granted' ? 'navigate' : status === 'loading' ? 'hourglass-outline' : 'location-outline';
  return (
    <Pressable onPress={onPress} style={[s.bar, outsideGabon && s.warn]}>
      <Ionicons name={icon} size={18} color={outsideGabon ? colors.warning : colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={s.label}>{label}</Text>
        {status === 'granted' && !outsideGabon ? <Text style={s.hint}>Distances calculées depuis votre GPS</Text> : null}
        {outsideGabon ? <Text style={s.hint}>Livraison PharmaMarket : Gabon uniquement</Text> : null}
      </View>
      <Text style={s.action}>{status === 'granted' ? 'Actualiser' : 'Activer'}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.mint,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  warn: { backgroundColor: '#FFF4E6' },
  label: { fontWeight: '800', color: colors.text, fontSize: 13 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  action: { color: colors.primary, fontWeight: '800', fontSize: 12 },
});
