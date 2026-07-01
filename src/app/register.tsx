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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { auth } from '@/services/api';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    nombre: '',
    apellidoMaterno: '',
    apellidoPaterno: '',
    edad: '',
    correo: '',
    contrasena: '',
    telefono: '',
    confirmarContrasena: '',
  });
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <LinearGradient colors={['#5dd45d', '#2a6e2a']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Logo */}
            <View style={styles.logoRow}>
              <Text style={styles.brandName}>Balancea</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Registrate</Text>

              {/* Fila 1 */}
              <View style={styles.row}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Nombre (s)</Text>
                  <TextInput
                    style={styles.input}
                    value={form.nombre}
                    onChangeText={set('nombre')}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Apellido Materno</Text>
                  <TextInput
                    style={styles.input}
                    value={form.apellidoMaterno}
                    onChangeText={set('apellidoMaterno')}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Fila 2 */}
              <View style={styles.row}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Apellido Paterno</Text>
                  <TextInput
                    style={styles.input}
                    value={form.apellidoPaterno}
                    onChangeText={set('apellidoPaterno')}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Edad</Text>
                  <TextInput
                    style={styles.input}
                    value={form.edad}
                    onChangeText={set('edad')}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Fila 3 */}
              <View style={styles.row}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Correo</Text>
                  <TextInput
                    style={styles.input}
                    value={form.correo}
                    onChangeText={set('correo')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={form.contrasena}
                    onChangeText={set('contrasena')}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Fila 4 */}
              <View style={styles.row}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Telefono</Text>
                  <TextInput
                    style={styles.input}
                    value={form.telefono}
                    onChangeText={set('telefono')}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Confirma contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={form.confirmarContrasena}
                    onChangeText={set('confirmarContrasena')}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Términos */}
              <Pressable
                style={styles.termsRow}
                onPress={() => setAceptaTerminos((v) => !v)}>
                <View style={[styles.checkbox, aceptaTerminos && styles.checkboxChecked]} />
                <Text style={styles.termsText}>
                  Lei los terminos de privacidad y las condiciones de uso del sistema
                </Text>
              </Pressable>

              {/* Botón */}
              <Pressable
                style={({ pressed }) => [styles.registerButton, pressed && styles.pressed, loading && styles.pressed]}
                disabled={loading}
                onPress={async () => {
                  if (!form.nombre || !form.correo || !form.contrasena || !form.telefono) {
                    Alert.alert('Campos requeridos', 'Nombre, correo, teléfono y contraseña son obligatorios.');
                    return;
                  }
                  if (form.contrasena !== form.confirmarContrasena) {
                    Alert.alert('Error', 'Las contraseñas no coinciden.');
                    return;
                  }
                  if (!aceptaTerminos) {
                    Alert.alert('Términos', 'Debes aceptar los términos y condiciones.');
                    return;
                  }
                  setLoading(true);
                  try {
                    const fullName = [form.nombre, form.apellidoPaterno, form.apellidoMaterno]
                      .filter(Boolean)
                      .join(' ');
                    await auth.register({
                      name: fullName,
                      email: form.correo,
                      password: form.contrasena,
                      telefono: form.telefono,
                      edad: form.edad ? parseInt(form.edad, 10) : undefined,
                    });
                    router.replace('/register-success');
                  } catch (err: unknown) {
                    Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
                  } finally {
                    setLoading(false);
                  }
                }}>
                <Text style={styles.registerButtonText}>{loading ? 'Creando cuenta...' : 'Registrarme'}</Text>
              </Pressable>
            </View>

            {/* Volver */}
            <Pressable onPress={() => router.back()} style={styles.backLink}>
              <Text style={styles.backLinkText}>{'< Regresar a inicio'}</Text>
            </Pressable>

          </ScrollView>
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
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 20,
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
    padding: 20,
    gap: 12,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    color: '#2a3d25',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    borderRadius: 3,
    marginTop: 1,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#4EC920',
    borderColor: '#4EC920',
  },
  termsText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.9,
  },
  registerButton: {
    backgroundColor: '#1a5c1a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backLink: {
    marginTop: 4,
  },
  backLinkText: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
});
