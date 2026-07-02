import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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
import { router, useFocusEffect } from 'expo-router';
import { getUser, userApi, UserProfile } from '@/services/api';

export default function ConfiguracionScreen() {
  const currentUser = getUser();
  const [profile, setProfile] = useState<UserProfile | null>(currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  async function fetchProfile() {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getProfile(currentUser.id);
      setProfile(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [currentUser?.id])
  );

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Completa los tres campos de contraseña.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    setSavingPassword(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.nav}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              onPress={() => router.back()}>
              <Text style={styles.backBtnText}>← Volver</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Configuración</Text>
          <Text style={styles.subtitle}>Datos de tu cuenta y seguridad.</Text>

          <View style={styles.greenDivider} />

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4EC920" />
              <Text style={styles.loadingText}>Cargando cuenta...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>No se pudo cargar</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={fetchProfile} style={styles.retryBtn}>
                <Text style={styles.retryText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Cuenta</Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <View style={styles.readonlyBox}>
                    <Text style={styles.readonlyText}>{profile?.correo ?? '—'}</Text>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Tipo de cuenta</Text>
                  <View style={styles.readonlyBox}>
                    <Text style={styles.readonlyText}>{profile?.tipo_cuenta ?? '—'}</Text>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Teléfono</Text>
                  <View style={styles.readonlyBox}>
                    <Text style={styles.readonlyText}>{profile?.telefono || '—'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Cambiar contraseña</Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Contraseña actual</Text>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor="#b0c8a0"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nueva contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#b0c8a0"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Confirmar nueva contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Repite la contraseña"
                    placeholderTextColor="#b0c8a0"
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [styles.saveButton, (pressed || savingPassword) && styles.pressed]}
                  onPress={handleChangePassword}
                  disabled={savingPassword}>
                  <Text style={styles.saveButtonText}>
                    {savingPassword ? 'Guardando...' : 'Actualizar contraseña'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}

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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 14,
    backgroundColor: '#ffffff',
  },
  nav: {
    marginBottom: -6,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backBtnText: {
    color: '#4EC920',
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    color: '#1a2e1a',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  greenDivider: {
    height: 3,
    backgroundColor: '#4EC920',
    borderRadius: 2,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    color: '#1a2e1a',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  fieldGroup: {
    gap: 5,
  },
  label: {
    color: '#4EC920',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readonlyBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  readonlyText: {
    color: '#888',
    fontSize: 14,
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
  saveButton: {
    backgroundColor: '#4EC920',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#4EC920',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  errorBox: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  errorTitle: {
    color: '#1a2e1a',
    fontSize: 17,
    fontWeight: '700',
  },
  errorText: {
    color: '#e05050',
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#4EC920',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
