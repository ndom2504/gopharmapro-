import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#fff' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Connexion' }} />
      <Stack.Screen name="register-client" options={{ title: 'Compte client' }} />
      <Stack.Screen name="register-pharmacy" options={{ title: 'Compte pharmacie' }} />
    </Stack>
  );
}
