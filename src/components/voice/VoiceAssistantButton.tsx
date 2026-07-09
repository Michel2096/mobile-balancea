import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useAppPreferences } from '@/context/app-preferences';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useFloatingLayout } from '@/hooks/useFloatingLayout';

// Ancho reservado por el FloatingMicrophone (right:20 + 58 de diámetro + margen)
// para que el pill nunca se dibuje debajo del botón circular del micrófono.
const MIC_FOOTPRINT = 20 + 58 + 12;

export function VoiceAssistantButton() {
  const { language, isDark, t } = useAppPreferences();
  const { isListening, transcript, error, start, stop } = useVoiceRecognition(
    language === 'es' ? 'es-MX' : 'en-US'
  );
  const { bottom, width } = useFloatingLayout();
  const pillMaxWidth = Math.max(140, width - 20 - MIC_FOOTPRINT);
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isListening) {
      dotAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isListening, dotAnim]);

  const label = isListening
    ? t('voiceListening')
    : error
    ? t('voiceErrorGeneric')
    : transcript
    ? transcript
    : t('voicePromptActivate');

  const dotOpacity = dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <Pressable
      onPress={() => (isListening ? stop() : start())}
      style={({ pressed }) => [
        styles.pill,
        { bottom, maxWidth: pillMaxWidth },
        isDark && darkStyles.pill,
        isListening && styles.pillActive,
        pressed && styles.pillPressed,
        Platform.OS === 'web' && webFixedStyle,
      ]}>
      <Animated.View
        style={[styles.dot, isListening && styles.dotActive, { opacity: isListening ? dotOpacity : 1 }]}
      />
      <Text
        style={[styles.label, isDark && darkStyles.label, isListening && styles.labelActive]}
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// RN Web admite 'fixed' aunque el tipo de React Native no lo declare; se castea
// aparte para que el pill quede anclado al viewport y no se desplace con el scroll.
const webFixedStyle = { position: 'fixed' } as unknown as { position: 'absolute' };

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#ffffff',
    borderRadius: 26,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e3e8dd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 50,
  },
  pillActive: {
    borderColor: '#4EC920',
    backgroundColor: '#f0fbe8',
  },
  pillPressed: {
    opacity: 0.85,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#bbb',
    flexShrink: 0,
  },
  dotActive: {
    backgroundColor: '#4EC920',
  },
  label: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  labelActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
});

const darkStyles = StyleSheet.create({
  pill: {
    backgroundColor: '#1e1e1e',
    borderColor: '#2a2a2a',
  },
  label: {
    color: '#ddd',
  },
});
