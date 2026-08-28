import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { usePharmacyCatalog } from '../src/store/catalog';
import { useNotifications } from '../src/store/notifications';
import { usePayouts } from '../src/store/payouts';
import { useOrders } from '../src/store/orders';
import { setupLocalNotifications } from '../src/lib/notifyLocal';
import { NotificationToast } from '../src/components/NotificationToast';

WebBrowser.maybeCompleteAuthSession();

export default function Root() {
  const hydrate = useAuth((s) => s.hydrate);
  const hydrated = useAuth((s) => s.hydrated);
  const hydrateCatalog = usePharmacyCatalog((s) => s.hydrate);
  const hydrateNotifs = useNotifications((s) => s.hydrate);
  const hydratePayouts = usePayouts((s) => s.hydrate);
  const hydrateOrders = useOrders((s) => s.hydrate);
  useEffect(() => {
    hydrate();
    hydrateCatalog();
    hydrateNotifs();
    hydratePayouts();
    hydrateOrders();
    setupLocalNotifications();
  }, [hydrate, hydrateCatalog, hydrateNotifs, hydratePayouts, hydrateOrders]);
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerTintColor: colors.primary,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#fff' },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pharmacy-home" options={{ headerShown: false }} />
        <Stack.Screen name="pharmacy-catalog" options={{ title: 'Catalogue' }} />
        <Stack.Screen name="pharmacy-product-new" options={{ title: 'Nouveau produit' }} />
        <Stack.Screen name="pharmacy-payouts" options={{ title: 'Paiements' }} />
        <Stack.Screen name="pharmacy-orders" options={{ title: 'Commandes' }} />
        <Stack.Screen name="pharmacy-order/[id]" options={{ title: 'Ramassage' }} />
        <Stack.Screen name="courier-home" options={{ headerShown: false }} />
        <Stack.Screen name="courier-earnings" options={{ title: 'Gains' }} />
        <Stack.Screen name="courier-run/[id]" options={{ title: 'Course' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Détails du produit' }} />
        <Stack.Screen name="pharmacy/[id]" options={{ title: 'Pharmacie' }} />
        <Stack.Screen name="checkout" options={{ title: 'Finaliser la commande' }} />
        <Stack.Screen name="pay" options={{ title: 'Paiement mobile' }} />
        <Stack.Screen name="pay-card" options={{ title: 'Paiement carte' }} />
        <Stack.Screen name="admin-home" options={{ headerShown: false }} />
        <Stack.Screen name="admin-pharmacies" options={{ title: 'Pharmacies' }} />
        <Stack.Screen name="admin-pharmacy/[id]" options={{ title: 'Dossier pharmacie' }} />
        <Stack.Screen name="admin-couriers" options={{ title: 'Livreurs' }} />
        <Stack.Screen name="admin-catalog" options={{ title: 'Catalogue' }} />
        <Stack.Screen name="admin-orders" options={{ title: 'Commandes' }} />
        <Stack.Screen name="admin-payouts" options={{ title: 'Virements' }} />
        <Stack.Screen name="prescription" options={{ title: 'Ordonnance' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Suivi de commande' }} />
      </Stack>
        <NotificationToast />
      </View>
    </SafeAreaProvider>
  );
}
