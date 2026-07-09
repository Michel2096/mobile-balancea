import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppPreferences } from '@/context/app-preferences';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useFloatingLayout } from '@/hooks/useFloatingLayout';

export function FloatingMicrophone() {
  const { language } = useAppPreferences();
  const { isListening, start, stop } = useVoiceRecognition(language === 'es' ? 'es-MX' : 'en-US');
  const { bottom } = useFloatingLayout();
  const pulse = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isListening) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isListening, pulse]);

  function handlePress() {
    Animated.sequence([
      Animated.timing(pressScale, { toValue: 0.9, duration: 90, useNativeDriver: true }),
      Animated.timing(pressScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    if (isListening) stop();
    else start();
  }

  return (
    <View
      style={[styles.wrap, { bottom }, Platform.OS === 'web' && webFixedStyle]}
      pointerEvents="box-none">
      {isListening && (
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse }] }]} />
      )}
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.fab,
            isListening && styles.fabActive,
            pressed && styles.fabPressed,
          ]}>
          <Ionicons name={isListening ? 'stop' : 'mic'} size={24} color="#ffffff" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

// RN Web admite 'fixed' aunque el tipo de React Native no lo declare; se castea
// aparte para que el botón quede anclado al viewport y no se desplace con el scroll.
const webFixedStyle = { position: 'fixed' } as unknown as { position: 'absolute' };

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(78,201,32,0.35)',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  fabActive: {
    backgroundColor: '#e05050',
  },
  fabPressed: {
    opacity: 0.85,
  },
});
