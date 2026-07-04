import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import { useAppPreferences } from '@/context/app-preferences';

type TipoCuenta = 'personal' | 'infantil';

const GENDER_OPTIONS = [
  { value: 'masculino', labelKey: 'profileGenderMale' },
  { value: 'femenino', labelKey: 'profileGenderFemale' },
  { value: 'otro', labelKey: 'profileGenderOther' },
  { value: 'no_decir', labelKey: 'profileGenderPrefer' },
];

export default function RegisterScreen() {
  const { isDark, t } = useAppPreferences();
  const [step, setStep] = useState<1 | 2>(1);
  const [tipoCuenta, setTipoCuenta] = useState<TipoCuenta | null>(null);
  const [loading, setLoading] = useState(false);
  const [sexoPickerFor, setSexoPickerFor] = useState<'personal' | 'infantil' | null>(null);

  // Cuenta personal
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [edad, setEdad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sexo, setSexo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  // Cuenta infantil
  const [nombreNino, setNombreNino] = useState('');
  const [correoNino, setCorreoNino] = useState('');
  const [edadNino, setEdadNino] = useState('');
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorTelefono, setTutorTelefono] = useState('');
  const [sexoNino, setSexoNino] = useState('');
  const [contrasenaNino, setContrasenaNino] = useState('');
  const [confirmarContrasenaNino, setConfirmarContrasenaNino] = useState('');

  const sexoLabel = GENDER_OPTIONS.find((g) => g.value === sexo)?.labelKey;
  const sexoNinoLabel = GENDER_OPTIONS.find((g) => g.value === sexoNino)?.labelKey;

  function handleSelectTipoCuenta() {
    if (!tipoCuenta) {
      Alert.alert(t('requiredFieldsTitle'), t('registerSelectTypeMsg'));
      return;
    }
    setStep(2);
  }

  async function handleSubmitPersonal() {
    const edadNum = parseInt(edad, 10);
    if (!nombre.trim() || !correo.trim() || !edad || isNaN(edadNum) || !contrasena) {
      Alert.alert(t('requiredFieldsTitle'), t('registerRequiredMsg'));
      return;
    }
    if (edadNum < 18) {
      Alert.alert(t('errorTitle'), t('registerAgeAdultMsg'));
      return;
    }
    if (contrasena !== confirmarContrasena) {
      Alert.alert(t('errorTitle'), t('registerPasswordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await auth.register({
        name: nombre.trim(),
        email: correo.trim(),
        password: contrasena,
        telefono: telefono.trim() || undefined,
        edad: edadNum,
        sexo: sexo || undefined,
      });
      router.replace('/register-success');
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('registerError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitInfantil() {
    const edadNum = parseInt(edadNino, 10);
    if (
      !nombreNino.trim() ||
      !correoNino.trim() ||
      !edadNino ||
      isNaN(edadNum) ||
      !tutorNombre.trim() ||
      !tutorTelefono.trim() ||
      !contrasenaNino
    ) {
      Alert.alert(t('requiredFieldsTitle'), t('registerRequiredMsg'));
      return;
    }
    if (edadNum < 3 || edadNum > 17) {
      Alert.alert(t('errorTitle'), t('registerAgeChildMsg'));
      return;
    }
    if (contrasenaNino !== confirmarContrasenaNino) {
      Alert.alert(t('errorTitle'), t('registerPasswordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await auth.registerChild({
        tutor_nombre: tutorNombre.trim(),
        tutor_telefono: tutorTelefono.trim(),
        name: nombreNino.trim(),
        email: correoNino.trim(),
        password: contrasenaNino,
        edad: edadNum,
        sexo: sexoNino || undefined,
      });
      router.replace('/register-success');
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('registerError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark && darkStyles.safeArea]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView
          contentContainerStyle={[styles.scrollOuter, isDark && darkStyles.scrollOuter]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <LinearGradient
            colors={['#4EC920', '#1B5E20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}>
            <View pointerEvents="none" style={styles.headerBlob} />
            <Text style={styles.title}>Balancea</Text>
            <Text style={styles.subtitle}>{t('registerTitle')}</Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={[styles.floatingCard, isDark && darkStyles.card]}>

              {step === 1 ? (
                <>
                  <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                    {t('registerStepTypeTitle')}
                  </Text>
                  <View style={styles.divider} />

                  <Pressable
                    style={[styles.typeCard, tipoCuenta === 'personal' && styles.typeCardActive]}
                    onPress={() => setTipoCuenta('personal')}>
                    <View style={[styles.radio, tipoCuenta === 'personal' && styles.radioActive]} />
                    <View style={styles.typeTextWrap}>
                      <Text style={[styles.typeTitle, isDark && darkStyles.cardTitle]}>
                        {t('accountTypePersonalTitle')}
                      </Text>
                      <Text style={styles.typeDesc}>{t('accountTypePersonalDesc')}</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    style={[styles.typeCard, tipoCuenta === 'infantil' && styles.typeCardActive]}
                    onPress={() => setTipoCuenta('infantil')}>
                    <View style={[styles.radio, tipoCuenta === 'infantil' && styles.radioActive]} />
                    <View style={styles.typeTextWrap}>
                      <Text style={[styles.typeTitle, isDark && darkStyles.cardTitle]}>
                        {t('accountTypeChildTitle')}
                      </Text>
                      <Text style={styles.typeDesc}>{t('accountTypeChildDesc')}</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                    onPress={handleSelectTipoCuenta}>
                    <Text style={styles.primaryBtnText}>{t('nextStep')}</Text>
                  </Pressable>

                  <Pressable onPress={() => router.push('/login')}>
                    <Text style={styles.linkText}>{t('alreadyHaveAccountLink')}</Text>
                  </Pressable>
                </>
              ) : tipoCuenta === 'personal' ? (
                <>
                  <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                    {t('registerPersonalTitle')}
                  </Text>
                  <View style={styles.divider} />

                  <Field
                    label={`${t('fieldNombreCompleto')} *`}
                    placeholder={t('fieldNombreCompletoPlaceholder')}
                    value={nombre}
                    onChangeText={setNombre}
                    isDark={isDark}
                    autoCapitalize="words"
                  />
                  <Field
                    label={`${t('email')} *`}
                    placeholder={t('fieldCorreoPlaceholder')}
                    value={correo}
                    onChangeText={setCorreo}
                    isDark={isDark}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Field
                    label={`${t('age')} *`}
                    placeholder={t('fieldEdadPersonalPlaceholder')}
                    value={edad}
                    onChangeText={setEdad}
                    isDark={isDark}
                    keyboardType="number-pad"
                  />
                  <Field
                    label={t('phone')}
                    placeholder={t('fieldTelefonoPlaceholder')}
                    value={telefono}
                    onChangeText={setTelefono}
                    isDark={isDark}
                    keyboardType="phone-pad"
                  />

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('profileGender')}</Text>
                    <Pressable
                      style={[styles.selectBox, isDark && darkStyles.input]}
                      onPress={() => setSexoPickerFor('personal')}>
                      <Text style={[styles.selectBoxText, isDark && darkStyles.selectBoxText]}>
                        {sexoLabel ? t(sexoLabel) : t('selectSexoPlaceholder')}
                      </Text>
                      <Text style={styles.selectBoxChevron}>▾</Text>
                    </Pressable>
                  </View>

                  <Field
                    label={`${t('passwordLabel')} *`}
                    placeholder={t('registerPasswordPlaceholder')}
                    value={contrasena}
                    onChangeText={setContrasena}
                    isDark={isDark}
                    secureTextEntry
                  />
                  <Field
                    label={`${t('confirmPasswordField')} *`}
                    placeholder={t('registerPasswordPlaceholder')}
                    value={confirmarContrasena}
                    onChangeText={setConfirmarContrasena}
                    isDark={isDark}
                    secureTextEntry
                  />

                  <View style={styles.stepButtonsRow}>
                    <Pressable
                      style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                      onPress={() => setStep(1)}>
                      <Text style={styles.secondaryBtnText}>{t('prevStep')}</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.primaryBtn, styles.primaryBtnFlex, (pressed || loading) && styles.pressed]}
                      disabled={loading}
                      onPress={handleSubmitPersonal}>
                      <Text style={styles.primaryBtnText}>
                        {loading ? t('creatingAccount') : t('nextStep')}
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable onPress={() => router.push('/login')}>
                    <Text style={styles.linkText}>{t('alreadyHaveAccountLink')}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                    {t('registerChildTitle')}
                  </Text>
                  <View style={styles.divider} />

                  <Field
                    label={`${t('fieldNombreNino')} *`}
                    placeholder={t('fieldNombreNinoPlaceholder')}
                    value={nombreNino}
                    onChangeText={setNombreNino}
                    isDark={isDark}
                    autoCapitalize="words"
                  />
                  <Field
                    label={`${t('fieldCorreoNino')} *`}
                    placeholder={t('fieldCorreoNinoPlaceholder')}
                    value={correoNino}
                    onChangeText={setCorreoNino}
                    isDark={isDark}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Field
                    label={`${t('fieldEdadNino')} *`}
                    placeholder={t('fieldEdadNinoPlaceholder')}
                    value={edadNino}
                    onChangeText={setEdadNino}
                    isDark={isDark}
                    keyboardType="number-pad"
                  />

                  <Text style={[styles.subsectionTitle, isDark && darkStyles.cardTitle]}>
                    {t('datosTutorTitle')}
                  </Text>

                  <Field
                    label={`${t('fieldTutorNombre')} *`}
                    placeholder={t('fieldTutorNombrePlaceholder')}
                    value={tutorNombre}
                    onChangeText={setTutorNombre}
                    isDark={isDark}
                    autoCapitalize="words"
                  />
                  <Field
                    label={`${t('fieldTutorTelefono')} *`}
                    placeholder={t('fieldTutorTelefonoPlaceholder')}
                    value={tutorTelefono}
                    onChangeText={setTutorTelefono}
                    isDark={isDark}
                    keyboardType="phone-pad"
                  />

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('profileGender')}</Text>
                    <Pressable
                      style={[styles.selectBox, isDark && darkStyles.input]}
                      onPress={() => setSexoPickerFor('infantil')}>
                      <Text style={[styles.selectBoxText, isDark && darkStyles.selectBoxText]}>
                        {sexoNinoLabel ? t(sexoNinoLabel) : t('selectSexoPlaceholder')}
                      </Text>
                      <Text style={styles.selectBoxChevron}>▾</Text>
                    </Pressable>
                  </View>

                  <Field
                    label={`${t('fieldContrasenaNino')} *`}
                    placeholder={t('fieldContrasenaNinoPlaceholder')}
                    value={contrasenaNino}
                    onChangeText={setContrasenaNino}
                    isDark={isDark}
                    secureTextEntry
                  />
                  <Field
                    label={`${t('confirmPasswordField')} *`}
                    placeholder={t('registerPasswordPlaceholder')}
                    value={confirmarContrasenaNino}
                    onChangeText={setConfirmarContrasenaNino}
                    isDark={isDark}
                    secureTextEntry
                  />

                  <View style={styles.stepButtonsRow}>
                    <Pressable
                      style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                      onPress={() => setStep(1)}>
                      <Text style={styles.secondaryBtnText}>{t('prevStep')}</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.primaryBtn, styles.primaryBtnFlex, (pressed || loading) && styles.pressed]}
                      disabled={loading}
                      onPress={handleSubmitInfantil}>
                      <Text style={styles.primaryBtnText}>
                        {loading ? t('creatingAccount') : t('nextStep')}
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable onPress={() => router.push('/login')}>
                    <Text style={styles.linkText}>{t('alreadyHaveAccountLink')}</Text>
                  </Pressable>
                </>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [styles.backHomeBtn, pressed && styles.pressed]}
              onPress={() => router.push('/')}>
              <Text style={styles.backHomeBtnText}>{t('backToHome')}</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={sexoPickerFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSexoPickerFor(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSexoPickerFor(null)} />
        <View style={[styles.pickerModal, isDark && darkStyles.card]}>
          <ScrollView>
            {GENDER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [styles.pickerOption, pressed && styles.pressed]}
                onPress={() => {
                  if (sexoPickerFor === 'personal') setSexo(opt.value);
                  else if (sexoPickerFor === 'infantil') setSexoNino(opt.value);
                  setSexoPickerFor(null);
                }}>
                <Text style={[styles.pickerOptionText, isDark && darkStyles.cardTitle]}>{t(opt.labelKey)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  isDark: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
  autoCorrect?: boolean;
};

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  isDark,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, isDark && darkStyles.input]}
        placeholder={placeholder}
        placeholderTextColor="#b0c8a0"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  kav: { flex: 1 },
  scrollOuter: { flexGrow: 1, paddingBottom: 40, backgroundColor: '#ffffff' },

  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 56,
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
  title: { color: '#ffffff', fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginBottom: 10 },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500', textAlign: 'center' },

  content: { paddingHorizontal: 24 },
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
  cardTitle: { color: '#1a2e1a', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#eef0ea', marginBottom: 4 },

  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e3e8dd',
    backgroundColor: '#f9faf7',
  },
  typeCardActive: { borderColor: '#2E7D32', backgroundColor: '#eaf6df' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#bbb',
  },
  radioActive: { borderColor: '#2E7D32', backgroundColor: '#2E7D32' },
  typeTextWrap: { flex: 1, gap: 2 },
  typeTitle: { color: '#1a2e1a', fontSize: 15, fontWeight: '700' },
  typeDesc: { color: '#777', fontSize: 12, lineHeight: 17 },

  subsectionTitle: { color: '#1a2e1a', fontSize: 14, fontWeight: '800', marginTop: 8 },

  fieldGroup: { gap: 5 },
  label: { color: '#2E7D32', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
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
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f7f9f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  selectBoxText: { flex: 1, fontSize: 14, color: '#1a2e1a' },
  selectBoxChevron: { color: '#2E7D32', fontSize: 14 },

  stepButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  primaryBtn: {
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
  primaryBtnFlex: { flex: 1, marginTop: 0 },
  primaryBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  secondaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  secondaryBtnText: { color: '#555', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  linkText: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 6 },

  backHomeBtn: {
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 22,
  },
  backHomeBtnText: { color: '#555', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerModal: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '25%',
    maxHeight: '50%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  pickerOption: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10 },
  pickerOptionText: { color: '#1a2e1a', fontSize: 14, fontWeight: '600' },
});

const darkStyles = StyleSheet.create({
  safeArea: { backgroundColor: '#121212' },
  scrollOuter: { backgroundColor: '#121212' },
  card: { backgroundColor: '#1e1e1e' },
  cardTitle: { color: '#f2f2f2' },
  input: { backgroundColor: '#262626', borderColor: '#3a4a33', color: '#f2f2f2' },
  selectBoxText: { color: '#f2f2f2' },
});
