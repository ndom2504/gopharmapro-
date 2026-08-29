import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { digitsOnly } from '../lib/deliveryCodes';

export function PinEntry({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const digits = digitsOnly(value);
  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View style={s.field}>
        <View style={s.slots} pointerEvents="none">
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[s.slot, digits[i] ? s.slotOn : null, error ? s.slotErr : null]}>
              <Text style={s.digit}>{digits[i] || ''}</Text>
            </View>
          ))}
        </View>
        <TextInput
          value={digits}
          onChangeText={(t) => onChange(digitsOnly(t))}
          keyboardType="number-pad"
          maxLength={6}
          caretHidden
          style={s.ghost}
          autoFocus={false}
        />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

export function CodeReveal({ label, code, hint }: { label: string; code: string; hint: string }) {
  return (
    <View style={s.reveal}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.code}>{code}</Text>
      <Text style={s.hint}>{hint}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 8 },
  label: { fontWeight: '800', color: colors.text, marginBottom: 8 },
  field: { position: 'relative', minHeight: 56 },
  ghost: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, color: 'transparent', zIndex: 2 },
  slots: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  slot: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotOn: { borderColor: colors.primary, backgroundColor: colors.mint },
  slotErr: { borderColor: colors.danger },
  digit: { fontSize: 22, fontWeight: '900', color: colors.text },
  error: { color: colors.danger, fontWeight: '700', marginTop: 8 },
  reveal: {
    backgroundColor: colors.mint,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.mintBorder,
    padding: 16,
    alignItems: 'center',
  },
  code: { fontSize: 34, fontWeight: '900', letterSpacing: 8, color: colors.primary, marginTop: 6 },
  hint: { color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
