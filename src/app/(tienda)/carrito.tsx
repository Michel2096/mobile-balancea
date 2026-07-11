import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { Ionicons } from '@expo/vector-icons';
import { getUser, ordenesApi, direccionesApi, Direccion, AddDireccionPayload } from '@/services/api';
import { clearCart, getCartCount, getCartTotal, removeFromCart, setQuantity, useCart } from '@/services/cart';
import { refreshUnreadCount } from '@/services/notifications';
import { useAppPreferences } from '@/context/app-preferences';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { AddressList } from '@/components/checkout/AddressList';
import { AddressFormModal } from '@/components/checkout/AddressFormModal';
import { AddressCard, addressTypeInfo } from '@/components/checkout/AddressCard';
import { PaymentMethodCard } from '@/components/checkout/PaymentMethodCard';
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard';
import { CheckoutNavButtons } from '@/components/checkout/CheckoutNavButtons';
import { PaymentSuccessBanner } from '@/components/checkout/PaymentSuccessBanner';
import { ReviewCard } from '@/components/checkout/ReviewCard';
import { SuccessValidationCard } from '@/components/checkout/SuccessValidationCard';
import { TrustBadges } from '@/components/checkout/TrustBadges';

type Step = 1 | 2 | 3 | 4 | 5;
type MetodoPago = 'efectivo' | 'tarjeta';

type ConfirmedOrder = {
  codigo: string;
  itemsCount: number;
  total: number;
  metodoPago: MetodoPago;
  direccion?: Direccion;
};

function formatPrecio(precio: number) {
  return `$${precio.toFixed(2)}`;
}

function formatDireccion(d: Direccion) {
  return (
    d.direccion_completa ??
    `${d.calle} ${d.numero_exterior}${d.numero_interior ? ` int. ${d.numero_interior}` : ''}, ${d.colonia}, ${d.ciudad}, ${d.estado}, CP ${d.codigo_postal}`
  );
}

// El backend responde en distintos formatos según el endpoint (a veces un
// array plano, a veces envuelto en { direcciones: [...] } o { data: [...] }).
// Devuelve `null` cuando la forma no se reconoce, para no confundir "sin
// direcciones" con "no se pudo interpretar la respuesta".
function extractDireccionesArray(raw: unknown): Direccion[] | null {
  if (Array.isArray(raw)) return raw as Direccion[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.direcciones)) return obj.direcciones as Direccion[];
    if (Array.isArray(obj.data)) return obj.data as Direccion[];
    if (Array.isArray(obj.results)) return obj.results as Direccion[];
  }
  return null;
}

function BasketIcon() {
  return (
    <View style={styles.basketIconWrap}>
      <View style={styles.basketIconBody} />
      <View style={styles.basketIconHandle} />
    </View>
  );
}

function EmptyCartIllustration() {
  return (
    <View style={styles.illustrationWrap}>
      <View style={styles.illustrationRingOuter} />
      <View style={styles.illustrationRingInner}>
        <View style={styles.illustrationBasketHandle} />
        <View style={styles.illustrationBasketBody}>
          <View style={styles.illustrationBasketLine} />
          <View style={styles.illustrationBasketLine} />
          <View style={styles.illustrationBasketLine} />
        </View>
      </View>
      <View style={[styles.illustrationDot, styles.illustrationDotTopRight]} />
      <View style={[styles.illustrationDot, styles.illustrationDotBottomLeft]} />
    </View>
  );
}

function EmptyCartCard({ t, isDark }: { t: (key: string) => string; isDark: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const animatedStyle = {
    opacity: anim,
    transform: [
      { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
    ],
  };

  return (
    <Animated.View style={[styles.emptyCard, isDark && darkStyles.card, animatedStyle]}>
      <EmptyCartIllustration />
      <Text style={[styles.emptyTitle, isDark && darkStyles.cardTitle]}>
        {t('carritoEmptyTitle')}
      </Text>
      <Text style={styles.emptyText}>{t('carritoEmptyDesc')}</Text>
      <Pressable
        style={({ pressed }) => [styles.emptyBtn, pressed && styles.emptyBtnPressed]}
        onPress={() => router.push('/productos')}>
        <Text style={styles.emptyBtnText}>{t('verProductos')}</Text>
        <Text style={styles.emptyBtnArrow}>→</Text>
      </Pressable>
    </Animated.View>
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
  const [direcciones, setDirecciones] = useState<Direccion[]>(
    Array.isArray(user?.direcciones) ? user.direcciones : []
  );
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [selectedDireccionId, setSelectedDireccionId] = useState<number | string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savingDireccion, setSavingDireccion] = useState(false);

  // Paso 4: Pago
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [notas, setNotas] = useState('');
  const [placing, setPlacing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  const direccionSeleccionada = direcciones.find((d) => d.id === selectedDireccionId);

  useEffect(() => {
    if (step === 3) fetchDirecciones();
  }, [step]);

  async function fetchDirecciones() {
    setLoadingDirecciones(true);
    try {
      const raw: unknown = await direccionesApi.getMine();
      const lista = extractDireccionesArray(raw);
      if (lista === null) {
        // Forma de respuesta irreconocible: no pisamos las direcciones ya
        // cargadas (p. ej. las que vinieron con el perfil del usuario).
        return;
      }
      setDirecciones(lista);
      if (lista.length > 0) {
        setSelectedDireccionId((prev) => prev ?? (lista.find((d) => d.predeterminada) ?? lista[0]).id);
      } else {
        setShowNewAddressForm(true);
      }
    } catch {
      setShowNewAddressForm(true);
    } finally {
      setLoadingDirecciones(false);
    }
  }

  async function handleAddAddress(values: AddDireccionPayload) {
    setSavingDireccion(true);
    try {
      const nueva = await direccionesApi.add(values);
      setDirecciones((prev) => [...prev, nueva]);
      setSelectedDireccionId(nueva.id);
      setShowNewAddressForm(false);
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

  function handleContinueToResumen() {
    setStep(5);
  }

  async function handleConfirmar() {
    if (!user) {
      Alert.alert(t('errorTitle'), t('carritoLoginRequired'));
      return;
    }
    if (!direccionSeleccionada) {
      Alert.alert(t('direccionRequeridaTitle'), t('direccionRequeridaMsg'));
      return;
    }
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
      const resumen: ConfirmedOrder = {
        codigo: res.orden.codigo_unico,
        itemsCount: count,
        total,
        metodoPago,
        direccion: direccionSeleccionada,
      };
      clearCart();
      if (res.notificaciones_generadas) refreshUnreadCount();
      setConfirmedOrder(resumen);
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('pedidoError'));
    } finally {
      setPlacing(false);
    }
  }

  const headerTitle = confirmedOrder
    ? t('pedidoExitosoTitle')
    : step === 1
    ? t('carritoTitle')
    : step === 2
    ? t('informacionPersonalTitle')
    : step === 3
    ? t('checkoutStepDireccion')
    : step === 4
    ? t('metodoPagoTitle')
    : t('resumenPasoTitle');

  const headerSubtitle = confirmedOrder
    ? undefined
    : step === 1
    ? count === 0
      ? t('carritoEmptySubtitle')
      : t('carritoHeaderCount', { count })
    : step === 2
    ? t('informacionPersonalSubtitle')
    : step === 5
    ? t('resumenPasoSubtitle')
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

            <View style={styles.headerNavRow}>
              <Pressable
                style={({ pressed }) => [styles.backIconBtn, pressed && styles.pressed]}
                hitSlop={10}
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}>
                <Text style={styles.backIconBtnText}>←</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
                onPress={() => router.push('/productos')}>
                <Text style={styles.backBtnText}>{t('seguirComprando')}</Text>
              </Pressable>
            </View>

            <View style={styles.headerTitleRow}>
              <BasketIcon />
              <Text style={styles.title}>{headerTitle}</Text>
            </View>
            {headerSubtitle ? <Text style={styles.subtitle}>{headerSubtitle}</Text> : null}

            {!confirmedOrder && (
              <CheckoutStepper
                currentStep={step}
                labels={[
                  t('checkoutStepCarrito'),
                  t('checkoutStepInformacion'),
                  t('checkoutStepDireccion'),
                  t('checkoutStepPago'),
                  t('checkoutStepResumen'),
                ]}
              />
            )}
          </LinearGradient>

          <View style={styles.content}>
            {confirmedOrder ? (
              <>
                <PaymentSuccessBanner codigo={confirmedOrder.codigo} isDark={isDark} t={t} />

                <OrderSummaryCard
                  title={t('resumenPedido')}
                  isDark={isDark}
                  rows={[
                    {
                      key: 'items',
                      label: t('suplementosLabel', { count: confirmedOrder.itemsCount }),
                      value: formatPrecio(confirmedOrder.total),
                    },
                    { key: 'envio', label: t('envioLabel'), value: t('envioGratisValor'), emphasis: 'free' },
                    {
                      key: 'metodoPago',
                      label: t('metodoPagoResumenLabel'),
                      value:
                        confirmedOrder.metodoPago === 'efectivo'
                          ? t('metodoPagoEfectivoCorto')
                          : t('metodoPagoTarjetaCorto'),
                    },
                  ]}
                  addressLine={
                    confirmedOrder.direccion
                      ? {
                          label: t('direccionEntregaTitle'),
                          value: `${t(addressTypeInfo(confirmedOrder.direccion.tipo).labelKey)} · ${formatDireccion(
                            confirmedOrder.direccion
                          )}`,
                        }
                      : undefined
                  }
                  totalLabel={t('totalLabel')}
                  totalValue={formatPrecio(confirmedOrder.total)}
                  footer={
                    <CheckoutNavButtons
                      onNext={() => router.replace('/(tabs)')}
                      nextLabel={t('volverAlInicioBtn')}
                    />
                  }
                />
              </>
            ) : (
              <>
                {step === 1 && (
              <>
                {items.length === 0 ? (
                  <EmptyCartCard t={t} isDark={isDark} />
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
                            <Ionicons name="close" size={14} color="#c9c9c9" />
                          </Pressable>
                        </View>
                      ))}
                    </View>

                    <OrderSummaryCard
                      title={t('resumenPedido')}
                      isDark={isDark}
                      rows={[
                        { key: 'items', label: t('suplementosLabel', { count }), value: formatPrecio(total) },
                        { key: 'envio', label: t('costoEnvio'), value: t('envioGratisValor'), emphasis: 'free' },
                      ]}
                      totalLabel={t('totalPagar')}
                      totalValue={formatPrecio(total)}
                      footer={
                        <CheckoutNavButtons onNext={() => setStep(2)} nextLabel={t('continuarConPedido')} />
                      }
                    />

                    <View style={styles.trustList}>
                      <View style={styles.trustRow}>
                        <View style={styles.trustCheck}><Ionicons name="checkmark" size={11} color="#2E7D32" /></View>
                        <Text style={styles.trustText}>{t('trustEnvioGratis')}</Text>
                      </View>
                      <View style={styles.trustRow}>
                        <View style={styles.trustCheck}><Ionicons name="checkmark" size={11} color="#2E7D32" /></View>
                        <Text style={styles.trustText}>{t('trustEntregaGarantizada')}</Text>
                      </View>
                      <View style={styles.trustRow}>
                        <View style={styles.trustCheck}><Ionicons name="checkmark" size={11} color="#2E7D32" /></View>
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

                <CheckoutNavButtons
                  onBack={() => setStep(1)}
                  backLabel={t('prevStep')}
                  onNext={handleContinueToDireccion}
                  nextLabel={t('continuarADireccion')}
                />
              </View>
            )}

            {step === 3 && (
              <View style={[styles.floatingCard, isDark && darkStyles.card]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, isDark && darkStyles.cardTitle]}>
                    {t('direccionEntregaTitle')}
                  </Text>
                  <Text style={styles.sectionSubtitle}>{t('direccionEntregaSubtitle')}</Text>
                </View>

                {loadingDirecciones ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color="#4EC920" />
                  </View>
                ) : (
                  <AddressList
                    direcciones={direcciones}
                    selectedId={selectedDireccionId}
                    onSelect={setSelectedDireccionId}
                    onAddPress={() => setShowNewAddressForm(true)}
                    isDark={isDark}
                    t={t}
                  />
                )}

                <CheckoutNavButtons
                  onBack={() => setStep(2)}
                  backLabel={t('prevStep')}
                  onNext={handleContinueToPago}
                  nextLabel={t('continuarAPago')}
                  disabled={selectedDireccionId == null}
                />
              </View>
            )}

            <AddressFormModal
              visible={showNewAddressForm}
              saving={savingDireccion}
              isDark={isDark}
              t={t}
              onClose={() => setShowNewAddressForm(false)}
              onSave={handleAddAddress}
            />

            {step === 4 && (
              <View style={[styles.floatingCard, isDark && darkStyles.card]}>
                <PaymentMethodCard
                  icon="cash-outline"
                  title={t('pagoEfectivoTitle')}
                  subtitle={t('pagoEfectivoSubtitle')}
                  description={t('pagoEfectivoDesc')}
                  active={metodoPago === 'efectivo'}
                  isDark={isDark}
                  onSelect={() => setMetodoPago('efectivo')}
                />

                <PaymentMethodCard
                  icon="card-outline"
                  title={t('pagoTarjetaTitle')}
                  subtitle={t('pagoTarjetaSubtitle')}
                  description={t('pagoTarjetaDesc')}
                  active={metodoPago === 'tarjeta'}
                  isDark={isDark}
                  onSelect={() => setMetodoPago('tarjeta')}
                />

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

                <CheckoutNavButtons
                  onBack={() => setStep(3)}
                  backLabel={t('prevStep')}
                  onNext={handleContinueToResumen}
                  nextLabel={t('continuarConPedido')}
                />
              </View>
            )}

            {step === 5 && (
              <>
                <ReviewCard icon="bag-handle-outline" title={t('resumenProductosTitle')} isDark={isDark}>
                  {items.map((item, idx) => (
                    <View
                      key={item.suplementoId}
                      style={[styles.reviewItemRow, idx < items.length - 1 && styles.itemRowDivider]}>
                      <View style={styles.itemIconBadge}>
                        <Text style={styles.itemIconText}>{item.nombre[0]?.toUpperCase() ?? '?'}</Text>
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
                        <Text style={styles.itemPrice}>
                          {item.cantidad} × {formatPrecio(item.precio)}
                        </Text>
                      </View>
                      <Text style={styles.reviewItemSubtotal}>{formatPrecio(item.precio * item.cantidad)}</Text>
                    </View>
                  ))}
                </ReviewCard>

                <ReviewCard icon="person-outline" title={t('checkoutContactoTitle')} isDark={isDark}>
                  <View style={styles.reviewInfoRow}>
                    <Ionicons name="person-circle-outline" size={16} color="#2E7D32" />
                    <Text style={[styles.reviewInfoValue, isDark && darkStyles.readonlyText]}>
                      {user?.nombre ?? '—'}
                    </Text>
                  </View>
                  <View style={styles.reviewInfoRow}>
                    <Ionicons name="call-outline" size={16} color="#2E7D32" />
                    <Text style={[styles.reviewInfoValue, isDark && darkStyles.readonlyText]}>
                      {user?.telefono ?? '—'}
                    </Text>
                  </View>
                </ReviewCard>

                {direccionSeleccionada && (
                  <ReviewCard icon="location-outline" title={t('direccionEntregaTitle')} isDark={isDark}>
                    <AddressCard direccion={direccionSeleccionada} isDark={isDark} t={t} />
                  </ReviewCard>
                )}

                <ReviewCard icon="wallet-outline" title={t('metodoPagoSeleccionadoTitle')} isDark={isDark}>
                  <View style={[styles.reviewPaymentBadge, isDark && darkStyles.reviewPaymentBadge]}>
                    <View style={styles.reviewPaymentIconWrap}>
                      <Ionicons
                        name={metodoPago === 'efectivo' ? 'cash-outline' : 'card-outline'}
                        size={20}
                        color="#ffffff"
                      />
                    </View>
                    <View style={styles.textWrap}>
                      <Text style={[styles.reviewPaymentTitle, isDark && darkStyles.cardTitle]}>
                        {metodoPago === 'efectivo' ? t('pagoEfectivoTitle') : t('pagoTarjetaTitle')}
                      </Text>
                      <Text style={styles.reviewPaymentSubtitle}>
                        {metodoPago === 'efectivo' ? t('pagoEfectivoSubtitle') : t('pagoTarjetaSubtitle')}
                      </Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                  </View>
                </ReviewCard>

                <SuccessValidationCard
                  title={t('todoListoTitle')}
                  description={t('todoListoDesc')}
                  isDark={isDark}
                />

                <OrderSummaryCard
                  title={t('resumenPedido')}
                  isDark={isDark}
                  rows={[
                    { key: 'items', label: t('suplementosLabel', { count }), value: formatPrecio(total) },
                    { key: 'envio', label: t('envioLabel'), value: t('envioGratisValor'), emphasis: 'free' },
                  ]}
                  totalLabel={t('totalLabel')}
                  totalValue={formatPrecio(total)}
                  footer={
                    <>
                      <CheckoutNavButtons
                        onBack={() => setStep(4)}
                        backLabel={t('prevStep')}
                        onNext={handleConfirmar}
                        nextLabel={t('finalizarPedidoBtn')}
                        loading={placing}
                        disabled={placing || !direccionSeleccionada}
                      />
                      <Text style={styles.disclaimerText}>{t('terminosDisclaimer')}</Text>
                    </>
                  }
                />

                <TrustBadges
                  isDark={isDark}
                  badges={[
                    {
                      icon: 'lock-closed-outline',
                      title: t('confianzaCompraSeguraTitle'),
                      description: t('confianzaCompraSeguraDesc'),
                    },
                    {
                      icon: 'shield-checkmark-outline',
                      title: t('confianzaPagoProtegidoTitle'),
                      description: t('confianzaPagoProtegidoDesc'),
                    },
                    {
                      icon: 'ribbon-outline',
                      title: t('confianzaSatisfaccionTitle'),
                      description: t('confianzaSatisfaccionDesc'),
                    },
                  ]}
                />
              </>
            )}
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
    paddingTop: 14,
    paddingBottom: 32,
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
  headerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIconBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 14,
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

  /* Contenido */
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 20,
    gap: 20,
    marginTop: -22,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: '#1a2e1a',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#888',
    fontSize: 13,
    lineHeight: 18,
  },
  floatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    gap: 16,
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
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  illustrationWrap: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  illustrationRingOuter: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#F1FAEA',
  },
  illustrationRingInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationBasketHandle: {
    position: 'absolute',
    top: 16,
    width: 28,
    height: 18,
    borderWidth: 3.5,
    borderColor: '#8FCB6C',
    borderBottomWidth: 0,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  illustrationBasketBody: {
    width: 48,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#4EC920',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  illustrationBasketLine: {
    width: 28,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#cdeab8',
  },
  illustrationDot: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: '#cdeab8',
  },
  illustrationDotTopRight: {
    width: 14,
    height: 14,
    top: 6,
    right: 4,
  },
  illustrationDotBottomLeft: {
    width: 9,
    height: 9,
    bottom: 14,
    left: 8,
    backgroundColor: '#4EC920',
  },
  emptyTitle: {
    color: '#1a2e1a',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyText: {
    color: '#888',
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    maxWidth: 260,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4EC920',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 32,
    shadowColor: '#4EC920',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  emptyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyBtnArrow: {
    color: '#ffffff',
    fontSize: 16,
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

  /* Paso 5: Resumen */
  reviewItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  reviewItemSubtotal: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '800',
  },
  reviewInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewInfoValue: {
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewPaymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eaf6df',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  reviewPaymentIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 1,
  },
  reviewPaymentTitle: {
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewPaymentSubtitle: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Campos genéricos */
  fieldGroup: {
    gap: 7,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
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
  reviewPaymentBadge: {
    backgroundColor: '#20261f',
    borderColor: '#2a2a2a',
  },
});
