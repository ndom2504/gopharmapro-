import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card } from '../src/components/UI';
import { NotificationBell } from '../src/components/NotificationBell';
import { RoleTabBar, pharmacyTabs, useTabScreenPad } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { usePharmacyCatalog } from '../src/store/catalog';
import { totalsFor, usePayouts } from '../src/store/payouts';
import { useOrders } from '../src/store/orders';
import { usePrescriptions } from '../src/store/prescriptions';
import { formatFcfa } from '../src/lib/payouts';

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
  const items = usePharmacyCatalog((s) => s.items);
  const payouts = usePayouts((s) => s.items);
  const orders = useOrders((s) => s.orders);
  const rxItems = usePrescriptions((s) => s.items);
  const tabPad = useTabScreenPad();
  if (!session || session.role !== 'pharmacy') return <Redirect href={'/auth' as Href} />;

  const current = pipelineIndex(session.status);
  const pendingDocs = session.documents?.filter((d) => d.fileName && d.status === 'pending').length || 0;
  const catalog = items.filter((i) => i.pharmacyId === session.id);
  const verified = session.status === 'verified';
  const money = totalsFor(
    payouts.filter((p) => p.beneficiary === 'pharmacy'),
    session.id,
  );
  const jobs = orders.filter((o) => o.pharmacyAccountId === session.id && o.status !== 'delivered');
  const pendingRx = rxItems.filter((r) => r.pharmacyAccountId === session.id && (r.status === 'sent' || r.status === 'review'));

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={[s.page, { paddingBottom: tabPad }]}>
      <View style={s.top}>
        <View style={{ flex: 1 }}>
          <Text style={s.kicker}>Espace pharmacie</Text>
          <Text style={s.title}>{session.pharmacyName}</Text>
        </View>
        <NotificationBell />
      </View>
      <View style={[s.statusBanner, verified ? s.statusOk : session.status === 'rejected' ? s.statusNo : s.statusWait]}>
        <Ionicons
          name={verified ? 'checkmark-circle' : session.status === 'rejected' ? 'close-circle' : 'time'}
          size={22}
          color={verified ? colors.primary : session.status === 'rejected' ? colors.danger : colors.warning}
        />
        <View style={{ flex: 1 }}>
          <Text style={s.statusTitle}>
            {verified ? 'Pharmacie vérifiée' : session.status === 'rejected' ? 'Dossier rejeté' : 'Vérification en cours'}
          </Text>
          <Text style={s.statusMeta}>
            {verified
              ? 'Compte accepté. Vous pouvez ajouter des produits et recevoir des commandes.'
              : session.status === 'rejected'
                ? 'La structure n’est pas autorisée à vendre sur Go Pharma Pro.'
                : 'La pharmacie n’est pas visible tant que l’administration n’a pas validé le dossier.'}
          </Text>
        </View>
        <Badge
          text={verified ? 'Vérifié' : session.status === 'rejected' ? 'Rejeté' : 'En attente'}
          tone={verified ? 'green' : session.status === 'rejected' ? 'red' : 'orange'}
        />
      </View>

      {verified ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>Paiements</Text>
          <Text style={s.meta}>
            {formatFcfa(money.pending)} en attente de virement · {formatFcfa(money.sent)} déjà versés.
          </Text>
          <View style={{ marginTop: 14 }}>
            <Button title="Voir les virements" onPress={() => router.push('/pharmacy-payouts')} />
          </View>
        </Card>
      ) : null}

      {verified ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>Ordonnances</Text>
          <Text style={s.meta}>
            {pendingRx.length
              ? pendingRx.length + ' fichier(s) à valider. Le client ne peut pas payer tant que vous n’avez pas décidé.'
              : 'Aucune ordonnance en attente.'}
          </Text>
          <View style={{ marginTop: 14 }}>
            <Button title="Voir les ordonnances" onPress={() => router.push('/pharmacy-prescriptions')} />
          </View>
        </Card>
      ) : null}

      {verified ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>Commandes</Text>
          <Text style={s.meta}>
            {jobs.length
              ? jobs.length + ' commande(s) en cours (retrait ou livraison).'
              : 'Les clients peuvent retirer en pharmacie ou demander un livreur.'}
          </Text>
          <View style={{ marginTop: 14 }}>
            <Button title="Voir les commandes" onPress={() => router.push('/pharmacy-orders')} />
          </View>
        </Card>
      ) : null}

      {verified ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>Catalogue</Text>
          <Text style={s.meta}>{catalog.length} produit(s) dans votre officine.</Text>
          <View style={{ marginTop: 14 }}>
            <Button title="Gérer les produits" onPress={() => router.push('/pharmacy-catalog')} />
          </View>
        </Card>
      ) : (
        <Card style={{ marginTop: 16, backgroundColor: '#FFF4E6', borderColor: '#FFD8A8' }}>
          <Text style={s.label}>Ajout de produits</Text>
          <Text style={s.meta}>Disponible uniquement après acceptation du dossier (badge Vérifié).</Text>
        </Card>
      )}

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
          <Text style={s.meta}>{pendingDocs} document(s) en attente de vérification.</Text>
          {session.documents.filter((d) => d.fileName).map((d) => (
            <Text key={d.key} style={s.docLine}>
              {d.status === 'verified' ? '🟢' : d.status === 'rejected' ? '🔴' : '🟠'} {d.label}
            </Text>
          ))}
        </Card>
      ) : null}
    </ScrollView>
      <RoleTabBar items={pharmacyTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 64 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  kicker: { color: colors.primary, fontWeight: '800', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text },
  statusBanner: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusOk: { backgroundColor: colors.mint, borderColor: colors.mintBorder },
  statusWait: { backgroundColor: '#FFF4E6', borderColor: '#FFD8A8' },
  statusNo: { backgroundColor: '#FFF0F0', borderColor: '#F5C2C7' },
  statusTitle: { fontWeight: '800', color: colors.text },
  statusMeta: { color: colors.muted, marginTop: 3, lineHeight: 18, fontSize: 13 },
  label: { fontWeight: '800', color: colors.text, fontSize: 13 },
  value: { color: colors.text, marginTop: 4, lineHeight: 22, fontWeight: '700' },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  flowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 36, marginTop: 4 },
  flowDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  flowOn: { backgroundColor: colors.mintBorder },
  flowNow: { backgroundColor: colors.warning },
  flowLabel: { fontWeight: '700', color: colors.text },
  docLine: { marginTop: 8, color: colors.text, fontWeight: '600' },
});
