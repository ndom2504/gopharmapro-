import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Card, SearchBox, ScreenTitle } from '../../src/components/UI';
import { ProductImage } from '../../src/components/ProductImage';
import { LocationBar } from '../../src/components/LocationBar';
import { colors } from '../../src/theme';
import { useGeoCatalog } from '../../src/hooks/useGeoCatalog';
import { formatKm } from '../../src/lib/geo';

export default function Search() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(params.q || '');
  const [sort, setSort] = useState<'distance' | 'price'>('distance');
  const { locatedProducts, status, address, outsideGabon, refresh } = useGeoCatalog();
  const results = useMemo(
    () =>
      locatedProducts
        .filter((p) =>
          (p.name + ' ' + p.genericName + ' ' + p.category)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .includes(q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')),
        )
        .flatMap((p) => p.offers.filter((o) => o.stock > 0).map((o) => ({ p, o })))
        .sort((a, b) => (sort === 'price' ? a.o.price - b.o.price : a.o.pharmacy.distance - b.o.pharmacy.distance)),
    [q, sort, locatedProducts],
  );
  return (
    <ScrollView contentContainerStyle={s.page}>
      <ScreenTitle title="Rechercher" subtitle="Comparez prix, stock et distance." />
      <LocationBar status={status} address={address} outsideGabon={outsideGabon} onPress={refresh} />
      <SearchBox value={q} onChange={setQ} />
      <View style={s.filters}>
        <Pressable onPress={() => setSort('distance')} style={[s.chip, sort === 'distance' && s.active]}>
          <Text style={sort === 'distance' ? s.activeText : s.chipText}>Plus proche</Text>
        </Pressable>
        <Pressable onPress={() => setSort('price')} style={[s.chip, sort === 'price' && s.active]}>
          <Text style={sort === 'price' ? s.activeText : s.chipText}>Moins cher</Text>
        </Pressable>
      </View>
      <Text style={s.count}>{results.length} offre(s)</Text>
      {results.map(({ p, o }) => (
        <Pressable key={o.id} onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}>
          <Card style={{ marginBottom: 12 }}>
            <View style={s.row}>
              <ProductImage uris={p.imageUris} imageKey={p.imageKey || p.id} category={p.category} size="thumb" />
              <View style={{ flex: 1 }}>
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{p.name}</Text>
                    <Text style={s.pharmacy}>{o.pharmacy.name}</Text>
                  </View>
                  {p.requiresPrescription ? <Badge text="Ordonnance" tone="red" /> : <Badge text="Disponible" />}
                </View>
                <View style={[s.row, { marginTop: 14 }]}>
                  <View>
                    <Text style={s.price}>{o.price.toLocaleString('fr-FR')} FCFA</Text>
                    <Text style={s.meta}>
                      Stock {o.stock} · {formatKm(o.pharmacy.distance)}
                    </Text>
                  </View>
                  <Text style={s.command}>Commander ›</Text>
                </View>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}
      {!results.length ? (
        <Card>
          <Text style={s.name}>Aucun résultat</Text>
          <Text style={s.meta}>Essayez un nom, un dosage ou une catégorie.</Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 110 },
  filters: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '700' },
  activeText: { color: colors.onPrimary, fontWeight: '800' },
  count: { color: colors.muted, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  pharmacy: { marginTop: 5, color: colors.muted },
  price: { fontSize: 18, fontWeight: '900', color: colors.primary },
  meta: { fontSize: 13, color: colors.muted, marginTop: 4 },
  command: { color: colors.primary, fontWeight: '800' },
});
