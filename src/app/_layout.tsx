import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppPreferencesProvider, useAppPreferences } from '@/context/app-preferences';
import { FloatingMicrophone } from '@/components/voice/FloatingMicrophone';
import { VoiceAssistantButton } from '@/components/voice/VoiceAssistantButton';

const HIDDEN_VOICE_BUTTON_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/register-success',
  '/admin',
  '/explore',
];

function RootLayoutNav() {
  const { isDark } = useAppPreferences();
  const pathname = usePathname();
  const showVoiceButtons =
    pathname !== '/' && !HIDDEN_VOICE_BUTTON_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
      {showVoiceButtons && (
        <>
          <VoiceAssistantButton />
          <FloatingMicrophone />
        </>
      )}
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
