import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
  const [productos, setProductos] = useState<Suplemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const cartItems = useCart();
  const cartCount = getCartCount(cartItems);

  async function fetchData(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await suplementosApi.getActive();
      setProductos(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los productos');
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollOuter}
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
              <Text style={styles.backBtnText}>← Volver</Text>
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

          <Text style={styles.title}>Productos</Text>
          <Text style={styles.subtitle}>
            {loading
              ? 'Suplementos disponibles en Balancea'
              : `${filtered.length} de ${productos.length} suplementos · ${categorias.length} categorías`}
          </Text>
        </LinearGradient>

        <View style={styles.content}>

          {!loading && !error && productos.length > 0 && (
            <View style={styles.floatingCard}>
              <View style={styles.searchRow}>
                <SearchIcon />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar producto..."
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
                    Todos
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
              <Text style={styles.loadingText}>Cargando productos...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>No se pudo cargar</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => fetchData()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : productos.length === 0 ? (
            <Text style={styles.emptyText}>No hay productos disponibles por el momento.</Text>
          ) : filtered.length === 0 ? (
            <View style={styles.errorBox}>
              <Text style={styles.emptyText}>No se encontraron productos con esos filtros.</Text>
              <Pressable onPress={clearFilters} style={styles.retryBtn}>
                <Text style={styles.retryText}>Limpiar filtros</Text>
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
                  <View key={p.id} style={[styles.card, { borderLeftColor: catColor.text }]}>
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
                        <Text style={styles.cardTitle} numberOfLines={1}>{p.nombre}</Text>
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
                          {p.stock > 0 ? `${p.stock} en stock` : 'Sin stock'}
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
                          {outOfStock ? 'Sin stock' : inCartQty > 0 ? `En carrito · ${inCartQty}` : 'Agregar'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
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
});
