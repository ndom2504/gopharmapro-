import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card } from '../src/components/UI';
import { ToggleRow } from '../src/components/Field';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { useNotifications, visibleFor } from '../src/store/notifications';
import { playNotifySound, notifyHaptic } from '../src/lib/notifySound';
import { notifyMeta } from '../src/lib/notifyUi';
import type { NotificationType } from '../src/lib/notifyUi';

function relativeTime(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'À l’instant';
  if (mins < 60) return 'Il y a ' + mins + ' min';
  const hours = Math.round(mins / 60);
  if (hours < 24) return 'Il y a ' + hours + ' h';
  return 'Il y a ' + Math.round(hours / 24) + ' j';
}

export default function NotificationsScreen() {
  const session = useAuth((s) => s.session);
  const items = useNotifications((s) => s.items);
  const prefs = useNotifications((s) => s.prefs);
  const setPrefs = useNotifications((s) => s.setPrefs);
  const markRead = useNotifications((s) => s.markRead);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const push = useNotifications((s) => s.push);

  const audience = session?.role || 'client';
  const targetId = session && session.role !== 'client' ? session.id : undefined;
  const list = visibleFor(items, audience, targetId);

  const testAlert = () => {
    const type: NotificationType = audience === 'client' ? 'catalog_new' : 'payment';
    push({
      audience,
      targetId,
      type,
      title: audience === 'pharmacy' ? 'Paiement reçu' : audience === 'courier' ? 'Course payée' : 'Nouveau médicament',
      body:
        audience === 'pharmacy'
          ? 'Test · 4 324 FCFA à verser sur le mobile money de l’officine.'
          : audience === 'courier'
            ? 'Test · 1 000 FCFA de livraison à verser sur votre mobile money.'
            : 'Test · Paracétamol 500 mg est disponible chez Pharmacie du Centre.',
    });
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>Notifications</Text>
      <Text style={s.meta}>
        {audience === 'pharmacy'
          ? 'Paiements encaissés et virements vers votre mobile money.'
          : audience === 'courier'
            ? 'Paiements de courses et virements livreur.'
            : 'Nouveaux médicaments et mises à jour de stock près de vous.'}
      </Text>

      <View style={{ marginTop: 16 }}>
        <ToggleRow
          label="Sonnerie"
          hint="Joue un son et une vibration à chaque alerte."
          value={prefs.sound}
          onChange={(sound) => setPrefs({ sound })}
        />
        <ToggleRow
          label="Pop-up"
          hint="Bandeau en haut de l’écran quand l’app est ouverte."
          value={prefs.popup}
          onChange={(popup) => setPrefs({ popup })}
        />
        <Text style={s.previewLabel}>Écouter les sonneries</Text>
        <View style={s.previewRow}>
          {(
            [
              ['payment', 'Paiement'],
              ['payout', 'Virement'],
              ['catalog_new', 'Médicament'],
            ] as [NotificationType, string][]
          ).map(([type, label]) => (
            <Pressable
              key={type}
              onPress={() => {
                playNotifySound(type);
                notifyHaptic(type);
              }}
              style={s.preview}
            >
              <Ionicons name={notifyMeta[type].icon} size={16} color={notifyMeta[type].color} />
              <Text style={s.previewText}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ marginTop: 8 }}>
          <Button title="Tester une alerte" kind="secondary" onPress={testAlert} />
        </View>
      </View>

      {audience === 'client' ? (
        <View style={{ marginTop: 8 }}>
          <ToggleRow
            label="Nouveaux produits"
            hint="Quand une pharmacie publie un médicament."
            value={prefs.newProducts}
            onChange={(newProducts) => setPrefs({ newProducts })}
          />
          <ToggleRow
            label="Stock"
            hint="Réapprovisionnement ou baisse de stock."
            value={prefs.stock}
            onChange={(stock) => setPrefs({ stock })}
          />
        </View>
      ) : null}

      {list.length > 0 ? (
        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <Button title="Tout marquer comme lu" kind="secondary" onPress={() => markAllRead(audience, targetId)} />
        </View>
      ) : null}

      {list.length === 0 ? (
        <Card style={{ marginTop: 12 }}>
          <Text style={s.empty}>Aucune notification pour le moment.</Text>
        </Card>
      ) : (
        list.map((n) => (
          <Pressable key={n.id} onPress={() => markRead(n.id)}>
            <Card style={{ marginTop: 12, opacity: n.read ? 0.72 : 1 }}>
              <View style={s.row}>
                <View style={[s.icon, { backgroundColor: notifyMeta[n.type].color + '22' }]}>
                  <Ionicons name={notifyMeta[n.type].icon} size={20} color={notifyMeta[n.type].color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.row}>
                    <Text style={s.itemTitle}>{n.title}</Text>
                    {!n.read ? <Badge text="Nouveau" tone="orange" /> : null}
                  </View>
                  <Text style={s.body}>{n.body}</Text>
                  <Text style={s.time}>{relativeTime(n.createdAt)}</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))
      )}

      {audience === 'pharmacy' ? (
        <Pressable onPress={() => router.push('/pharmacy-payouts')} style={{ marginTop: 20 }}>
          <Text style={s.link}>Voir les virements pharmacie</Text>
        </Pressable>
      ) : null}
      {audience === 'courier' ? (
        <Pressable onPress={() => router.push('/courier-earnings')} style={{ marginTop: 20 }}>
          <Text style={s.link}>Voir les gains livreur</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { flex: 1, fontWeight: '800', color: colors.text, fontSize: 16 },
  body: { color: colors.text, marginTop: 6, lineHeight: 20 },
  time: { color: colors.muted, marginTop: 8, fontSize: 12, fontWeight: '700' },
  empty: { color: colors.muted, fontWeight: '700' },
  link: { textAlign: 'center', color: colors.primary, fontWeight: '800' },
  previewLabel: { fontWeight: '800', color: colors.text, marginTop: 8, marginBottom: 10 },
  previewRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  preview: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  previewText: { fontWeight: '800', color: colors.text, fontSize: 11 },
});
