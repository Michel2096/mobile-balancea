import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { suplementosApi, Suplemento } from '@/services/api';
import { addToCart, getCartCount, useCart } from '@/services/cart';
import { useAppPreferences } from '@/context/app-preferences';

const CHIP_PALETTE = [
  { bg: '#E8F5E9', text: '#2E7D32' },
  { bg: '#E3F2FD', text: '#1565C0' },
  { bg: '#FFF3E0', text: '#EF6C00' },
  { bg: '#F3E5F5', text: '#7B1FA2' },
  { bg: '#FCE4EC', text: '#C2185B' },
  { bg: '#E0F2F1', text: '#00695C' },
];

function colorFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return CHIP_PALETTE[hash % CHIP_PALETTE.length];
}

function formatPrecio(precio: number) {
  return `$${precio.toFixed(2)}`;
}

function SearchIcon() {
  return (
    <View style={styles.searchIconWrap}>
      <View style={styles.searchIconCircle} />
      <View style={styles.searchIconHandle} />
    </View>
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

export default function ProductosScreen() {
  const { isDark, t } = useAppPreferences();
  const [productos, setProductos] = useState<Suplemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Suplemento | null>(null);
  const cartItems = useCart();
  const cartCount = getCartCount(cartItems);

  async function fetchData(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await suplementosApi.getActive();
      setProductos(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('loadErrorFallback'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    fetchData(true);
  }

  const categorias = useMemo(() => {
    const seen = new Map<string, string>();
    productos.forEach((p) => seen.set(p.categoria, p.categoria_nombre));
    return Array.from(seen, ([key, label]) => ({ key, label }));
  }, [productos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productos.filter((p) => {
      const matchesCategoria = !selectedCategoria || p.categoria === selectedCategoria;
      const matchesSearch = !q || p.nombre.toLowerCase().includes(q);
      return matchesCategoria && matchesSearch;
    });
  }, [productos, search, selectedCategoria]);

  function clearFilters() {
    setSearch('');
    setSelectedCategoria(null);
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark && darkStyles.safeArea]}>
      <ScrollView
        contentContainerStyle={[styles.scrollOuter, isDark && darkStyles.scrollOuter]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4EC920"
            colors={['#4EC920']}
          />
        }>

        {/* Encabezado en degradado */}
        <LinearGradient
          colors={['#4EC920', '#1B5E20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          <View pointerEvents="none" style={styles.headerBlob} />

          <View style={styles.headerTopRow}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              onPress={() => router.back()}>
              <Text style={styles.backBtnText}>{t('backVolver')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cartBtn, pressed && styles.pressed]}
              onPress={() => router.push('/carrito')}
              hitSlop={8}>
              <BasketIcon />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              )}
            </Pressable>
          </View>

          <Text style={styles.title}>{t('menuProductos')}</Text>
          <Text style={styles.subtitle}>
            {loading
              ? t('productosSubtitleLoading')
              : t('productosSubtitleResult', {
                  filtered: filtered.length,
                  total: productos.length,
                  cats: categorias.length,
                })}
          </Text>
        </LinearGradient>

        <View style={styles.content}>

          {!loading && !error && productos.length > 0 && (
            <View style={[styles.floatingCard, isDark && darkStyles.card]}>
              <View style={[styles.searchRow, isDark && darkStyles.searchRow]}>
                <SearchIcon />
                <TextInput
                  style={[styles.searchInput, isDark && darkStyles.searchInput]}
                  value={search}
                  onChangeText={setSearch}
                  placeholder={t('searchProducto')}
                  placeholderTextColor="#a8a8a8"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}>
                <Pressable
                  style={[styles.chip, !selectedCategoria && styles.chipActive]}
                  onPress={() => setSelectedCategoria(null)}>
                  <Text style={[styles.chipText, !selectedCategoria && styles.chipTextActive]}>
                    {t('chipTodos')}
                  </Text>
                </Pressable>
                {categorias.map((c) => {
                  const active = selectedCategoria === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setSelectedCategoria(active ? null : c.key)}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {loading && !refreshing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4EC920" />
              <Text style={styles.loadingText}>{t('loadingProductos')}</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={[styles.errorTitle, isDark && darkStyles.cardTitle]}>
                {t('loadErrorTitle')}
              </Text>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => fetchData()} style={styles.retryBtn}>
                <Text style={styles.retryText}>{t('retry')}</Text>
              </Pressable>
            </View>
          ) : productos.length === 0 ? (
            <Text style={styles.emptyText}>{t('noProductos')}</Text>
          ) : filtered.length === 0 ? (
            <View style={styles.errorBox}>
              <Text style={styles.emptyText}>{t('noProductosFiltro')}</Text>
              <Pressable onPress={clearFilters} style={styles.retryBtn}>
                <Text style={styles.retryText}>{t('limpiarFiltros')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((p) => {
                const catColor = colorFor(p.categoria);
                const inCartQty = cartItems.find((i) => i.suplementoId === p.id)?.cantidad ?? 0;
                const outOfStock = p.stock <= 0;
                const maxedOut = !outOfStock && inCartQty >= p.stock;
                const addDisabled = outOfStock || maxedOut;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setSelectedProduct(p)}
                    style={({ pressed }) => [
                      styles.card,
                      isDark && darkStyles.card,
                      { borderLeftColor: catColor.text },
                      pressed && styles.cardPressed,
                    ]}>
                    <View style={styles.cardTopRow}>
                      <View
                        style={[
                          styles.iconBadge,
                          { backgroundColor: catColor.bg, shadowColor: catColor.text },
                        ]}>
                        <Text style={[styles.iconBadgeText, { color: catColor.text }]}>
                          {p.nombre[0]?.toUpperCase() ?? '?'}
                        </Text>
                      </View>
                      <View style={styles.cardTopInfo}>
                        <Text
                          style={[styles.cardTitle, isDark && darkStyles.cardTitle]}
                          numberOfLines={1}>
                          {p.nombre}
                        </Text>
                        <View style={styles.cardMetaRow}>
                          <View style={[styles.metaChip, { backgroundColor: catColor.bg }]}>
                            <Text style={[styles.metaChipText, { color: catColor.text }]} numberOfLines={1}>
                              {p.categoria_nombre}
                            </Text>
                          </View>
                          <Text style={styles.cardMeta} numberOfLines={1}>{p.presentacion_nombre}</Text>
                        </View>
                      </View>
                      <View style={styles.pricePill}>
                        <Text style={styles.pricePillText}>{formatPrecio(p.precio)}</Text>
                      </View>
                    </View>

                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {p.descripcion}
                    </Text>

                    <View style={styles.cardFooterRow}>
                      <View style={styles.stockRow}>
                        <View style={[styles.stockDot, p.stock > 0 ? styles.stockDotOk : styles.stockDotLow]} />
                        <Text style={styles.stockText}>
                          {p.stock > 0 ? t('enStock', { n: p.stock }) : t('sinStock')}
                        </Text>
                      </View>

                      <Pressable
                        disabled={addDisabled}
                        style={({ pressed }) => [
                          styles.addBtn,
                          addDisabled && styles.addBtnDisabled,
                          pressed && !addDisabled && styles.pressed,
                        ]}
                        onPress={() => addToCart(p, 1)}>
                        <Text style={[styles.addBtnText, addDisabled && styles.addBtnTextDisabled]}>
                          {outOfStock
                            ? t('sinStock')
                            : inCartQty > 0
                            ? t('enCarrito', { n: inCartQty })
                            : t('agregarCarrito')}
                        </Text>
                      </Pressable>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

        </View>
      </ScrollView>

      <ProductDetailModal
        producto={selectedProduct}
        isDark={isDark}
        t={t}
        cartItems={cartItems}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={() => {
          if (selectedProduct) addToCart(selectedProduct, 1);
          setSelectedProduct(null);
          router.push('/carrito');
        }}
      />
    </SafeAreaView>
  );
}

type ProductDetailModalProps = {
  producto: Suplemento | null;
  isDark: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  cartItems: ReturnType<typeof useCart>;
  onClose: () => void;
  onBuyNow: () => void;
};

function ProductDetailModal({ producto, isDark, t, cartItems, onClose, onBuyNow }: ProductDetailModalProps) {
  if (!producto) return null;

  const catColor = colorFor(producto.categoria);
  const inCartQty = cartItems.find((i) => i.suplementoId === producto.id)?.cantidad ?? 0;
  const outOfStock = producto.stock <= 0;
  const maxedOut = !outOfStock && inCartQty >= producto.stock;
  const addDisabled = outOfStock || maxedOut;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={[styles.detailModal, isDark && darkStyles.card]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.detailHeaderRow}>
            <View
              style={[
                styles.iconBadge,
                styles.detailIconBadge,
                { backgroundColor: catColor.bg, shadowColor: catColor.text },
              ]}>
              <Text style={[styles.iconBadgeText, { color: catColor.text }]}>
                {producto.nombre[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <Pressable style={styles.detailCloseBtn} onPress={onClose} hitSlop={8}>
              <Text style={styles.detailCloseBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={[styles.detailTitle, isDark && darkStyles.cardTitle]}>{producto.nombre}</Text>
          <Text style={styles.detailPrice}>{formatPrecio(producto.precio)}</Text>

          <View style={styles.cardMetaRow}>
            <View style={[styles.metaChip, { backgroundColor: catColor.bg }]}>
              <Text style={[styles.metaChipText, { color: catColor.text }]}>
                {producto.categoria_nombre}
              </Text>
            </View>
            <Text style={styles.cardMeta}>{producto.presentacion_nombre}</Text>
          </View>

          <View style={styles.detailStockRow}>
            <View style={[styles.stockDot, producto.stock > 0 ? styles.stockDotOk : styles.stockDotLow]} />
            <Text style={styles.stockText}>
              {producto.stock > 0 ? t('productoDetalleStock', { n: producto.stock }) : t('sinStock')}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.detailSectionTitle, isDark && darkStyles.cardTitle]}>
              {t('productoDetalleDescripcionTitle')}
            </Text>
            <Text style={styles.detailSectionText}>{producto.descripcion}</Text>
          </View>

          {producto.beneficios ? (
            <View style={styles.detailSection}>
              <Text style={[styles.detailSectionTitle, isDark && darkStyles.cardTitle]}>
                {t('productoDetalleBeneficiosTitle')}
              </Text>
              <Text style={styles.detailSectionText}>{producto.beneficios}</Text>
            </View>
          ) : null}

          {producto.modo_uso ? (
            <View style={styles.detailSection}>
              <Text style={[styles.detailSectionTitle, isDark && darkStyles.cardTitle]}>
                {t('productoDetalleModoUsoTitle')}
              </Text>
              <Text style={styles.detailSectionText}>{producto.modo_uso}</Text>
            </View>
          ) : null}

          <View style={styles.detailActions}>
            <Pressable
              disabled={addDisabled}
              style={({ pressed }) => [
                styles.detailSecondaryBtn,
                addDisabled && styles.addBtnDisabled,
                pressed && !addDisabled && styles.pressed,
              ]}
              onPress={() => addToCart(producto, 1)}>
              <Text style={[styles.detailSecondaryBtnText, addDisabled && styles.addBtnTextDisabled]}>
                {outOfStock
                  ? t('sinStock')
                  : inCartQty > 0
                  ? t('enCarrito', { n: inCartQty })
                  : t('agregarAlCarritoBtn')}
              </Text>
            </Pressable>
            <Pressable
              disabled={outOfStock}
              style={({ pressed }) => [
                styles.detailPrimaryBtn,
                outOfStock && styles.addBtnDisabled,
                pressed && !outOfStock && styles.pressed,
              ]}
              onPress={onBuyNow}>
              <Text style={[styles.detailPrimaryBtnText, outOfStock && styles.addBtnTextDisabled]}>
                {t('comprarAhoraBtn')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#e05050',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1B5E20',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
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

  /* Iconos de encabezado */
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
  },
  floatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginTop: -40,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ededed',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a2e1a',
  },
  searchIconWrap: {
    width: 16,
    height: 16,
  },
  searchIconCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#999',
  },
  searchIconHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 6,
    height: 1.6,
    borderRadius: 1,
    backgroundColor: '#999',
    transform: [{ rotate: '45deg' }],
  },
  chipsRow: {
    gap: 8,
    paddingTop: 14,
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

  /* Lista de productos */
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBadgeText: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardTopInfo: {
    flex: 1,
  },
  cardTitle: {
    color: '#1a2e1a',
    fontSize: 16,
    fontWeight: '700',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  metaChip: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 1,
  },
  metaChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardMeta: {
    color: '#999',
    fontSize: 11,
  },
  pricePill: {
    backgroundColor: '#EDFDE0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#B6F088',
  },
  pricePillText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#555',
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnDisabled: {
    backgroundColor: '#f0f0f0',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  addBtnTextDisabled: {
    color: '#aaa',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockDotOk: {
    backgroundColor: '#4EC920',
  },
  stockDotLow: {
    backgroundColor: '#e05050',
  },
  stockText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: '#bbb',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
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

  /* Modal de detalle de producto */
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  detailModal: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '10%',
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  detailCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCloseBtnText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
  },
  detailTitle: {
    color: '#1a2e1a',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 14,
  },
  detailPrice: {
    color: '#2E7D32',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  detailStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  detailSection: {
    marginTop: 16,
    gap: 4,
  },
  detailSectionTitle: {
    color: '#1a2e1a',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailSectionText: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  detailSecondaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#eaf6df',
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  detailSecondaryBtnText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },
  detailPrimaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  detailPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
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
  searchRow: {
    backgroundColor: '#262626',
    borderColor: '#333',
  },
  searchInput: {
    color: '#f2f2f2',
  },
});
