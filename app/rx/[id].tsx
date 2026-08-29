import { useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card } from '../../src/components/UI';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/store/auth';
import { usePrescriptions, rxStatusLabel, rxStatusTone } from '../../src/store/prescriptions';

export default function RxDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuth((s) => s.session);
  const rx = usePrescriptions((s) => s.items.find((r) => r.id === id));
  const setStatus = usePrescriptions((s) => s.setStatus);
  const [note, setNote] = useState('');

  if (!rx) {
    return (
      <View style={s.page}>
        <Text style={s.title}>Ordonnance introuvable</Text>
        <Button title="Retour" onPress={() => router.back()} />
      </View>
    );
  }

  const isPharmacy = session?.role === 'pharmacy' && session.id === rx.pharmacyAccountId;
  const isClient = session?.role === 'client' && session.id === rx.clientId;
  if (session && !isPharmacy && !isClient && session.role !== 'admin') {
    return <Redirect href={'/auth' as Href} />;
  }

  const openPdf = () => {
    Linking.openURL(rx.fileUri).catch(() => Alert.alert('Fichier', 'Impossible d’ouvrir ce PDF.'));
  };

  const decide = (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !note.trim()) {
      Alert.alert('Motif', 'Indiquez pourquoi l’ordonnance est refusée (illisible, incomplète…).');
      return;
    }
    setStatus(rx.id, status, note.trim() || undefined);
    Alert.alert(status === 'approved' ? 'Validée' : 'Refusée', 'Le client est notifié.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.row}>
        <Text style={s.title}>{rx.fileName}</Text>
        <Badge text={rxStatusLabel[rx.status]} tone={rxStatusTone[rx.status]} />
      </View>
      <Text style={s.meta}>🏥 {rx.pharmacyName}</Text>
      <Text style={s.meta}>👤 {rx.clientName}</Text>
      <Text style={s.meta}>{new Date(rx.createdAt).toLocaleString('fr-GA')}</Text>
      {rx.products.length ? <Text style={s.meta}>{rx.products.join(', ')}</Text> : null}
      {rx.note ? <Text style={s.reject}>{rx.note}</Text> : null}

      <Card style={{ marginTop: 16 }}>
        {rx.kind === 'image' ? (
          <Image source={{ uri: rx.fileUri }} style={s.preview} resizeMode="contain" />
        ) : (
          <View style={s.pdf}>
            <Ionicons name="document-text" size={36} color={colors.primary} />
            <Text style={s.meta}>Document PDF</Text>
            <View style={{ marginTop: 12, alignSelf: 'stretch' }}>
              <Button title="Ouvrir le PDF" kind="secondary" onPress={openPdf} />
            </View>
          </View>
        )}
      </Card>

      {isPharmacy && (rx.status === 'sent' || rx.status === 'review') ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>Décision</Text>
          <Text style={s.meta}>Vérifiez la lisibilité, le nom du patient et les médicaments.</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Motif en cas de refus"
            placeholderTextColor={colors.muted}
            style={s.input}
            multiline
          />
          <View style={{ marginTop: 12 }}>
            <Button title="Valider l’ordonnance" onPress={() => decide('approved')} />
          </View>
          <View style={{ marginTop: 10 }}>
            <Button title="Refuser" kind="danger" onPress={() => decide('rejected')} />
          </View>
        </Card>
      ) : null}

      {isClient && rx.status === 'rejected' ? (
        <View style={{ marginTop: 16 }}>
          <Button title="Renvoyer une ordonnance" onPress={() => router.push('/prescription')} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 48 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' },
  title: { fontSize: 22, fontWeight: '900', color: colors.text, flex: 1 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  label: { fontWeight: '800', color: colors.text },
  reject: { color: colors.danger, fontWeight: '700', marginTop: 8 },
  preview: { width: '100%', height: 360, backgroundColor: '#F3F7F4', borderRadius: 12 },
  pdf: { alignItems: 'center', paddingVertical: 20 },
  input: {
    marginTop: 12,
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    color: colors.text,
    fontWeight: '600',
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
});
