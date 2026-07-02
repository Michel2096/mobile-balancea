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
import { LinearGradient } from 'expo-linear-gradient';
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
          contentContainerStyle={styles.scrollOuter}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Encabezado en degradado */}
          <LinearGradient
            colors={['#4EC920', '#1B5E20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}>
            <View pointerEvents="none" style={styles.headerBlob} />

            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              onPress={() => router.back()}>
              <Text style={styles.backBtnText}>← Volver</Text>
            </Pressable>

            <View style={styles.headerUserRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {(profile?.nombre ?? 'U')[0]?.toUpperCase() ?? 'U'}
                </Text>
              </View>
              <View style={styles.headerUserInfo}>
                <Text style={styles.title}>Configuración</Text>
                <Text style={styles.subtitle}>{profile?.nombre ?? 'Datos de tu cuenta y seguridad'}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.content}>

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
                <View style={styles.floatingCard}>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 56,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute',
    top: -50,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  headerUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarLetter: {
    color: '#2E7D32',
    fontSize: 22,
    fontWeight: '800',
  },
  headerUserInfo: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500',
  },

  /* Contenido */
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  floatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 14,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
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
    color: '#2E7D32',
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
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2E7D32',
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
