import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme';
import { useAuth } from '../store/auth';
import { useNotifications, visibleFor } from '../store/notifications';
import { notifyGlyph } from '../lib/notifyUi';

export function NotificationBell() {
  const session = useAuth((s) => s.session);
  const items = useNotifications((s) => s.items);
  const audience = session?.role || 'client';
  const targetId = session?.id;
  const unread = visibleFor(items, audience, targetId).filter((n) => !n.read).length;
  const swing = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prev = useRef(unread);

  useEffect(() => {
    if (unread > prev.current) {
      Animated.sequence([
        Animated.timing(swing, { toValue: 1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(swing, { toValue: -1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(swing, { toValue: 0.7, duration: 80, useNativeDriver: true }),
        Animated.timing(swing, { toValue: -0.5, duration: 80, useNativeDriver: true }),
        Animated.timing(swing, { toValue: 0, duration: 90, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 160, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }
    prev.current = unread;
  }, [unread, pulse, swing]);

  const rotate = swing.interpolate({ inputRange: [-1, 1], outputRange: ['-18deg', '18deg'] });

  return (
    <Pressable onPress={() => router.push('/notifications')} style={s.bell} hitSlop={8}>
      <Animated.View style={{ transform: [{ rotate }, { scale: pulse }] }}>
        <Image source={notifyGlyph} style={s.icon} />
      </Animated.View>
      {unread > 0 ? (
        <View style={s.badge}>
          <Text style={s.count}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  bell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { width: 34, height: 34, borderRadius: 17 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  count: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
