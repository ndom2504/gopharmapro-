import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { methodLabel, totalsFor, usePayouts } from '../src/store/payouts';
import { useNotifications } from '../src/store/notifications';
import { formatFcfa, payoutMethodForPhone } from '../src/lib/payouts';
import { getPaymentMethod } from '../src/data/payments';

export default function CourierEarnings() {
  const session = useAuth((s) => s.session);
  const items = usePayouts((s) => s.items);
  const markSent = usePayouts((s) => s.markSent);
  const push = useNotifications((s) => s.push);
  if (!session || session.role !== 'courier') return <Redirect href={'/auth' as Href} />;

  const mine = items.filter((p) => p.beneficiary === 'courier' && p.accountId === session.id);
  const totals = totalsFor(mine, session.id);
  const method = getPaymentMethod(mine[0]?.method || payoutMethodForPhone(session.phone));

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>Gains livreur</Text>
      <Text style={s.meta}>
        Quand un client paie une commande livrable, les frais de livraison vous sont réservés, puis versés sur votre mobile money.
      </Text>

      <Card style={{ marginTop: 16, backgroundColor: colors.mint, borderColor: '#BCE9D8' }}>
        <Text style={s.label}>À recevoir</Text>
        <Text style={s.amount}>{formatFcfa(totals.pending)}</Text>
        <Text style={s.meta}>Déjà versé : {formatFcfa(totals.sent)}</Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={s.label}>Comment vous êtes payés</Text>
        <Text style={s.step}>1. Le client paie Go Pharma Pro (produits + livraison).</Text>
        <Text style={s.step}>2. Les frais de livraison vous sont attribués dès la confirmation du paiement.</Text>
        <Text style={s.step}>
          3. Le virement part vers {method.name} {session.phone || 'votre numéro enregistré'}.
        </Text>
      </Card>

      {mine.length === 0 ? (
        <Card style={{ marginTop: 14 }}>
          <Text style={s.empty}>Aucune course payée pour le moment.</Text>
        </Card>
      ) : (
        mine.map((p) => (
          <Card key={p.id} style={{ marginTop: 12 }}>
            <View style={s.row}>
              <Text style={s.value}>Commande {p.orderId}</Text>
              <Badge text={p.status === 'sent' ? 'Versé' : 'En attente'} tone={p.status === 'sent' ? 'green' : 'orange'} />
            </View>
            <Text style={s.amountSmall}>{formatFcfa(p.amount)}</Text>
            <Text style={s.meta}>
              {methodLabel(p.method)} · {p.phone || session.phone}
            </Text>
            {p.status === 'pending' ? (
              <View style={{ marginTop: 12 }}>
                <Button
                  title="Confirmer le virement"
                  kind="secondary"
                  onPress={() => {
                    markSent(p.id);
                    push({
                      audience: 'courier',
                      targetId: session.id,
                      type: 'payout',
                      title: 'Virement livreur',
                      body: formatFcfa(p.amount) + ' versés sur ' + methodLabel(p.method) + '.',
                    });
                  }}
                />
              </View>
            ) : null}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  label: { fontWeight: '800', color: colors.text, fontSize: 13 },
  amount: { fontSize: 28, fontWeight: '900', color: colors.primary, marginTop: 6 },
  amountSmall: { fontSize: 20, fontWeight: '900', color: colors.primary, marginTop: 8 },
  value: { fontWeight: '800', color: colors.text, flex: 1 },
  step: { color: colors.text, marginTop: 10, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  empty: { color: colors.muted, fontWeight: '700', lineHeight: 20 },
});
