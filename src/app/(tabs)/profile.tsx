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
    router.replace('/login');
  }

  async function handleSave() {
    if (!currentUser) return;
    const edadNum = edad ? parseInt(edad, 10) : undefined;
    if (edad && (isNaN(edadNum!) || edadNum! < 1 || edadNum! > 120)) {
      Alert.alert('Error', 'Ingresa una edad valida.');
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
      Alert.alert('Exito', 'Perfil actualizado correctamente.');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  }

  const initial = (currentUser?.nombre ?? 'U')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Avatar */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <Text style={styles.nameText}>{currentUser?.nombre ?? 'Usuario'}</Text>
          <Text style={styles.emailBadge}>{currentUser?.correo ?? ''}</Text>

          <View style={styles.greenDivider} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mi Perfil</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Correo electronico</Text>
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
                placeholderTextColor="#b0c8a0"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Telefono</Text>
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Tu telefono"
                placeholderTextColor="#b0c8a0"
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
                placeholderTextColor="#b0c8a0"
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
          </View>

          <Pressable
            style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
            onPress={logout}>
            <Text style={styles.logoutButtonText}>Cerrar sesion</Text>
          </Pressable>

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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 48,
    gap: 12,
    backgroundColor: '#ffffff',
  },

  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#4EC920',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4EC920',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 4,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '800',
  },
  nameText: {
    color: '#1a2e1a',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  emailBadge: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  greenDivider: {
    height: 3,
    width: '100%',
    backgroundColor: '#4EC920',
    borderRadius: 2,
    marginVertical: 4,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    gap: 14,
    width: '100%',
    maxWidth: 440,
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
  logoutButton: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
  },
  logoutButtonText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
