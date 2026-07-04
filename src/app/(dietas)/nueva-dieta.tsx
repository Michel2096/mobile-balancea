import { useState } from 'react';
import {
  ActivityIndicator,
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
import { getUser, dietasApi, PerfilDieta, PlanGenerado } from '@/services/api';
import { useAppPreferences } from '@/context/app-preferences';

const OBJETIVOS = [
  { value: 'perder_peso', label: 'Perder Peso' },
  { value: 'mantener', label: 'Mantener Peso' },
  { value: 'ganar_musculo', label: 'Ganar Músculo' },
  { value: 'definicion', label: 'Definición Muscular' },
  { value: 'volumen', label: 'Volumen' },
  { value: 'saludable', label: 'Alimentación Saludable' },
];

const NIVELES_ACTIVIDAD = [
  { value: 'sedentario', label: 'Sedentario (poco o ningún ejercicio)' },
  { value: 'ligero', label: 'Ligero (ejercicio 1-3 días/semana)' },
  { value: 'moderado', label: 'Moderado (ejercicio 3-5 días/semana)' },
  { value: 'activo', label: 'Activo (ejercicio 6-7 días/semana)' },
  { value: 'muy_activo', label: 'Muy Activo (ejercicio diario intenso)' },
];

const COMIDAS_POR_DIA = [
  { value: 3, label: '3 comidas (desayuno, comida, cena)' },
  { value: 4, label: '4 comidas (+ 1 colación)' },
  { value: 5, label: '5 comidas (incluye colaciones)' },
  { value: 6, label: '6 comidas (cada 2-3 horas)' },
];

const RESTRICCIONES = [
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'sin_gluten', label: 'Sin Gluten' },
  { value: 'sin_lactosa', label: 'Sin Lactosa' },
  { value: 'bajo_carbohidratos', label: 'Bajo en Carbohidratos' },
  { value: 'bajo_grasas', label: 'Bajo en Grasas' },
  { value: 'alto_proteina', label: 'Alto en Proteína' },
  { value: 'dieta_keto', label: 'Dieta Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranea', label: 'Mediterránea' },
];

type PickerField = 'objetivo' | 'nivelActividad' | 'comidasPorDia';

function parseListaComas(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function NuevaDietaScreen() {
  const { isDark, t } = useAppPreferences();
  const user = getUser();

  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [nivelActividad, setNivelActividad] = useState('');
  const [comidasPorDia, setComidasPorDia] = useState<number | null>(null);
  const [enfermedades, setEnfermedades] = useState('');
  const [alergias, setAlergias] = useState('');
  const [noGusta, setNoGusta] = useState('');
  const [restricciones, setRestricciones] = useState<string[]>([]);

  const [pickerOpen, setPickerOpen] = useState<PickerField | null>(null);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanGenerado | null>(null);

  function toggleRestriccion(value: string) {
    setRestricciones((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  }

  async function handleGenerar() {
    const edadNum = parseInt(edad, 10);
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);

    if (
      !nombre.trim() ||
      !edad ||
      isNaN(edadNum) ||
      !peso ||
      isNaN(pesoNum) ||
      !altura ||
      isNaN(alturaNum) ||
      !objetivo ||
      !nivelActividad ||
      !comidasPorDia
    ) {
      Alert.alert(t('requiredFieldsTitle'), t('camposRequeridosDieta'));
      return;
    }

    const perfil: PerfilDieta = {
      nombre: nombre.trim(),
      edad: edadNum,
      peso: pesoNum,
      altura: alturaNum,
      objetivo,
      nivelActividad,
      comidasPorDia,
      restricciones,
      enfermedades: parseListaComas(enfermedades),
      alergias: parseListaComas(alergias),
      noGusta: parseListaComas(noGusta),
    };

    setLoading(true);
    try {
      const planGenerado = await dietasApi.generarPlan(perfil);
      await dietasApi.crearDietaUsuario({
        nombre: `Plan de ${nombre.trim()}`,
        plan_generado: planGenerado,
        perfil_usuario: perfil,
      });
      setPlan(planGenerado);
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('crearDietaError'));
    } finally {
      setLoading(false);
    }
  }

  const objetivoLabel = OBJETIVOS.find((o) => o.value === objetivo)?.label;
  const nivelLabel = NIVELES_ACTIVIDAD.find((n) => n.value === nivelActividad)?.label;
  const comidasLabel = COMIDAS_POR_DIA.find((c) => c.value === comidasPorDia)?.label;

  const pickerOptions =
    pickerOpen === 'objetivo'
      ? OBJETIVOS
      : pickerOpen === 'nivelActividad'
      ? NIVELES_ACTIVIDAD
      : pickerOpen === 'comidasPorDia'
      ? COMIDAS_POR_DIA
      : [];

  function handlePickerSelect(value: string | number) {
    if (pickerOpen === 'objetivo') setObjetivo(String(value));
    else if (pickerOpen === 'nivelActividad') setNivelActividad(String(value));
    else if (pickerOpen === 'comidasPorDia') setComidasPorDia(Number(value));
    setPickerOpen(null);
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark && darkStyles.safeArea]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView
          contentContainerStyle={[styles.scrollOuter, isDark && darkStyles.scrollOuter]}
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
              <Text style={styles.backBtnText}>{t('backVolver')}</Text>
            </Pressable>

            <Text style={styles.title}>{t('nuevaDietaTitle')}</Text>
            <Text style={styles.subtitle}>{t('nuevaDietaSubtitle')}</Text>
          </LinearGradient>

          <View style={styles.content}>
            {plan ? (
              <View style={[styles.floatingCard, isDark && darkStyles.card]}>
                <Text style={[styles.resultTitle, isDark && darkStyles.cardTitle]}>
                  {t('planGeneradoTitle')}
                </Text>
                <Text style={styles.resultDesc}>{t('planGeneradoDesc')}</Text>

                <View style={styles.caloriasBox}>
                  <Text style={styles.caloriasValue}>{plan.calorias_diarias}</Text>
                  <Text style={styles.caloriasLabel}>{t('caloriasDiarias')}</Text>
                </View>

                <View style={styles.diasList}>
                  {plan.dias.map((dia) => (
                    <View
                      key={dia.dia}
                      style={[styles.diaCard, isDark && darkStyles.diaCard]}>
                      <Text style={[styles.diaTitle, isDark && darkStyles.cardTitle]}>
                        {t('diaLabel', { n: dia.dia + 1 })} · {dia.fecha_formateada}
                      </Text>
                      {dia.comidas.map((comida) => (
                        <View key={comida.id} style={styles.comidaRow}>
                          <Text style={styles.comidaTipo}>
                            {comida.tipo} · {comida.hora}
                          </Text>
                          <Text style={styles.comidaCalorias}>{comida.calorias} kcal</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>

                <Pressable
                  style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed]}
                  onPress={() => router.replace('/dietas')}>
                  <Text style={styles.submitBtnText}>{t('volverDietas')}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={[styles.floatingCard, isDark && darkStyles.card]}>
                <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                  {t('cuentanosTitle')}
                </Text>
                <Text style={styles.cardSubtitle}>{t('cuentanosSubtitle')}</Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('fieldNombre')}</Text>
                  <TextInput
                    style={[styles.input, isDark && darkStyles.input]}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder={t('fieldNombrePlaceholder')}
                    placeholderTextColor="#b0c8a0"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.fieldRow}>
                  <View style={[styles.fieldGroup, styles.fieldFlex]}>
                    <Text style={styles.label}>{t('fieldEdad')}</Text>
                    <TextInput
                      style={[styles.input, isDark && darkStyles.input]}
                      value={edad}
                      onChangeText={setEdad}
                      placeholder={t('fieldEdadPlaceholder')}
                      placeholderTextColor="#b0c8a0"
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </View>
                  <View style={[styles.fieldGroup, styles.fieldFlex]}>
                    <Text style={styles.label}>{t('fieldPeso')}</Text>
                    <TextInput
                      style={[styles.input, isDark && darkStyles.input]}
                      value={peso}
                      onChangeText={setPeso}
                      placeholder={t('fieldPesoPlaceholder')}
                      placeholderTextColor="#b0c8a0"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('fieldAltura')}</Text>
                  <TextInput
                    style={[styles.input, isDark && darkStyles.input]}
                    value={altura}
                    onChangeText={setAltura}
                    placeholder={t('fieldAlturaPlaceholder')}
                    placeholderTextColor="#b0c8a0"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('fieldObjetivo')}</Text>
                  <Pressable
                    style={[styles.selectBox, isDark && darkStyles.input]}
                    onPress={() => setPickerOpen('objetivo')}>
                    <Text style={[styles.selectBoxText, isDark && darkStyles.selectBoxText]}>
                      {objetivoLabel ?? t('profileSelect')}
                    </Text>
                    <Text style={styles.selectBoxChevron}>▾</Text>
                  </Pressable>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('fieldNivelActividad')}</Text>
                  <Pressable
                    style={[styles.selectBox, isDark && darkStyles.input]}
                    onPress={() => setPickerOpen('nivelActividad')}>
                    <Text style={[styles.selectBoxText, isDark && darkStyles.selectBoxText]}>
                      {nivelLabel ?? t('profileSelect')}
                    </Text>
                    <Text style={styles.selectBoxChevron}>▾</Text>
                  </Pressable>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('fieldComidasPorDia')}</Text>
                  <Pressable
                    style={[styles.selectBox, isDark && darkStyles.input]}
                    onPress={() => setPickerOpen('comidasPorDia')}>
                    <Text style={[styles.selectBoxText, isDark && darkStyles.selectBoxText]}>
                      {comidasLabel ?? t('profileSelect')}
                    </Text>
                    <Text style={styles.selectBoxChevron}>▾</Text>
                  </Pressable>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('fieldEnfermedades')}</Text>
                  <TextInput
                    style={[styles.input, isDark && darkStyles.input]}
                    value={enfermedades}
                    onChangeText={setEnfermedades}
                    placeholder={t('fieldEnfermedadesPlaceholder')}
                    placeholderTextColor="#b0c8a0"
                  />
                  <Text style={styles.helperText}>{t('separaComas')}</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('fieldAlergias')}</Text>
                  <TextInput
                    style={[styles.input, isDark && darkStyles.input]}
                    value={alergias}
                    onChangeText={setAlergias}
                    placeholder={t('fieldAlergiasPlaceholder')}
                    placeholderTextColor="#b0c8a0"
                  />
                  <Text style={styles.helperText}>{t('separaComas')}</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('fieldNoGusta')}</Text>
                  <TextInput
                    style={[styles.input, isDark && darkStyles.input]}
                    value={noGusta}
                    onChangeText={setNoGusta}
                    placeholder={t('fieldNoGustaPlaceholder')}
                    placeholderTextColor="#b0c8a0"
                  />
                  <Text style={styles.helperText}>{t('separaComas')}</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('fieldPreferencias')}</Text>
                  <View style={styles.checkGrid}>
                    {RESTRICCIONES.map((r) => {
                      const checked = restricciones.includes(r.value);
                      return (
                        <Pressable
                          key={r.value}
                          style={[styles.checkChip, checked && styles.checkChipActive]}
                          onPress={() => toggleRestriccion(r.value)}>
                          <View style={[styles.checkbox, checked && styles.checkboxChecked]} />
                          <Text
                            style={[styles.checkChipText, checked && styles.checkChipTextActive]}>
                            {r.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.submitBtn, (pressed || loading) && styles.pressed]}
                  disabled={loading}
                  onPress={handleGenerar}>
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitBtnText}>{t('generarPlanBtn')}</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={pickerOpen !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(null)} />
        <View style={[styles.pickerModal, isDark && darkStyles.card]}>
          <ScrollView>
            {pickerOptions.map((opt) => (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [styles.pickerOption, pressed && styles.pressed]}
                onPress={() => handlePickerSelect(opt.value)}>
                <Text style={[styles.pickerOptionText, isDark && darkStyles.cardTitle]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
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
    paddingBottom: 44,
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
    marginBottom: 16,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
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
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 19,
  },

  /* Contenido */
  content: {
    paddingHorizontal: 20,
  },
  floatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 14,
    marginTop: -28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  cardTitle: {
    color: '#1a2e1a',
    fontSize: 18,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: -8,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: 5,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldFlex: {
    flex: 1,
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
  helperText: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 1,
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
  selectBoxText: {
    flex: 1,
    fontSize: 14,
    color: '#1a2e1a',
  },
  selectBoxChevron: {
    color: '#2E7D32',
    fontSize: 14,
  },

  /* Preferencias (checkboxes) */
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ededed',
  },
  checkChipActive: {
    backgroundColor: '#f0f9e8',
    borderColor: '#2E7D32',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#bbb',
  },
  checkboxChecked: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  checkChipText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  checkChipTextActive: {
    color: '#2E7D32',
  },

  /* Submit */
  submitBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* Resultado del plan */
  resultTitle: {
    color: '#1a2e1a',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultDesc: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: -8,
  },
  caloriasBox: {
    alignItems: 'center',
    backgroundColor: '#f0f9e8',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  caloriasValue: {
    color: '#2E7D32',
    fontSize: 32,
    fontWeight: '800',
  },
  caloriasLabel: {
    color: '#3aab14',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  diasList: {
    gap: 10,
  },
  diaCard: {
    backgroundColor: '#f9faf7',
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  diaTitle: {
    color: '#1a2e1a',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  comidaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comidaTipo: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
  comidaCalorias: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Picker modal */
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerModal: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '20%',
    maxHeight: '60%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  pickerOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  pickerOptionText: {
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '600',
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
    borderColor: '#2a2a2a',
  },
  cardTitle: {
    color: '#f2f2f2',
  },
  input: {
    backgroundColor: '#262626',
    borderColor: '#3a4a33',
    color: '#f2f2f2',
  },
  selectBoxText: {
    color: '#f2f2f2',
  },
  diaCard: {
    backgroundColor: '#262626',
  },
});
