import { useState } from 'react';
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
import { getUser, ordenesApi } from '@/services/api';
import { clearCart, getCartCount, getCartTotal, removeFromCart, setQuantity, useCart } from '@/services/cart';
import { useAppPreferences } from '@/context/app-preferences';

function formatPrecio(precio: number) {
  return `$${precio.toFixed(2)}`;
}

function BasketIcon() {
  return (
    <View style={styles.basketIconWrap}>
      <View style={styles.basketIconBody} />
      <View style={styles.basketIconHandle} />
    </View>
  );
}

export default function CarritoScreen() {
  const { isDark, t } = useAppPreferences();
  const user = getUser();
  const items = useCart();
  const total = getCartTotal(items);
  const count = getCartCount(items);

  const [telefono, setTelefono] = useState(user?.telefono ?? '');
  const [notas, setNotas] = useState('');
  const [placing, setPlacing] = useState(false);

  async function handleConfirmar() {
    if (!user) {
      Alert.alert(t('errorTitle'), t('carritoLoginRequired'));
      return;
    }
    if (!telefono.trim()) {
      Alert.alert(t('telefonoRequeridoTitle'), t('telefonoRequeridoMsg'));
      return;
    }
    setPlacing(true);
    try {
      const res = await ordenesApi.createCarrito({
        nombre_usuario: user.nombre,
        telefono_usuario: telefono.trim(),
        items: items.map((i) => ({
          suplemento_id: i.suplementoId,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precio_unitario: i.precio,
        })),
        precio_total: total,
        notas: notas.trim() || undefined,
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
              onPress={() => router.back()}>
              <Text style={styles.backBtnText}>{t('backVolver')}</Text>
            </Pressable>

            <View style={styles.headerTitleRow}>
              <BasketIcon />
              <Text style={styles.title}>{t('carritoTitle')}</Text>
            </View>
            <Text style={styles.subtitle}>
              {count === 0
                ? t('carritoEmptySubtitle')
                : t('carritoItemsSubtitle', {
                    count,
                    items: count === 1 ? t('carritoItemSingular') : t('carritoItemPlural'),
                    total: formatPrecio(total),
                  })}
            </Text>
          </LinearGradient>

          <View style={styles.content}>
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

                  <Pressable
                    style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}
                    onPress={clearCart}>
                    <Text style={styles.clearBtnText}>{t('vaciarCarrito')}</Text>
                  </Pressable>
                </View>

                <View style={[styles.card, isDark && darkStyles.card]}>
                  <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                    {t('datosContacto')}
                  </Text>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('phone')}</Text>
                    <TextInput
                      style={[styles.input, isDark && darkStyles.input]}
                      value={telefono}
                      onChangeText={setTelefono}
                      placeholder={t('phone')}
                      placeholderTextColor="#b0c8a0"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('notasOpcional')}</Text>
                    <TextInput
                      style={[styles.input, isDark && darkStyles.input]}
                      value={notas}
                      onChangeText={setNotas}
                      placeholder={t('notasPlaceholder')}
                      placeholderTextColor="#b0c8a0"
                    />
                  </View>
                </View>

                <View style={[styles.summaryCard, isDark && darkStyles.card]}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('totalPagar')}</Text>
                    <Text style={styles.summaryTotal}>{formatPrecio(total)}</Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.confirmBtn, (pressed || placing) && styles.pressed]}
                    disabled={placing}
                    onPress={handleConfirmar}>
                    {placing ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.confirmBtnText}>{t('confirmarPedido')}</Text>
                    )}
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
    fontSize: 28,
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
    paddingHorizontal: 20,
    gap: 14,
  },
  floatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
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
  clearBtn: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearBtnText: {
    color: '#e05050',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Datos de contacto */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    gap: 12,
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
    fontSize: 16,
    fontWeight: '800',
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

  /* Resumen y confirmación */
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    gap: 14,
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
});
