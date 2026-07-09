import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { auth, ROLE_ADMIN, setToken, setUser } from '@/services/api';
import { useAppPreferences } from '@/context/app-preferences';
import { BrandLogo } from '@/components/branding/brand-logo';
import { HeroBackground } from '@/components/branding/hero-background';

export default function LoginScreen() {
  const { isDark, t } = useAppPreferences();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, isDark && darkStyles.safeArea]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView
          contentContainerStyle={[styles.scrollOuter, isDark && darkStyles.scrollOuter]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Encabezado con fondo de marca */}
          <HeroBackground style={styles.header}>
            <View pointerEvents="none" style={styles.headerBlob} />

            <BrandLogo variant="white" width={150} style={styles.headerLogo} />
            <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>
          </HeroBackground>

          <View style={styles.content}>
            <View style={[styles.floatingCard, isDark && darkStyles.card]}>
              <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                {t('loginTitle')}
              </Text>
              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('email')}</Text>
                <TextInput
                  style={[styles.input, isDark && darkStyles.input]}
                  placeholder="correo@example.com"
                  placeholderTextColor="#b0c8a0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{t('passwordLabel')}</Text>
                <TextInput
                  style={[styles.input, isDark && darkStyles.input]}
                  placeholder="••••••••"
                  placeholderTextColor="#b0c8a0"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <Pressable onPress={() => router.push('/forgot-password')}>
                <Text style={styles.forgotPassword}>{t('forgotPasswordLink')}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed, loading && styles.pressed]}
                onPress={async () => {
                  if (!email || !password) {
                    Alert.alert(t('requiredFieldsTitle'), t('loginRequiredMsg'));
                    return;
                  }
                  setLoading(true);
                  try {
                    const res = await auth.login(email, password);
                    setToken(res.access_token);
                    setUser(res.user);
                    router.replace(res.user.rol === ROLE_ADMIN ? '/admin' : '/(tabs)');
                  } catch (err: unknown) {
                    Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('loginError'));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}>
                <Text style={styles.loginButtonText}>{loading ? t('loggingIn') : t('loginSubmit')}</Text>
              </Pressable>

              <Pressable onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>{t('noAccountLink')}</Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.backHomeBtn, pressed && styles.pressed]}
              onPress={() => router.push('/')}>
              <Text style={styles.backHomeBtnText}>{t('backToHome')}</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  kav: {
    flex: 1,
  },
  scrollOuter: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
  },

  /* Encabezado */
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 64,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerLogo: {
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* Contenido */
  content: {
    paddingHorizontal: 24,
  },
  floatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    gap: 12,
    marginTop: -44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    color: '#1a2e1a',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#eef0ea',
    marginBottom: 4,
  },
  fieldGroup: {
    gap: 5,
  },
  label: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f7f9f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1a2e1a',
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  forgotPassword: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  loginButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  pressed: {
    opacity: 0.8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  registerLink: {
    color: '#555',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },

  /* Volver al inicio */
  backHomeBtn: {
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 22,
  },
  backHomeBtnText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const darkStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#121212',
  },
  scrollOuter: {
    backgroundColor: '#121212',
  },
  card: {
    backgroundColor: '#1e1e1e',
  },
  cardTitle: {
    color: '#f2f2f2',
  },
  input: {
    backgroundColor: '#262626',
    borderColor: '#3a4a33',
    color: '#f2f2f2',
  },
});
