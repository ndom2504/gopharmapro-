import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../../src/components/UI';
import { AdminBar } from '../../src/components/AdminBar';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/store/auth';
import { PharmacyAccount } from '../../src/types';

export default function AdminPharmacyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuth((s) => s.session);
  const directory = useAuth((s) => s.directory);
  const setPharmacyStatus = useAuth((s) => s.setPharmacyStatus);
  const setDocumentStatus = useAuth((s) => s.setDocumentStatus);
  if (!session || session.role !== 'admin') return <Redirect href={'/auth' as Href} />;
  const pharmacy = directory.find((a): a is PharmacyAccount => a.role === 'pharmacy' && a.id === id);
  if (!pharmacy) {
    return (
      <ScrollView contentContainerStyle={s.page}>
        <AdminBar title="Dossier introuvable" />
      </ScrollView>
    );
  }
  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title={pharmacy.pharmacyName} />
      <View style={{ marginTop: 10 }}>
        <Badge
          text={pharmacy.status === 'verified' ? 'Vérifiée' : pharmacy.status === 'rejected' ? 'Rejetée' : 'En attente'}
          tone={pharmacy.status === 'verified' ? 'green' : pharmacy.status === 'rejected' ? 'red' : 'orange'}
        />
      </View>
      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>Responsable</Text>
        <Text style={s.value}>{pharmacy.pharmacistName}</Text>
        <Text style={s.meta}>{pharmacy.professionalNumber || 'N° professionnel non renseigné'}</Text>
        <Text style={[s.label, { marginTop: 12 }]}>Contact</Text>
        <Text style={s.value}>
          {pharmacy.phone}
          {'\n'}
          {pharmacy.email}
        </Text>
        <Text style={[s.label, { marginTop: 12 }]}>Adresse</Text>
        <Text style={s.value}>
          {pharmacy.address}
          {'\n'}
          {pharmacy.area}, {pharmacy.commune}, {pharmacy.city}
        </Text>
      </Card>
      <Card style={{ marginTop: 14 }}>
        <Text style={s.label}>Documents</Text>
        {(pharmacy.documents || []).map((d) => (
          <View key={d.key} style={s.doc}>
            <View style={{ flex: 1 }}>
              <Text style={s.value}>{d.label}</Text>
              <Text style={s.meta}>{d.fileName || 'Fichier manquant'}</Text>
            </View>
            <View style={s.docBtns}>
              <Text onPress={() => setDocumentStatus(pharmacy.id, d.key, 'verified')} style={s.ok}>
                OK
              </Text>
              <Text onPress={() => setDocumentStatus(pharmacy.id, d.key, 'rejected')} style={s.no}>
                Non
              </Text>
            </View>
          </View>
        ))}
      </Card>
      <View style={{ marginTop: 16, gap: 10 }}>
        <Button title="Approuver la pharmacie" onPress={() => setPharmacyStatus(pharmacy.id, 'verified')} />
        <Button title="Rejeter le dossier" kind="danger" onPress={() => setPharmacyStatus(pharmacy.id, 'rejected')} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  label: { fontWeight: '800', color: colors.text, fontSize: 13 },
  value: { color: colors.text, marginTop: 4, fontWeight: '700', lineHeight: 22 },
  meta: { color: colors.muted, marginTop: 4 },
  doc: { flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'center' },
  docBtns: { flexDirection: 'row', gap: 12 },
  ok: { color: colors.primary, fontWeight: '800' },
  no: { color: colors.danger, fontWeight: '800' },
});
