import { useState } from 'react';
import {
  Alert,
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
import { getUser, setUser, clearToken, clearUser, userApi, UpdateProfilePayload } from '@/services/api';

export default function ProfileScreen() {
  const currentUser = getUser();
  const [nombre, setNombre] = useState(currentUser?.nombre ?? '');
  const [telefono, setTelefono] = useState(currentUser?.telefono ?? '');
  const [edad, setEdad] = useState(currentUser?.edad?.toString() ?? '');
  const [loading, setLoading] = useState(false);

  function logout() {
    clearToken();
    clearUser();
    router.replace('/');
  }

  async function handleSave() {
    if (!currentUser) return;
    const edadNum = edad ? parseInt(edad, 10) : undefined;
    if (edad && (isNaN(edadNum!) || edadNum! < 1 || edadNum! > 120)) {
      Alert.alert('Error', 'Ingresa una edad válida.');
      return;
    }
    setLoading(true);
    try {
      const payload: UpdateProfilePayload = {
        nombre: nombre.trim() || undefined,
        telefono: telefono.trim() || undefined,
        edad: edadNum,
      };
      const updated = await userApi.updateProfile(currentUser.id, payload);
      setUser(updated);
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../../assets/Fondo.png')}
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

            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {(currentUser?.nombre ?? 'U')[0].toUpperCase()}
              </Text>
            </View>

            <Text style={styles.welcomeText}>
              {currentUser?.nombre ?? 'Usuario'}
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mi Perfil</Text>
              <View style={styles.divider} />

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Correo electrónico</Text>
                <View style={styles.readonlyBox}>
                  <Text style={styles.readonlyText}>{currentUser?.correo ?? '—'}</Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Tipo de cuenta</Text>
                <View style={styles.readonlyBox}>
                  <Text style={styles.readonlyText}>{currentUser?.tipo_cuenta ?? '—'}</Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Tu nombre"
                  placeholderTextColor="#8aab7a"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={telefono}
                  onChangeText={setTelefono}
                  placeholder="Tu teléfono"
                  placeholderTextColor="#8aab7a"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Edad</Text>
                <TextInput
                  style={styles.input}
                  value={edad}
                  onChangeText={setEdad}
                  placeholder="Tu edad"
                  placeholderTextColor="#8aab7a"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>

              <Pressable
                style={({ pressed }) => [styles.saveButton, (pressed || loading) && styles.pressed]}
                onPress={handleSave}
                disabled={loading}>
                <Text style={styles.saveButtonText}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
                onPress={logout}>
                <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4EC920',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
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
    fontSize: 22,
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
  },
  readonlyBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  readonlyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#EAFCD0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#2a3d25',
  },
  saveButton: {
    backgroundColor: '#4EC920',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.9,
  },
  pressed: {
    opacity: 0.8,
  },
});
