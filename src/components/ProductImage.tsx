import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { productPhoto } from '../lib/productPhotos';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Médicaments: 'medical',
  Hygiène: 'sparkles',
  Bébé: 'happy',
  'Premiers soins': 'bandage',
  Vitamines: 'nutrition',
  Parapharmacie: 'leaf',
};

type Size = 'thumb' | 'card' | 'hero';

const box: Record<Size, { w: number; h: number; r: number; icon: number; pad: number }> = {
  thumb: { w: 80, h: 80, r: 16, icon: 26, pad: 8 },
  card: { w: 108, h: 108, r: 18, icon: 32, pad: 10 },
  hero: { w: 0, h: 240, r: 24, icon: 54, pad: 16 },
};

export function ProductImage({
  uris,
  imageKey,
  category,
  size = 'card',
}: {
  uris?: string[];
  imageKey?: string;
  category?: string;
  size?: Size;
}) {
  const uploaded = uris?.find(Boolean);
  const bundled = productPhoto(imageKey);
  const dim = box[size];
  const wrap =
    size === 'hero'
      ? { height: dim.h, width: '100%' as const, borderRadius: dim.r, marginBottom: 18, padding: dim.pad }
      : { width: dim.w, height: dim.h, borderRadius: dim.r, padding: dim.pad };
  const frame = [s.frame, wrap];
  if (uploaded) {
    return (
      <View style={frame}>
        <Image source={{ uri: uploaded }} style={s.fill} resizeMode="contain" />
      </View>
    );
  }
  if (bundled) {
    return (
      <View style={frame}>
        <Image source={bundled} style={s.fill} resizeMode="contain" />
      </View>
    );
  }
  return (
    <View style={[s.ph, wrap]}>
      <Ionicons name={icons[category || ''] || 'medkit'} size={dim.icon} color={colors.primary} />
      {size === 'hero' ? <Text style={s.phText}>Photo du produit</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  frame: { backgroundColor: colors.mint, overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  ph: { backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  phText: { marginTop: 8, color: colors.primary, fontWeight: '800' },
});
