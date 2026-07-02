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
import { router, useFocusEffect } from 'expo-router';
import { suplementosApi, Suplemento } from '@/services/api';

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

export default function ProductosScreen() {
  const [productos, setProductos] = useState<Suplemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

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
        contentContainerStyle={styles.scroll}
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

        <View style={styles.nav}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Productos</Text>
        <Text style={styles.subtitle}>
          {loading ? 'Suplementos disponibles en Balancea.' : `${filtered.length} de ${productos.length} suplementos`}
        </Text>

        <View style={styles.greenDivider} />

        {!loading && !error && productos.length > 0 && (
          <>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar producto..."
              placeholderTextColor="#a8a8a8"
              autoCapitalize="none"
              autoCorrect={false}
            />

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
          </>
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
              return (
                <View key={p.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.iconBadge, { backgroundColor: catColor.bg }]}>
                      <Text style={[styles.iconBadgeText, { color: catColor.text }]}>
                        {p.nombre[0]?.toUpperCase() ?? '?'}
                      </Text>
                    </View>
                    <View style={styles.cardTopInfo}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{p.nombre}</Text>
                      <Text style={styles.cardMeta} numberOfLines={1}>
                        {p.categoria_nombre} · {p.presentacion_nombre}
                      </Text>
                    </View>
                    <Text style={styles.cardPrice}>{formatPrecio(p.precio)}</Text>
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
                    {p.beneficios ? (
                      <Text style={styles.cardHint} numberOfLines={1}>
                        {p.beneficios}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 4,
    backgroundColor: '#ffffff',
  },
  nav: {
    marginBottom: 8,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backBtnText: {
    color: '#4EC920',
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    color: '#1a2e1a',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  greenDivider: {
    height: 3,
    backgroundColor: '#4EC920',
    borderRadius: 2,
    marginTop: 14,
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a2e1a',
    borderWidth: 1,
    borderColor: '#ededed',
    marginBottom: 12,
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 16,
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
    backgroundColor: '#4EC920',
    borderColor: '#4EC920',
  },
  chipText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
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
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  cardMeta: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  cardPrice: {
    color: '#4EC920',
    fontSize: 17,
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
  cardHint: {
    color: '#888',
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
