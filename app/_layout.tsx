import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';

WebBrowser.maybeCompleteAuthSession();

export default function Root() {
  const hydrate = useAuth((s) => s.hydrate);
  const hydrated = useAuth((s) => s.hydrated);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
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
        <Stack.Screen name="product/[id]" options={{ title: 'Détails du produit' }} />
        <Stack.Screen name="pharmacy/[id]" options={{ title: 'Pharmacie' }} />
        <Stack.Screen name="checkout" options={{ title: 'Finaliser la commande' }} />
        <Stack.Screen name="pay" options={{ title: 'Paiement mobile' }} />
        <Stack.Screen name="prescription" options={{ title: 'Ordonnance' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Suivi de commande' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
