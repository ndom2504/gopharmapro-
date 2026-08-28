import React from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { formatPhoneInput } from '../data/payments';

export function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  keyboardType,
  secure = false,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url' | 'number-pad' | 'decimal-pad';
  secure?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const [hidden, setHidden] = React.useState(secure);
  return (
    <View style={s.wrap}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={[s.box, error ? { borderColor: colors.danger } : null]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#89958F"
          keyboardType={keyboardType}
          secureTextEntry={hidden}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={s.input}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

export function PhoneField({
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
  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.box, error ? { borderColor: colors.danger } : null]}>
        <Text style={s.prefix}>+241</Text>
        <TextInput
          value={value}
          onChangeText={(v) => onChange(formatPhoneInput(v))}
          placeholder="77 12 34 56"
          placeholderTextColor="#89958F"
          keyboardType="phone-pad"
          style={s.input}
        />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

export function ChoiceChips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <View style={s.chips}>
      {options.map((opt) => {
        const on = value === opt.id;
        return (
          <Pressable key={opt.id} onPress={() => onChange(opt.id)} style={[s.chip, on && s.chipOn]}>
            <Text style={on ? s.chipOnText : s.chipText}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={s.toggle}>
      <View style={{ flex: 1 }}>
        <Text style={s.toggleLabel}>{label}</Text>
        <Text style={s.hint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: '#8ED1B8' }}
        thumbColor={value ? colors.primary : '#f4f4f4'}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontWeight: '800', color: colors.text, marginBottom: 8 },
  box: {
    minHeight: 54,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 14 },
  error: { color: colors.danger, fontWeight: '700', marginTop: 6, fontSize: 12 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  toggleLabel: { fontWeight: '800', color: colors.text },
  hint: { color: colors.muted, marginTop: 3, fontSize: 12, lineHeight: 18 },
  prefix: { fontWeight: '800', color: colors.text, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: '700', color: colors.text, fontSize: 13 },
  chipOnText: { fontWeight: '800', color: '#fff', fontSize: 13 },
});
