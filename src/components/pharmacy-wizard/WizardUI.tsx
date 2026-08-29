import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '../../theme';
import { DocumentStatus, OpeningDay, Weekday } from '../../types';
import { WEEKDAYS } from '../../pharmacy-onboarding/defaults';
import { Button } from '../UI';

export function StepHeader({
  step,
  total = 6,
  title,
  subtitle,
}: {
  step: number;
  total?: number;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={s.dots}>
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <View key={n} style={[s.dot, n <= step && s.dotOn, n === step && s.dotNow]} />
        ))}
      </View>
      <Text style={s.stepNo}>0{step} — {step}/{total}</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.sub}>{subtitle}</Text>
    </View>
  );
}

export function MapPinCard({
  latitude,
  longitude,
  confirmed,
  loading,
  onUseLocation,
  onConfirm,
}: {
  latitude: number;
  longitude: number;
  confirmed: boolean;
  loading: boolean;
  onUseLocation: () => void;
  onConfirm: () => void;
}) {
  const uri = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=16&size=640x360&markers=${latitude},${longitude},red-pushpin`;
  return (
    <View>
      <Button title={loading ? 'Localisation…' : '📍 Utiliser ma position actuelle'} kind="secondary" onPress={onUseLocation} disabled={loading} />
      <View style={s.map}>
        <Image source={{ uri }} style={s.mapImg} />
        <View style={s.pin}>
          <Text style={{ fontSize: 28 }}>📍</Text>
          <Text style={s.pinLabel}>Pharmacie</Text>
        </View>
      </View>
      <Text style={s.coords}>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
      <Text style={s.osm}>© OpenStreetMap</Text>
      <View style={{ marginTop: 10 }}>
        <Button title={confirmed ? 'Position confirmée' : 'Confirmer cette position'} onPress={onConfirm} kind={confirmed ? 'secondary' : 'primary'} />
      </View>
    </View>
  );
}

export function HoursTable({
  hours,
  onChange,
}: {
  hours: Record<Weekday, OpeningDay>;
  onChange: (day: Weekday, next: OpeningDay) => void;
}) {
  return (
    <View style={s.table}>
      <View style={s.thead}>
        <Text style={[s.th, { flex: 1.2 }]}>Jour</Text>
        <Text style={[s.th, { flex: 1 }]}>Ouverture</Text>
        <Text style={[s.th, { flex: 1 }]}>Fermeture</Text>
      </View>
      {WEEKDAYS.map(({ id, label }) => {
        const row = hours[id];
        return (
          <View key={id} style={s.trow}>
            <Pressable onPress={() => onChange(id, { ...row, closed: !row.closed })} style={{ flex: 1.2 }}>
              <Text style={s.day}>{label}</Text>
              <Text style={s.closed}>{row.closed ? 'Fermé' : 'Ouvert'}</Text>
            </Pressable>
            {row.closed ? (
              <Text style={[s.dash, { flex: 2 }]}>—</Text>
            ) : (
              <>
                <TextInput value={row.open} onChangeText={(open) => onChange(id, { ...row, open })} style={s.time} />
                <TextInput value={row.close} onChangeText={(close) => onChange(id, { ...row, close })} style={s.time} />
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

export function DocRow({
  label,
  required,
  fileName,
  status,
  onPick,
}: {
  label: string;
  required: boolean;
  fileName?: string;
  status: DocumentStatus;
  onPick: () => void;
}) {
  const tone = status === 'verified' ? colors.primary : status === 'rejected' ? colors.danger : colors.warning;
  const tag = status === 'verified' ? 'Vérifié' : status === 'rejected' ? 'Rejeté' : 'En attente';
  return (
    <Pressable onPress={onPick} style={s.doc}>
      <Ionicons name="document-attach-outline" size={22} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={s.docLabel}>
          {label}
          {required ? ' *' : ''}
        </Text>
        <Text style={s.docFile}>{fileName || 'PDF, JPG ou PNG — non public'}</Text>
      </View>
      <View style={[s.docBadge, { backgroundColor: status === 'verified' ? colors.mint : status === 'rejected' ? '#FFF0F0' : '#FFF4E6' }]}>
        <Text style={{ color: tone, fontWeight: '800', fontSize: 11 }}>{tag}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  dot: { flex: 1, height: 4, borderRadius: 99, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.mintBorder },
  dotNow: { backgroundColor: colors.primary },
  stepNo: { color: colors.primary, fontWeight: '800', marginBottom: 6 },
  title: { fontSize: 24, fontWeight: '900', color: colors.text },
  sub: { color: colors.muted, marginTop: 8, lineHeight: 20 },
  map: {
    height: 210,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 14,
    backgroundColor: '#D7EDE4',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  mapImg: { width: '100%', height: '100%' },
  pin: { position: 'absolute', left: 0, right: 0, top: 58, alignItems: 'center' },
  pinLabel: { fontWeight: '800', color: colors.text, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden', marginTop: 2 },
  coords: { marginTop: 10, fontWeight: '700', color: colors.text },
  osm: { color: colors.muted, fontSize: 11, marginTop: 2 },
  table: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 14, overflow: 'hidden' },
  thead: { flexDirection: 'row', padding: 12, backgroundColor: colors.mint },
  th: { fontWeight: '800', color: colors.text, fontSize: 12 },
  trow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, gap: 8 },
  day: { fontWeight: '800', color: colors.text },
  closed: { color: colors.muted, fontSize: 12, marginTop: 2 },
  dash: { color: colors.muted, fontWeight: '700' },
  time: { flex: 1, height: 40, borderWidth: 1, borderColor: colors.border, borderRadius: 10, textAlign: 'center', fontWeight: '700', color: colors.text },
  doc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  docLabel: { fontWeight: '800', color: colors.text },
  docFile: { color: colors.muted, marginTop: 3, fontSize: 12 },
  docBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
});
