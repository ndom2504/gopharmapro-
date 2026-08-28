import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function DeliveryTrack({
  pharmacyName,
  courierName,
  eta,
  distance,
  status,
}: {
  pharmacyName: string;
  courierName: string;
  eta: string;
  distance: string;
  status: string;
}) {
  return (
    <View>
      <View style={s.flow}>
        <Text style={s.node}>📍 {pharmacyName}</Text>
        <Text style={s.arrow}>↓</Text>
        <Text style={s.truck}>🚚</Text>
        <Text style={s.arrow}>↓</Text>
        <Text style={s.node}>👤 Client</Text>
      </View>
      <Text style={s.kicker}>Votre livreur</Text>
      <Text style={s.name}>{courierName}</Text>
      <Text style={s.meta}>🚚 {status}</Text>
      <Text style={s.meta}>📍 {distance}</Text>
      <Text style={s.meta}>⏱️ Arrivée estimée : {eta}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  flow: { alignItems: 'center', paddingVertical: 8, gap: 4 },
  node: { fontWeight: '800', color: colors.text, textAlign: 'center' },
  arrow: { color: colors.muted, fontWeight: '800' },
  truck: { fontSize: 28 },
  kicker: { marginTop: 16, color: colors.muted, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 4 },
  meta: { color: colors.muted, marginTop: 6, fontWeight: '700' },
});
