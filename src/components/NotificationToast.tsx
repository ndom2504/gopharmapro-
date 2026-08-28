import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../theme';
import { useNotifications } from '../store/notifications';
import { notifyGlyph, notifyMeta } from '../lib/notifyUi';

export function NotificationToast() {
  const toast = useNotifications((s) => s.toast);
  const dismiss = useNotifications((s) => s.dismissToast);
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (!toast) return;
    slide.setValue(-120);
    Animated.spring(slide, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 8 }).start();
    const hide = setTimeout(() => {
      Animated.timing(slide, { toValue: -120, duration: 220, useNativeDriver: true }).start(() => dismiss());
    }, 4800);
    return () => clearTimeout(hide);
  }, [toast?.id]);

  if (!toast) return null;
  const meta = notifyMeta[toast.type];

  const open = () => {
    dismiss();
    router.push('/notifications');
  };

  return (
    <Animated.View pointerEvents="box-none" style={[s.wrap, { paddingTop: Math.max(insets.top, 12), transform: [{ translateY: slide }] }]}>
      <Pressable onPress={open} style={[s.card, { borderLeftColor: meta.color }]}>
        <Image source={notifyGlyph} style={s.icon} />
        <View style={{ flex: 1 }}>
          <Text style={s.kicker}>{meta.label}</Text>
          <Text style={s.title} numberOfLines={1}>
            {toast.title}
          </Text>
          <Text style={s.body} numberOfLines={2}>
            {toast.body}
          </Text>
        </View>
        <Pressable onPress={dismiss} hitSlop={10} style={s.close}>
          <Ionicons name="close" size={16} color={colors.muted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    ...shadow,
  },
  icon: { width: 44, height: 44, borderRadius: 22 },
  kicker: { color: colors.primary, fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  title: { fontWeight: '900', color: colors.text, fontSize: 15, marginTop: 2 },
  body: { color: colors.muted, marginTop: 3, lineHeight: 18, fontSize: 13 },
  close: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
