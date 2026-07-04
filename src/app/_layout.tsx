import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppPreferencesProvider, useAppPreferences } from '@/context/app-preferences';

function RootLayoutNav() {
  const { isDark } = useAppPreferences();
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppPreferencesProvider>
      <RootLayoutNav />
    </AppPreferencesProvider>
  );
}
