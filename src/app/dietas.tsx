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
import { dietasApi, Dieta } from '@/services/api';

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

export default function DietasScreen() {
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedObjetivo, setSelectedObjetivo] = useState<string | null>(null);

  async function fetchData(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await dietasApi.getAll();
      setDietas(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las dietas');
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

  const objetivos = useMemo(() => {
    const seen = new Map<string, string>();
    dietas.forEach((d) => seen.set(d.objetivo, d.objetivo_nombre));
    return Array.from(seen, ([key, label]) => ({ key, label }));
  }, [dietas]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dietas.filter((d) => {
      const matchesObjetivo = !selectedObjetivo || d.objetivo === selectedObjetivo;
      const matchesSearch = !q || d.nombre.toLowerCase().includes(q);
      return matchesObjetivo && matchesSearch;
    });
  }, [dietas, search, selectedObjetivo]);

  function clearFilters() {
    setSearch('');
    setSelectedObjetivo(null);
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

        <Text style={styles.title}>Dietas</Text>
        <Text style={styles.subtitle}>
          {loading ? 'Planes de alimentación disponibles.' : `${filtered.length} de ${dietas.length} planes`}
        </Text>

        <View style={styles.greenDivider} />

        {!loading && !error && dietas.length > 0 && (
          <>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar dieta..."
              placeholderTextColor="#a8a8a8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}>
              <Pressable
                style={[styles.chip, !selectedObjetivo && styles.chipActive]}
                onPress={() => setSelectedObjetivo(null)}>
                <Text style={[styles.chipText, !selectedObjetivo && styles.chipTextActive]}>
                  Todos
                </Text>
              </Pressable>
              {objetivos.map((o) => {
                const active = selectedObjetivo === o.key;
                return (
                  <Pressable
                    key={o.key}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setSelectedObjetivo(active ? null : o.key)}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {o.label}
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
            <Text style={styles.loadingText}>Cargando dietas...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>No se pudo cargar</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => fetchData()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : dietas.length === 0 ? (
          <Text style={styles.emptyText}>No hay dietas disponibles por el momento.</Text>
        ) : filtered.length === 0 ? (
          <View style={styles.errorBox}>
            <Text style={styles.emptyText}>No se encontraron dietas con esos filtros.</Text>
            <Pressable onPress={clearFilters} style={styles.retryBtn}>
              <Text style={styles.retryText}>Limpiar filtros</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((d) => {
              const objColor = colorFor(d.objetivo);
              return (
                <View key={d.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.iconBadge, { backgroundColor: objColor.bg }]}>
                      <Text style={[styles.iconBadgeText, { color: objColor.text }]}>
                        {d.nombre[0]?.toUpperCase() ?? '?'}
                      </Text>
                    </View>
                    <View style={styles.cardTopInfo}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{d.nombre}</Text>
                      <Text style={styles.cardMeta} numberOfLines={1}>{d.objetivo_nombre}</Text>
                    </View>
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationBadgeText}>{d.duracion_dias}d</Text>
                    </View>
                  </View>

                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {d.descripcion}
                  </Text>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{d.calorias_diarias}</Text>
                      <Text style={styles.statLabel}>kcal/dia</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{d.comidas_por_dia}</Text>
                      <Text style={styles.statLabel}>comidas/dia</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue} numberOfLines={1}>{d.nivel_actividad_nombre}</Text>
                      <Text style={styles.statLabel}>actividad</Text>
                    </View>
                  </View>

                  {d.restricciones?.length > 0 ? (
                    <View style={styles.restriccionesRow}>
                      {d.restricciones.map((r) => (
                        <View key={r} style={styles.restriccionTag}>
                          <Text style={styles.restriccionText}>{r.replace(/_/g, ' ')}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
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
    gap: 12,
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
  durationBadge: {
    backgroundColor: '#edfde0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#b6f088',
  },
  durationBadgeText: {
    color: '#4EC920',
    fontSize: 12,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#555',
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9faf7',
    borderRadius: 12,
    paddingVertical: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  statValue: {
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    color: '#999',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#e8e8e8',
  },
  restriccionesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  restriccionTag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  restriccionText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
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
