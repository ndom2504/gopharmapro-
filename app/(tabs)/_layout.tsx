import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/store/auth';
import { useCart } from '../../src/store/cart';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  search: 'search',
  cart: 'cart',
  orders: 'cube',
  profile: 'person',
};

export default function TabsLayout() {
  const session = useAuth((s) => s.session);
  const count = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  if (session?.role === 'pharmacy') return <Redirect href="/pharmacy-home" />;
  if (session?.role === 'courier') return <Redirect href="/courier-home" />;
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { height: 72, paddingTop: 7, paddingBottom: 10, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name] || 'ellipse'} color={color} size={size} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="search" options={{ title: 'Rechercher' }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarBadge: count || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.onPrimary, fontSize: 10 },
        }}
      />
      <Tabs.Screen name="orders" options={{ title: 'Commandes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      <Tabs.Screen name="pharmacies" options={{ href: null, title: 'Pharmacies' }} />
    </Tabs>
  );
}
