import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppPreferences } from '@/context/app-preferences';
import { BrandLogo } from '@/components/branding/brand-logo';
import { HeroBackground } from '@/components/branding/hero-background';

const OVERLAY_COLORS: [string, string] = ['rgba(93,212,93,0.88)', 'rgba(42,110,42,0.93)'];

export default function RegisterSuccessScreen() {
  const { t } = useAppPreferences();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <HeroBackground overlayColors={OVERLAY_COLORS} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Animated.View style={{ opacity }}>
            <BrandLogo variant="white" width={130} />
          </Animated.View>

          <Animated.View style={[styles.iconWrap, { transform: [{ scale }], opacity }]}>
            <Ionicons name="checkmark" size={52} color="#2a6e2a" />
          </Animated.View>

          <Animated.View style={{ opacity }}>
            <Text style={styles.title}>{t('accountCreated')}</Text>
            <Text style={styles.subtitle}>{t('accountCreatedSubtitle')}</Text>
          </Animated.View>

          <Animated.View style={{ opacity, width: '100%' }}>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              onPress={() => router.replace('/login')}>
              <Text style={styles.buttonText}>{t('loginSubmit')}</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 28,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#1a5c1a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pressed: { opacity: 0.8 },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
