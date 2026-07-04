import { Redirect, Stack } from 'expo-router';
import { getUser, ROLE_ADMIN } from '@/services/api';

export default function AdminLayout() {
  const user = getUser();

  if (!user || user.rol !== ROLE_ADMIN) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
