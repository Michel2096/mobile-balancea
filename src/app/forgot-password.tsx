import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAppPreferences } from '@/context/app-preferences';

export default function ForgotPasswordScreen() {
  const { t } = useAppPreferences();
  const [email, setEmail] = useState('');

  return (
    <LinearGradient colors={['#5dd45d', '#2a6e2a']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>

          <View style={styles.logoBox}>
            <View style={styles.logoRow}>
              <Text style={styles.brandName}>Balancea</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('forgotTitle')}</Text>
            <Text style={styles.cardSubtitle}>{t('forgotSubtitle')}</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="correo@example.com"
                placeholderTextColor="#8aab7a"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}>
                <Text style={styles.sendButtonText}>{'>'}</Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLinkText}>{t('backToHomeArrow')}</Text>
          </Pressable>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 28,
  },
  logoBox: {
    borderWidth: 2,
    borderColor: '#4dd9e0',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scaleChar: {
    fontSize: 46,
    color: '#ffffff',
    lineHeight: 54,
  },
  brandName: {
    fontSize: 46,
    color: '#ffffff',
    fontWeight: '300',
    letterSpacing: -1,
    lineHeight: 54,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(40, 100, 40, 0.55)',
    borderRadius: 24,
    padding: 28,
    gap: 16,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
  },
  cardSubtitle: {
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#2a3d25',
  },
  sendButton: {
    backgroundColor: '#1a5c1a',
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  backLinkText: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
});
