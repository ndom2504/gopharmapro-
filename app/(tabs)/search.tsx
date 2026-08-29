import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Card, SearchBox, ScreenTitle } from '../../src/components/UI';
import { ProductImage } from '../../src/components/ProductImage';
import { LocationBar } from '../../src/components/LocationBar';
import { colors } from '../../src/theme';
import { useGeoCatalog } from '../../src/hooks/useGeoCatalog';
import { formatKm } from '../../src/lib/geo';
import {
  catalogCategories,
  regulatoryLabel,
  regulatoryStatuses,
  regulatoryTone,
  resolveStatus,
  sameCategory,
  subcategoriesOf,
  type RegulatoryStatus,
} from '../../src/lib/taxonomy';

export default function Search() {
  const params = useLocalSearchParams<{ q?: string; cat?: string }>();
  const [q, setQ] = useState(params.q || '');
  const [cat, setCat] = useState(params.cat || '');
  const [sub, setSub] = useState('');
  const [rx, setRx] = useState<'' | RegulatoryStatus>('');
  const [sort, setSort] = useState<'distance' | 'price'>('distance');
  const { locatedProducts, status, address, outsideGabon, refresh } = useGeoCatalog();

  useEffect(() => {
    if (typeof params.q === 'string') setQ(params.q);
    if (typeof params.cat === 'string') {
      setCat(params.cat);
      setSub('');
    }
  }, [params.q, params.cat]);
  const subs = cat ? subcategoriesOf(cat) : [];

  const results = useMemo(
    () =>
      locatedProducts
        .filter((p) => {
          if (cat && !sameCategory(p.category, cat)) return false;
          if (sub && p.subcategory !== sub) return false;
          const st = resolveStatus(p);
          if (rx && st !== rx) return false;
          const hay = `${p.name} ${p.genericName} ${p.category} ${p.subcategory || ''}`
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          const needle = q
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          return !needle || hay.includes(needle);
        })
        .flatMap((p) => p.offers.filter((o) => o.stock > 0).map((o) => ({ p, o })))
        .sort((a, b) => (sort === 'price' ? a.o.price - b.o.price : a.o.pharmacy.distance - b.o.pharmacy.distance)),
    [q, cat, sub, rx, sort, locatedProducts],
  );

  const pickCat = (name: string) => {
    setCat(name);
    setSub('');
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <ScreenTitle title="Rechercher" subtitle="Catégorie commerciale et statut réglementaire sont séparés." />
      <LocationBar status={status} address={address} outsideGabon={outsideGabon} onPress={refresh} />
      <SearchBox value={q} onChange={setQ} />
      <Text style={s.group}>Catégorie</Text>
      <View style={s.filters}>
        <Pressable onPress={() => pickCat('')} style={[s.chip, !cat && s.active]}>
          <Text style={!cat ? s.activeText : s.chipText}>Toutes</Text>
        </Pressable>
        {catalogCategories.map((name) => (
          <Pressable key={name} onPress={() => pickCat(name)} style={[s.chip, cat === name && s.active]}>
            <Text style={cat === name ? s.activeText : s.chipText}>{name}</Text>
          </Pressable>
        ))}
      </View>
      {subs.length ? (
        <>
          <Text style={s.group}>Sous-catégorie</Text>
          <View style={s.filters}>
            <Pressable onPress={() => setSub('')} style={[s.chip, !sub && s.ink]}>
              <Text style={!sub ? s.inkText : s.chipText}>Toutes</Text>
            </Pressable>
            {subs.map((name) => (
              <Pressable key={name} onPress={() => setSub(name)} style={[s.chip, sub === name && s.ink]}>
                <Text style={sub === name ? s.inkText : s.chipText}>{name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
      <Text style={s.group}>Statut réglementaire</Text>
      <View style={s.filters}>
        <Pressable onPress={() => setRx('')} style={[s.chip, !rx && s.active]}>
          <Text style={!rx ? s.activeText : s.chipText}>Tous</Text>
        </Pressable>
        {regulatoryStatuses.map((sItem) => (
          <Pressable key={sItem.id} onPress={() => setRx(sItem.id)} style={[s.chip, rx === sItem.id && s.active]}>
            <Text style={rx === sItem.id ? s.activeText : s.chipText}>{sItem.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.filters}>
        <Pressable onPress={() => setSort('distance')} style={[s.chip, sort === 'distance' && s.active]}>
          <Text style={sort === 'distance' ? s.activeText : s.chipText}>Plus proche</Text>
        </Pressable>
        <Pressable onPress={() => setSort('price')} style={[s.chip, sort === 'price' && s.active]}>
          <Text style={sort === 'price' ? s.activeText : s.chipText}>Moins cher</Text>
        </Pressable>
      </View>
      <Text style={s.count}>{results.length} offre(s)</Text>
      {results.map(({ p, o }) => {
        const st = resolveStatus(p);
        return (
          <Pressable key={o.id} onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}>
            <Card style={{ marginBottom: 12 }}>
              <View style={s.row}>
                <ProductImage uris={p.imageUris} imageKey={p.imageKey || p.id} category={p.category} size="thumb" />
                <View style={{ flex: 1 }}>
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.name}>{p.name}</Text>
                      <Text style={s.pharmacy}>
                        {p.category}
                        {p.subcategory ? ` · ${p.subcategory}` : ''}
                      </Text>
                      <Text style={s.pharmacy}>{o.pharmacy.name}</Text>
                    </View>
                    <Badge text={regulatoryLabel(st)} tone={regulatoryTone(st)} />
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
        );
      })}
      {!results.length ? (
        <Card>
          <Text style={s.name}>Aucun résultat</Text>
          <Text style={s.meta}>Essayez un nom, une catégorie ou un statut réglementaire.</Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 110 },
  group: { marginTop: 14, marginBottom: 8, fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  ink: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  activeText: { color: colors.onPrimary, fontWeight: '800', fontSize: 12 },
  inkText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  count: { color: colors.muted, marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  pharmacy: { marginTop: 5, color: colors.muted, fontSize: 13 },
  price: { fontSize: 18, fontWeight: '900', color: colors.text },
  meta: { fontSize: 13, color: colors.muted, marginTop: 4 },
  command: { color: colors.text, fontWeight: '800' },
});
