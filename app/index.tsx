import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { useAuth } from '../src/store/auth';

export default function Index() {
  const session = useAuth((s) => s.session);
  const guest = useAuth((s) => s.guest);
  if (session?.role === 'pharmacy') return <Redirect href="/pharmacy-home" />;
  if (session?.role === 'courier') return <Redirect href="/courier-home" />;
  if (session?.role === 'admin') return <Redirect href="/admin-home" />;
  if (session?.role === 'client' || guest) return <Redirect href="/(tabs)" />;
  return <Redirect href={'/auth' as Href} />;
}
