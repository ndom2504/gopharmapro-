import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { RoleTabBar, pharmacyTabs } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { methodLabel, totalsFor, usePayouts } from '../src/store/payouts';
import { useNotifications } from '../src/store/notifications';
import { formatFcfa, PLATFORM_COMMISSION, payoutMethodForPhone } from '../src/lib/payouts';
import { getPaymentMethod } from '../src/data/payments';

export default function PharmacyPayouts() {
  const session = useAuth((s) => s.session);
  const items = usePayouts((s) => s.items);
  const markSent = usePayouts((s) => s.markSent);
  const push = useNotifications((s) => s.push);
  if (!session || session.role !== 'pharmacy') return <Redirect href={'/auth' as Href} />;

  const mine = items.filter((p) => p.beneficiary === 'pharmacy' && p.accountId === session.id);
  const totals = totalsFor(mine, session.id);
  const phone = session.phone;
  const method = getPaymentMethod(mine[0]?.method || payoutMethodForPhone(phone));
  const pct = Math.round(PLATFORM_COMMISSION * 100);

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>Ventes</Text>
      <Text style={s.meta}>
        Le client paie Go Pharma Pro par mobile money. Votre part est ensuite versée sur le numéro de l’officine.
      </Text>

      <Card style={{ marginTop: 16, backgroundColor: colors.mint, borderColor: '#BCE9D8' }}>
        <Text style={s.label}>Solde à recevoir</Text>
        <Text style={s.amount}>{formatFcfa(totals.pending)}</Text>
        <Text style={s.meta}>Déjà versé : {formatFcfa(totals.sent)}</Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={s.label}>Comment vous êtes payés</Text>
        <Text style={s.step}>1. Le client valide le paiement (MobiCash, Airtel Money ou Moov Money) au marchand Go Pharma Pro.</Text>
        <Text style={s.step}>2. La plateforme encaisse le total (médicaments + livraison).</Text>
        <Text style={s.step}>
          3. Votre part = prix des produits − {pct} % de commission, versée sur {method.name} {phone}.
        </Text>
        <Text style={s.step}>4. Les frais de livraison sont versés au livreur, pas à la pharmacie.</Text>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <Text style={s.label}>Compte de virement</Text>
        <Text style={s.value}>{phone}</Text>
        <Text style={s.meta}>{method.name} · {method.operator} · {method.ussd}</Text>
      </Card>

      {mine.length === 0 ? (
        <Card style={{ marginTop: 14 }}>
          <Text style={s.empty}>Aucun paiement pour le moment. Ils apparaissent dès qu’un client règle une commande.</Text>
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
              {methodLabel(p.method)} · {p.phone}
            </Text>
            {p.status === 'pending' ? (
              <View style={{ marginTop: 12 }}>
                <Button
                  title="Confirmer le virement"
                  kind="secondary"
                  onPress={() => {
                    markSent(p.id);
                    push({
                      audience: 'pharmacy',
                      targetId: session.id,
                      type: 'payout',
                      title: 'Virement effectué',
                      body: formatFcfa(p.amount) + ' versés sur ' + methodLabel(p.method) + ' (' + p.phone + ').',
                    });
                  }}
                />
              </View>
            ) : null}
          </Card>
        ))
      )}
    </ScrollView>
      <RoleTabBar items={pharmacyTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  label: { fontWeight: '800', color: colors.text, fontSize: 13 },
  amount: { fontSize: 28, fontWeight: '900', color: colors.primary, marginTop: 6 },
  amountSmall: { fontSize: 20, fontWeight: '900', color: colors.primary, marginTop: 8 },
  value: { fontWeight: '800', color: colors.text, marginTop: 4, flex: 1 },
  step: { color: colors.text, marginTop: 10, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  empty: { color: colors.muted, fontWeight: '700', lineHeight: 20 },
});
