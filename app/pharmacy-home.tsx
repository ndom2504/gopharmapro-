import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';

const pipeline = [
  { id: 'signup', label: 'Inscription' },
  { id: 'docs', label: 'Documents envoyés' },
  { id: 'review', label: 'Vérification' },
  { id: 'decision', label: 'Approuvé / Rejeté' },
  { id: 'active', label: 'Pharmacie active' },
  { id: 'products', label: 'Ajout des produits' },
  { id: 'orders', label: 'Ouverture aux commandes' },
];

function pipelineIndex(status: 'pending' | 'verified' | 'rejected') {
  if (status === 'rejected') return 3;
  if (status === 'verified') return 6;
  return 2;
}

export default function PharmacyHome() {
  const session = useAuth((s) => s.session);
  const logout = useAuth((s) => s.logout);
  if (!session || session.role !== 'pharmacy') return <Redirect href={'/auth' as Href} />;

  const leave = () => {
    logout();
    router.replace('/auth' as Href);
  };

  const current = pipelineIndex(session.status);
  const pendingDocs = session.documents?.filter((d) => d.fileName && d.status === 'pending').length || 0;

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.kicker}>Espace pharmacie</Text>
      <Text style={s.title}>{session.pharmacyName}</Text>
      <View style={{ marginTop: 10 }}>
        <Badge
          text={session.status === 'verified' ? 'Compte vérifié' : session.status === 'rejected' ? 'Dossier rejeté' : 'Vérification en cours'}
          tone={session.status === 'verified' ? 'green' : session.status === 'rejected' ? 'red' : 'orange'}
        />
      </View>
      {session.status === 'pending' ? (
        <Card style={{ marginTop: 18, backgroundColor: '#FFF4E6', borderColor: '#FFD8A8' }}>
          <Text style={s.label}>Votre pharmacie</Text>
          <Text style={s.meta}>
            Votre demande d’inscription a bien été reçue. La pharmacie n’est pas visible sur la marketplace tant que l’administration n’a pas validé la structure.
          </Text>
        </Card>
      ) : null}

      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>Parcours d’activation</Text>
        {pipeline.map((item, i) => (
          <View key={item.id} style={s.flowRow}>
            <View style={[s.flowDot, i <= current && s.flowOn, i === current && session.status === 'pending' && s.flowNow]} />
            <Text style={[s.flowLabel, i > current && { color: colors.muted }]}>{item.label}</Text>
          </View>
        ))}
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>Deux niveaux de validation</Text>
        <Text style={s.value}>1. Validation de la pharmacie</Text>
        <Text style={s.meta}>L’administration vérifie que la structure est autorisée à utiliser la plateforme.</Text>
        <Text style={[s.value, { marginTop: 12 }]}>2. Validation des produits</Text>
        <Text style={s.meta}>
          Lorsqu’un médicament comme l’Amoxicilline 500 mg est ajouté avec « ordonnance : OUI », il suit le contrôle prévu. Puis : client → ordonnance → pharmacie → validation → paiement.
        </Text>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>Responsable</Text>
        <Text style={s.value}>{session.pharmacistName}</Text>
        <Text style={s.meta}>
          {session.managerRole === 'titulaire' ? 'Pharmacien titulaire' : session.managerRole === 'gerant' ? 'Gérant' : 'Responsable'}
          {session.professionalNumber ? ' · ' + session.professionalNumber : ''}
        </Text>
        <Text style={[s.label, { marginTop: 14 }]}>Adresse</Text>
        <Text style={s.value}>
          {session.address}
          {'\n'}
          {session.area}, {session.commune}, {session.city} ({session.province})
        </Text>
        {session.gpsConfirmed ? (
          <Text style={s.meta}>
            GPS {session.latitude.toFixed(5)}, {session.longitude.toFixed(5)}
          </Text>
        ) : null}
        <Text style={[s.label, { marginTop: 14 }]}>Contact</Text>
        <Text style={s.value}>
          {session.phone}
          {'\n'}
          {session.email}
        </Text>
      </Card>

      {session.documents?.length ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>Documents (privés)</Text>
          <Text style={s.meta}>{pendingDocs} document(s) en attente de vérification. Ils ne sont jamais affichés publiquement.</Text>
          {session.documents.filter((d) => d.fileName).map((d) => (
            <Text key={d.key} style={s.docLine}>
              {d.status === 'verified' ? '🟢' : d.status === 'rejected' ? '🔴' : '🟠'} {d.label}
            </Text>
          ))}
        </Card>
      ) : null}

      <View style={{ marginTop: 22 }}>
        <Button title="Se déconnecter" kind="secondary" onPress={leave} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 64, paddingBottom: 50 },
  kicker: { color: colors.primary, fontWeight: '800', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  label: { fontWeight: '800', color: colors.text, fontSize: 13 },
  value: { color: colors.text, marginTop: 4, lineHeight: 22, fontWeight: '700' },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  flowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 36, marginTop: 4 },
  flowDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  flowOn: { backgroundColor: '#8ED1B8' },
  flowNow: { backgroundColor: colors.warning },
  flowLabel: { fontWeight: '700', color: colors.text },
  docLine: { marginTop: 8, color: colors.text, fontWeight: '600' },
});
