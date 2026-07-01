import { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
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
import { auth, setToken, setUser } from '@/services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <ImageBackground
      source={require('../../assets/Fondo.png')}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <Image
              source={require('../../assets/images/logo-glow.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Iniciar Sesión</Text>
              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
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
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#8aab7a"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <Pressable onPress={() => router.push('/forgot-password')}>
                <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed, loading && styles.pressed]}
                onPress={async () => {
                  if (!email || !password) {
                    Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.');
                    return;
                  }
                  setLoading(true);
                  try {
                    const res = await auth.login(email, password);
                    setToken(res.access_token);
                    setUser(res.user);
                    router.replace('/(tabs)');
                  } catch (err: unknown) {
                    Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}>
                <Text style={styles.loginButtonText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
              </Pressable>

              <Pressable onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>¿No tienes cuenta? Regístrate</Text>
              </Pressable>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  safeArea: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 16,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: 'rgba(30, 38, 30, 0.82)',
    borderRadius: 20,
    padding: 24,
    gap: 12,
    width: '100%',
    maxWidth: 420,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 4,
  },
  fieldGroup: {
    gap: 5,
  },
  label: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'left',
  },
  input: {
    backgroundColor: '#EAFCD0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#2a3d25',
    textAlign: 'left',
  },
  forgotPassword: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 2,
  },
  loginButton: {
    backgroundColor: '#4EC920',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  pressed: {
    opacity: 0.85,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  registerLink: {
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.85,
    marginTop: 2,
  },
});
