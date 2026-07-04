import { useEffect, useState } from 'react';
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
import { router } from 'expo-router';
import { getUser, ordenesApi, direccionesApi, Direccion } from '@/services/api';
import { clearCart, getCartCount, getCartTotal, removeFromCart, setQuantity, useCart } from '@/services/cart';
import { useAppPreferences } from '@/context/app-preferences';

type Step = 1 | 2 | 3 | 4;
type MetodoPago = 'efectivo' | 'tarjeta';

const TIPO_DIRECCION_OPTIONS = [
  { value: 'casa', labelKey: 'tipoCasa' },
  { value: 'oficina', labelKey: 'tipoOficina' },
  { value: 'otro', labelKey: 'tipoOtro' },
];

function formatPrecio(precio: number) {
  return `$${precio.toFixed(2)}`;
}

function formatDireccion(d: Direccion) {
  return (
    d.direccion_completa ??
    `${d.calle} ${d.numero_exterior}${d.numero_interior ? ` int. ${d.numero_interior}` : ''}, ${d.colonia}, ${d.ciudad}, ${d.estado}, CP ${d.codigo_postal}`
  );
}

function BasketIcon() {
  return (
    <View style={styles.basketIconWrap}>
      <View style={styles.basketIconBody} />
      <View style={styles.basketIconHandle} />
    </View>
  );
}

function StepIndicator({ currentStep, t }: { currentStep: Step; t: (key: string) => string }) {
  const labels = [
    t('checkoutStepCarrito'),
    t('checkoutStepInformacion'),
    t('checkoutStepDireccion'),
    t('checkoutStepPago'),
  ];
  const fillPct = ((currentStep - 1) / (labels.length - 1)) * 100;

  return (
    <View style={styles.stepperWrap}>
      <View style={styles.stepperTrack}>
        <View style={styles.stepperBaseLine} />
        <View style={[styles.stepperFillLine, { width: `${fillPct}%` }]} />
        <View style={styles.stepperCirclesRow}>
          {labels.map((_, idx) => {
            const n = (idx + 1) as Step;
            const done = currentStep > n;
            const active = currentStep === n;
            return (
              <View
                key={n}
                style={[styles.stepperCircle, (done || active) && styles.stepperCircleActive]}>
                <Text
                  style={[styles.stepperCircleText, (done || active) && styles.stepperCircleTextActive]}>
                  {done ? '✓' : n}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.stepperLabelsRow}>
        {labels.map((label, idx) => (
          <Text
            key={label}
            style={[styles.stepperLabel, currentStep === idx + 1 && styles.stepperLabelActive]}
            numberOfLines={1}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function CarritoScreen() {
  const { isDark, t } = useAppPreferences();
  const user = getUser();
  const items = useCart();
  const total = getCartTotal(items);
  const count = getCartCount(items);

  const [step, setStep] = useState<Step>(1);

  // Paso 3: Dirección
  const [direcciones, setDirecciones] = useState<Direccion[]>(user?.direcciones ?? []);
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [selectedDireccionId, setSelectedDireccionId] = useState<number | string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [calle, setCalle] = useState('');
  const [numeroExterior, setNumeroExterior] = useState('');
  const [numeroInterior, setNumeroInterior] = useState('');
  const [colonia, setColonia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [tipoDireccion, setTipoDireccion] = useState('casa');
  const [referencias, setReferencias] = useState('');
  const [savingDireccion, setSavingDireccion] = useState(false);

  // Paso 4: Pago
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [notas, setNotas] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (step === 3) fetchDirecciones();
  }, [step]);

  async function fetchDirecciones() {
    setLoadingDirecciones(true);
    try {
      const data = await direccionesApi.getMine();
      setDirecciones(data);
      if (data.length > 0) {
        setSelectedDireccionId((prev) => prev ?? (data.find((d) => d.predeterminada) ?? data[0]).id);
      } else {
        setShowNewAddressForm(true);
      }
    } catch {
      setShowNewAddressForm(true);
    } finally {
      setLoadingDirecciones(false);
    }
  }

  function resetNewAddressForm() {
    setCalle('');
    setNumeroExterior('');
    setNumeroInterior('');
    setColonia('');
    setCiudad('');
    setEstado('');
    setCodigoPostal('');
    setReferencias('');
    setTipoDireccion('casa');
  }

  async function handleAddAddress() {
    if (!calle.trim() || !numeroExterior.trim() || !colonia.trim() || !ciudad.trim() || !estado.trim() || !codigoPostal.trim()) {
      Alert.alert(t('requiredFieldsTitle'), t('requiredFieldsMsg'));
      return;
    }
    setSavingDireccion(true);
    try {
      const nueva = await direccionesApi.add({
        calle: calle.trim(),
        numero_exterior: numeroExterior.trim(),
        numero_interior: numeroInterior.trim() || undefined,
        colonia: colonia.trim(),
        ciudad: ciudad.trim(),
        estado: estado.trim(),
        codigo_postal: codigoPostal.trim(),
        referencias: referencias.trim() || undefined,
        tipo: tipoDireccion,
      });
      setDirecciones((prev) => [...prev, nueva]);
      setSelectedDireccionId(nueva.id);
      setShowNewAddressForm(false);
      resetNewAddressForm();
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('profileAddressError'));
    } finally {
      setSavingDireccion(false);
    }
  }

  function handleContinueToDireccion() {
    if (!user?.nombre?.trim() || !user?.telefono?.trim()) {
      Alert.alert(t('requiredFieldsTitle'), t('requiredFieldsMsg'));
      return;
    }
    setStep(3);
  }

  function handleContinueToPago() {
    if (selectedDireccionId == null) {
      Alert.alert(t('direccionRequeridaTitle'), t('direccionRequeridaMsg'));
      return;
    }
    setStep(4);
  }

  async function handleConfirmar() {
    if (!user) {
      Alert.alert(t('errorTitle'), t('carritoLoginRequired'));
      return;
    }
    const direccionSeleccionada = direcciones.find((d) => d.id === selectedDireccionId);
    setPlacing(true);
    try {
      const res = await ordenesApi.createCarrito({
        nombre_usuario: user.nombre,
        telefono_usuario: user.telefono,
        items: items.map((i) => ({
          suplemento_id: i.suplementoId,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precio_unitario: i.precio,
        })),
        precio_total: total,
        metodo_pago: metodoPago,
        notas: notas.trim() || undefined,
        direccion_id: direccionSeleccionada?.id,
        direccion_texto: direccionSeleccionada ? formatDireccion(direccionSeleccionada) : undefined,
      });
      clearCart();
      Alert.alert(
        t('pedidoConfirmadoTitle'),
        t('pedidoConfirmadoMsg', { codigo: res.orden.codigo_unico }),
        [{ text: t('aceptar'), onPress: () => router.replace('/(tabs)') }]
      );
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('pedidoError'));
    } finally {
      setPlacing(false);
    }
  }

  const headerTitle =
    step === 1
      ? t('carritoTitle')
      : step === 2
      ? t('informacionPersonalTitle')
      : step === 3
      ? t('direccionEntregaTitle')
      : t('metodoPagoTitle');

  const headerSubtitle =
    step === 1
      ? count === 0
        ? t('carritoEmptySubtitle')
        : t('carritoHeaderCount', { count })
      : step === 2
      ? t('informacionPersonalSubtitle')
      : step === 3
      ? t('direccionEntregaSubtitle')
      : undefined;

  return (
    <SafeAreaView style={[styles.safeArea, isDark && darkStyles.safeArea]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView
          contentContainerStyle={[styles.scrollOuter, isDark && darkStyles.scrollOuter]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Encabezado en degradado */}
          <LinearGradient
            colors={['#4EC920', '#1B5E20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}>
            <View pointerEvents="none" style={styles.headerBlob} />

            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              onPress={() => router.push('/productos')}>
              <Text style={styles.backBtnText}>{t('seguirComprando')}</Text>
            </Pressable>

            <View style={styles.headerTitleRow}>
              <BasketIcon />
              <Text style={styles.title}>{headerTitle}</Text>
            </View>
            {headerSubtitle ? <Text style={styles.subtitle}>{headerSubtitle}</Text> : null}

            <StepIndicator currentStep={step} t={t} />
          </LinearGradient>

          <View style={styles.content}>
            {step === 1 && (
              <>
                {items.length === 0 ? (
                  <View style={[styles.floatingCard, isDark && darkStyles.card]}>
                    <Text style={[styles.emptyTitle, isDark && darkStyles.cardTitle]}>
                      {t('carritoEmptyTitle')}
                    </Text>
                    <Text style={styles.emptyText}>{t('carritoEmptyDesc')}</Text>
                    <Pressable
                      style={({ pressed }) => [styles.emptyBtn, pressed && styles.pressed]}
                      onPress={() => router.push('/productos')}>
                      <Text style={styles.emptyBtnText}>{t('verProductos')}</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <View style={[styles.floatingCard, isDark && darkStyles.card]}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                          {t('suplementosEnCarrito')}
                        </Text>
                        <Pressable
                          style={({ pressed }) => [styles.destructiveSmallBtn, pressed && styles.pressed]}
                          onPress={clearCart}>
                          <Text style={styles.destructiveSmallBtnText}>{t('vaciarCarrito')}</Text>
                        </Pressable>
                      </View>

                      {items.map((item, idx) => (
                        <View
                          key={item.suplementoId}
                          style={[styles.itemRow, idx < items.length - 1 && styles.itemRowDivider]}>
                          <View style={styles.itemIconBadge}>
                            <Text style={styles.itemIconText}>{item.nombre[0]?.toUpperCase() ?? '?'}</Text>
                          </View>

                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
                            <Text style={styles.itemPrice}>{formatPrecio(item.precio)} c/u</Text>
                          </View>

                          <View style={styles.qtyStepper}>
                            <Pressable
                              style={({ pressed }) => [styles.qtyBtn, pressed && styles.pressed]}
                              onPress={() => setQuantity(item.suplementoId, item.cantidad - 1)}>
                              <Text style={styles.qtyBtnText}>−</Text>
                            </Pressable>
                            <Text style={styles.qtyValue}>{item.cantidad}</Text>
                            <Pressable
                              disabled={item.cantidad >= item.stock}
                              style={({ pressed }) => [
                                styles.qtyBtn,
                                item.cantidad >= item.stock && styles.qtyBtnDisabled,
                                pressed && styles.pressed,
                              ]}
                              onPress={() => setQuantity(item.suplementoId, item.cantidad + 1)}>
                              <Text style={styles.qtyBtnText}>+</Text>
                            </Pressable>
                          </View>

                          <Pressable
                            style={({ pressed }) => [styles.removeBtn, pressed && styles.pressed]}
                            onPress={() => removeFromCart(item.suplementoId)}
                            hitSlop={8}>
                            <Text style={styles.removeBtnText}>✕</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>

                    <View style={[styles.summaryCard, isDark && darkStyles.card]}>
                      <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                        {t('resumenPedido')}
                      </Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{t('suplementosLabel', { count })}</Text>
                        <Text style={styles.summaryValue}>{formatPrecio(total)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{t('costoEnvio')}</Text>
                        <Text style={styles.summaryValueFree}>{t('envioGratisValor')}</Text>
                      </View>
                      <View style={styles.summaryDivider} />
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryTotalLabel}>{t('totalPagar')}</Text>
                        <Text style={styles.summaryTotal}>{formatPrecio(total)}</Text>
                      </View>
                      <Pressable
                        style={({ pressed }) => [styles.confirmBtn, pressed && styles.pressed]}
                        onPress={() => setStep(2)}>
                        <Text style={styles.confirmBtnText}>{t('continuarConPedido')}</Text>
                      </Pressable>
                    </View>

                    <View style={styles.trustList}>
                      <View style={styles.trustRow}>
                        <View style={styles.trustCheck}><Text style={styles.trustCheckText}>✓</Text></View>
                        <Text style={styles.trustText}>{t('trustEnvioGratis')}</Text>
                      </View>
                      <View style={styles.trustRow}>
                        <View style={styles.trustCheck}><Text style={styles.trustCheckText}>✓</Text></View>
                        <Text style={styles.trustText}>{t('trustEntregaGarantizada')}</Text>
                      </View>
                      <View style={styles.trustRow}>
                        <View style={styles.trustCheck}><Text style={styles.trustCheckText}>✓</Text></View>
                        <Text style={styles.trustText}>{t('trustPagoFlexible')}</Text>
                      </View>
                    </View>
                  </>
                )}
              </>
            )}

            {step === 2 && (
              <View style={[styles.floatingCard, isDark && darkStyles.card]}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('nombreCompletoLabel')} *</Text>
                  <View style={[styles.readonlyBox, isDark && darkStyles.readonlyBox]}>
                    <Text style={[styles.readonlyText, isDark && darkStyles.readonlyText]}>
                      {user?.nombre ?? '—'}
                    </Text>
                  </View>
                  <Text style={styles.helperText}>{t('obtenidoDePerfil')}</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t('phone')} *</Text>
                  <View style={[styles.readonlyBox, isDark && darkStyles.readonlyBox]}>
                    <Text style={[styles.readonlyText, isDark && darkStyles.readonlyText]}>
                      {user?.telefono ?? '—'}
                    </Text>
                  </View>
                  <Text style={styles.helperText}>{t('obtenidoDePerfil')}</Text>
                </View>

                <View style={styles.stepButtonsRow}>
                  <Pressable
                    style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                    onPress={() => setStep(1)}>
                    <Text style={styles.secondaryBtnText}>{t('prevStep')}</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.primaryBtn, styles.primaryBtnFlex, pressed && styles.pressed]}
                    onPress={handleContinueToDireccion}>
                    <Text style={styles.primaryBtnText}>{t('continuarADireccion')}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={[styles.floatingCard, isDark && darkStyles.card]}>
                {loadingDirecciones ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color="#4EC920" />
                  </View>
                ) : (
                  <>
                    {direcciones.length > 0 && (
                      <>
                        <View style={styles.cardHeaderRow}>
                          <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                            {t('misDireccionesLabel')}
                          </Text>
                          {!showNewAddressForm && (
                            <Pressable
                              style={({ pressed }) => [styles.smallBtn, pressed && styles.pressed]}
                              onPress={() => setShowNewAddressForm(true)}>
                              <Text style={styles.smallBtnText}>{t('agregarNuevaDireccionBtn')}</Text>
                            </Pressable>
                          )}
                        </View>

                        {!showNewAddressForm && (
                          <View style={styles.addressList}>
                            {direcciones.map((d) => {
                              const active = selectedDireccionId === d.id;
                              return (
                                <Pressable
                                  key={d.id}
                                  style={[styles.addressCard, active && styles.addressCardActive]}
                                  onPress={() => setSelectedDireccionId(d.id)}>
                                  <View style={[styles.radio, active && styles.radioActive]} />
                                  <Text
                                    style={[styles.addressCardText, isDark && darkStyles.readonlyText]}
                                    numberOfLines={2}>
                                    {formatDireccion(d)}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        )}
                      </>
                    )}

                    {showNewAddressForm && (
                      <View style={direcciones.length > 0 ? styles.inlineForm : undefined}>
                        <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                          {t('nuevaDireccionTitle')}
                        </Text>

                        <View style={styles.fieldGroup}>
                          <Text style={styles.label}>{t('profileStreet')}</Text>
                          <TextInput
                            style={[styles.input, isDark && darkStyles.input]}
                            value={calle}
                            onChangeText={setCalle}
                            placeholder={t('campoCallePlaceholder')}
                            placeholderTextColor="#b0c8a0"
                          />
                        </View>

                        <View style={styles.fieldRow}>
                          <View style={[styles.fieldGroup, styles.fieldFlex]}>
                            <Text style={styles.label}>{t('profileExtNumber')}</Text>
                            <TextInput
                              style={[styles.input, isDark && darkStyles.input]}
                              value={numeroExterior}
                              onChangeText={setNumeroExterior}
                              placeholder="123"
                              placeholderTextColor="#b0c8a0"
                            />
                          </View>
                          <View style={[styles.fieldGroup, styles.fieldFlex]}>
                            <Text style={styles.label}>{t('profileIntNumber')}</Text>
                            <TextInput
                              style={[styles.input, isDark && darkStyles.input]}
                              value={numeroInterior}
                              onChangeText={setNumeroInterior}
                              placeholder="A"
                              placeholderTextColor="#b0c8a0"
                            />
                          </View>
                        </View>

                        <View style={styles.fieldGroup}>
                          <Text style={styles.label}>{t('profileNeighborhood')}</Text>
                          <TextInput
                            style={[styles.input, isDark && darkStyles.input]}
                            value={colonia}
                            onChangeText={setColonia}
                            placeholder={t('campoColoniaPlaceholder')}
                            placeholderTextColor="#b0c8a0"
                          />
                        </View>

                        <View style={styles.fieldRow}>
                          <View style={[styles.fieldGroup, styles.fieldFlex]}>
                            <Text style={styles.label}>{t('profileCity')}</Text>
                            <TextInput
                              style={[styles.input, isDark && darkStyles.input]}
                              value={ciudad}
                              onChangeText={setCiudad}
                              placeholder={t('campoCiudadPlaceholder')}
                              placeholderTextColor="#b0c8a0"
                            />
                          </View>
                          <View style={[styles.fieldGroup, styles.fieldFlex]}>
                            <Text style={styles.label}>{t('profileState')}</Text>
                            <TextInput
                              style={[styles.input, isDark && darkStyles.input]}
                              value={estado}
                              onChangeText={setEstado}
                              placeholder={t('campoEstadoPlaceholder')}
                              placeholderTextColor="#b0c8a0"
                            />
                          </View>
                        </View>

                        <View style={styles.fieldGroup}>
                          <Text style={styles.label}>{t('profileZip')}</Text>
                          <TextInput
                            style={[styles.input, isDark && darkStyles.input]}
                            value={codigoPostal}
                            onChangeText={setCodigoPostal}
                            keyboardType="number-pad"
                            maxLength={5}
                            placeholder="12345"
                            placeholderTextColor="#b0c8a0"
                          />
                          <Text style={styles.helperText}>{t('campoCPHelper')}</Text>
                        </View>

                        <View style={styles.fieldGroup}>
                          <Text style={styles.label}>{t('tipoDireccionLabel')}</Text>
                          <View style={styles.chipsRow}>
                            {TIPO_DIRECCION_OPTIONS.map((opt) => {
                              const active = tipoDireccion === opt.value;
                              return (
                                <Pressable
                                  key={opt.value}
                                  style={[styles.chip, active && styles.chipActive]}
                                  onPress={() => setTipoDireccion(opt.value)}>
                                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                    {t(opt.labelKey)}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>

                        <View style={styles.fieldGroup}>
                          <Text style={styles.label}>{t('referenciasOpcional')}</Text>
                          <TextInput
                            style={[styles.input, isDark && darkStyles.input]}
                            value={referencias}
                            onChangeText={setReferencias}
                            placeholder={t('referenciasPlaceholder')}
                            placeholderTextColor="#b0c8a0"
                            multiline
                          />
                        </View>

                        <View style={styles.inlineFormActions}>
                          {direcciones.length > 0 && (
                            <Pressable
                              style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                              onPress={() => setShowNewAddressForm(false)}>
                              <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                            </Pressable>
                          )}
                          <Pressable
                            style={({ pressed }) => [
                              styles.saveAddressBtn,
                              (pressed || savingDireccion) && styles.pressed,
                            ]}
                            disabled={savingDireccion}
                            onPress={handleAddAddress}>
                            {savingDireccion ? (
                              <ActivityIndicator color="#ffffff" />
                            ) : (
                              <Text style={styles.primaryBtnText}>{t('guardarDireccionBtn')}</Text>
                            )}
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </>
                )}

                <View style={styles.stepButtonsRow}>
                  <Pressable
                    style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                    onPress={() => setStep(2)}>
                    <Text style={styles.secondaryBtnText}>{t('prevStep')}</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.primaryBtn, styles.primaryBtnFlex, pressed && styles.pressed]}
                    onPress={handleContinueToPago}>
                    <Text style={styles.primaryBtnText}>{t('continuarAPago')}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {step === 4 && (
              <>
                <View style={[styles.floatingCard, isDark && darkStyles.card]}>
                  <Pressable
                    style={[styles.paymentCard, metodoPago === 'efectivo' && styles.paymentCardActive]}
                    onPress={() => setMetodoPago('efectivo')}>
                    <View style={[styles.radio, metodoPago === 'efectivo' && styles.radioActive]} />
                    <Text style={styles.paymentEmoji}>💵</Text>
                    <View style={styles.paymentTextWrap}>
                      <Text style={[styles.paymentTitle, isDark && darkStyles.cardTitle]}>
                        {t('pagoEfectivoTitle')}
                      </Text>
                      <Text style={styles.paymentSubtitle}>{t('pagoEfectivoSubtitle')}</Text>
                      <Text style={styles.paymentDesc}>{t('pagoEfectivoDesc')}</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    style={[styles.paymentCard, metodoPago === 'tarjeta' && styles.paymentCardActive]}
                    onPress={() => setMetodoPago('tarjeta')}>
                    <View style={[styles.radio, metodoPago === 'tarjeta' && styles.radioActive]} />
                    <Text style={styles.paymentEmoji}>💳</Text>
                    <View style={styles.paymentTextWrap}>
                      <Text style={[styles.paymentTitle, isDark && darkStyles.cardTitle]}>
                        {t('pagoTarjetaTitle')}
                      </Text>
                      <Text style={styles.paymentSubtitle}>{t('pagoTarjetaSubtitle')}</Text>
                      <Text style={styles.paymentDesc}>{t('pagoTarjetaDesc')}</Text>
                    </View>
                  </Pressable>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('notasAdicionalesLabel')}</Text>
                    <TextInput
                      style={[styles.input, styles.textArea, isDark && darkStyles.input]}
                      value={notas}
                      onChangeText={setNotas}
                      placeholder={t('notasAdicionalesPlaceholder')}
                      placeholderTextColor="#b0c8a0"
                      multiline
                    />
                    <Text style={styles.helperText}>{t('notasEnvioHelper')}</Text>
                  </View>
                </View>

                <View style={[styles.summaryCard, isDark && darkStyles.card]}>
                  <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                    {t('resumenPedido')}
                  </Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('suplementosLabel', { count })}</Text>
                    <Text style={styles.summaryValue}>{formatPrecio(total)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('envioLabel')}</Text>
                    <Text style={styles.summaryValueFree}>{t('envioGratisValor')}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('metodoPagoResumenLabel')}</Text>
                    <Text style={styles.summaryValue}>
                      {metodoPago === 'efectivo' ? t('metodoPagoEfectivoCorto') : t('metodoPagoTarjetaCorto')}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotalLabel}>{t('totalLabel')}</Text>
                    <Text style={styles.summaryTotal}>{formatPrecio(total)}</Text>
                  </View>

                  <View style={styles.stepButtonsRow}>
                    <Pressable
                      style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                      onPress={() => setStep(3)}>
                      <Text style={styles.secondaryBtnText}>{t('prevStep')}</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        styles.primaryBtnFlex,
                        (pressed || placing) && styles.pressed,
                      ]}
                      disabled={placing}
                      onPress={handleConfirmar}>
                      {placing ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.primaryBtnText}>
                          {t('finalizarPedidoBtn')} - {formatPrecio(total)}
                        </Text>
                      )}
                    </Pressable>
                  </View>

                  <Text style={styles.disclaimerText}>{t('terminosDisclaimer')}</Text>
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
    paddingBottom: 24,
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },

  /* Icono canasta */
  basketIconWrap: {
    width: 26,
    height: 24,
    alignItems: 'center',
  },
  basketIconBody: {
    width: 24,
    height: 17,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginTop: 7,
  },
  basketIconHandle: {
    position: 'absolute',
    top: 0,
    width: 14,
    height: 10,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  /* Stepper */
  stepperWrap: {
    marginTop: 22,
  },
  stepperTrack: {
    height: 26,
    justifyContent: 'center',
  },
  stepperBaseLine: {
    position: 'absolute',
    left: 13,
    right: 13,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  stepperFillLine: {
    position: 'absolute',
    left: 13,
    height: 2,
    backgroundColor: '#ffffff',
  },
  stepperCirclesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  stepperCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircleActive: {
    backgroundColor: '#ffffff',
  },
  stepperCircleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  stepperCircleTextActive: {
    color: '#1B5E20',
  },
  stepperLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  stepperLabel: {
    flex: 1,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepperLabelActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  /* Contenido */
  content: {
    paddingHorizontal: 20,
    gap: 14,
    marginTop: -30,
  },
  floatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#1a2e1a',
    fontSize: 16,
    fontWeight: '800',
  },
  smallBtn: {
    backgroundColor: '#f0f9e8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  smallBtnText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },
  destructiveSmallBtn: {
    backgroundColor: '#fdecec',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#f5c6c6',
  },
  destructiveSmallBtnText: {
    color: '#e05050',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Estado vacío */
  emptyTitle: {
    color: '#1a2e1a',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  emptyBtn: {
    backgroundColor: '#4EC920',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Item del carrito */
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  itemRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemIconText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '800',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '700',
  },
  itemPrice: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyBtnText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 16,
  },
  qtyValue: {
    color: '#1a2e1a',
    fontSize: 13,
    fontWeight: '700',
    minWidth: 16,
    textAlign: 'center',
  },
  removeBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#c9c9c9',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Campos genéricos */
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
    color: '#4EC920',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f7f9f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a2e1a',
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  helperText: {
    color: '#999',
    fontSize: 11,
    marginTop: 2,
  },
  readonlyBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  readonlyText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Botones de navegación entre pasos */
  stepButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnFlex: {
    flex: 1,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  secondaryBtnText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Resumen del pedido */
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryValueFree: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 2,
  },
  summaryTotalLabel: {
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '800',
  },
  summaryTotal: {
    color: '#2E7D32',
    fontSize: 22,
    fontWeight: '800',
  },
  confirmBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  disclaimerText: {
    color: '#999',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },

  /* Confianza */
  trustList: {
    gap: 10,
    paddingHorizontal: 4,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trustCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustCheckText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '800',
  },
  trustText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  /* Selección de dirección */
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  addressList: {
    gap: 8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e3e8dd',
    backgroundColor: '#f9faf7',
  },
  addressCardActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#eaf6df',
  },
  addressCardText: {
    flex: 1,
    color: '#333',
    fontSize: 13,
    lineHeight: 18,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#bbb',
    flexShrink: 0,
  },
  radioActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#2E7D32',
  },
  inlineForm: {
    gap: 12,
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ededed',
  },
  chipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  chipText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  inlineFormActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
  saveAddressBtn: {
    flex: 1,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  /* Método de pago */
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e3e8dd',
    backgroundColor: '#f9faf7',
  },
  paymentCardActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#eaf6df',
  },
  paymentEmoji: {
    fontSize: 24,
  },
  paymentTextWrap: {
    flex: 1,
    gap: 2,
  },
  paymentTitle: {
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '700',
  },
  paymentSubtitle: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDesc: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
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
  readonlyBox: {
    backgroundColor: '#262626',
    borderColor: '#333',
  },
  readonlyText: {
    color: '#ddd',
  },
});
