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
import { dietasApi, Dieta } from '@/services/api';
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

function SearchIcon() {
  return (
    <View style={styles.searchIconWrap}>
      <View style={styles.searchIconCircle} />
      <View style={styles.searchIconHandle} />
    </View>
  );
}

function PlateIcon() {
  return (
    <View style={styles.plateIconWrap}>
      <View style={styles.plateIconInner} />
    </View>
  );
}

function SparkleIcon() {
  return (
    <View style={styles.sparkleWrap}>
      <View style={[styles.sparkleRay, styles.sparkleRayV]} />
      <View style={[styles.sparkleRay, styles.sparkleRayH]} />
    </View>
  );
}

export default function DietasScreen() {
  const { isDark, t } = useAppPreferences();
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

          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            onPress={() => router.back()}>
            <Text style={styles.backBtnText}>{t('backVolver')}</Text>
          </Pressable>

          <View style={styles.headerTitleRow}>
            <PlateIcon />
            <Text style={styles.title}>{t('menuDietas')}</Text>
          </View>
          <Text style={styles.subtitle}>
            {loading
              ? t('dietasSubtitleLoading')
              : t('dietasSubtitleResult', {
                  filtered: filtered.length,
                  total: dietas.length,
                  objetivos: objetivos.length,
                })}
          </Text>
        </LinearGradient>

        <View style={styles.content}>

          {!loading && !error && dietas.length > 0 && (
            <View style={[styles.floatingCard, isDark && darkStyles.card]}>
              <View style={[styles.searchRow, isDark && darkStyles.searchRow]}>
                <SearchIcon />
                <TextInput
                  style={[styles.searchInput, isDark && darkStyles.searchInput]}
                  value={search}
                  onChangeText={setSearch}
                  placeholder={t('searchDieta')}
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
                  style={[styles.chip, !selectedObjetivo && styles.chipActive]}
                  onPress={() => setSelectedObjetivo(null)}>
                  <Text style={[styles.chipText, !selectedObjetivo && styles.chipTextActive]}>
                    {t('chipTodos')}
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
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.createPlanCard, pressed && styles.pressedScale]}
            onPress={() => router.push('/nueva-dieta')}>
            <LinearGradient
              colors={['#66BB6A', '#2E7D32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createPlanGradient}>
              <View pointerEvents="none" style={styles.createPlanBlob} />

              <View style={styles.createPlanIconBadge}>
                <SparkleIcon />
              </View>

              <View style={styles.createPlanTextWrap}>
                <Text style={styles.createPlanTitle}>{t('crearPlanTitle')}</Text>
                <Text style={styles.createPlanSubtitle} numberOfLines={2}>
                  {t('crearPlanSubtitle')}
                </Text>
              </View>

              <Text style={styles.createPlanArrow}>›</Text>
            </LinearGradient>
          </Pressable>

          {loading && !refreshing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4EC920" />
              <Text style={styles.loadingText}>{t('loadingDietas')}</Text>
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
          ) : dietas.length === 0 ? (
            <Text style={styles.emptyText}>{t('noDietas')}</Text>
          ) : filtered.length === 0 ? (
            <View style={styles.errorBox}>
              <Text style={styles.emptyText}>{t('noDietasFiltro')}</Text>
              <Pressable onPress={clearFilters} style={styles.retryBtn}>
                <Text style={styles.retryText}>{t('limpiarFiltros')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((d) => {
                const objColor = colorFor(d.objetivo);
                return (
                  <View
                    key={d.id}
                    style={[styles.card, isDark && darkStyles.card, { borderLeftColor: objColor.text }]}>
                    <View style={styles.cardTopRow}>
                      <View
                        style={[
                          styles.iconBadge,
                          { backgroundColor: objColor.bg, shadowColor: objColor.text },
                        ]}>
                        <Text style={[styles.iconBadgeText, { color: objColor.text }]}>
                          {d.nombre[0]?.toUpperCase() ?? '?'}
                        </Text>
                      </View>
                      <View style={styles.cardTopInfo}>
                        <Text
                          style={[styles.cardTitle, isDark && darkStyles.cardTitle]}
                          numberOfLines={1}>
                          {d.nombre}
                        </Text>
                        <View style={[styles.metaChip, { backgroundColor: objColor.bg }]}>
                          <Text style={[styles.metaChipText, { color: objColor.text }]} numberOfLines={1}>
                            {d.objetivo_nombre}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationBadgeText}>{d.duracion_dias}d</Text>
                      </View>
                    </View>

                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {d.descripcion}
                    </Text>

                    <View style={[styles.statsRow, isDark && darkStyles.statsRow]}>
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, isDark && darkStyles.cardTitle]}>
                          {d.calorias_diarias}
                        </Text>
                        <Text style={styles.statLabel}>{t('kcalDia')}</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, isDark && darkStyles.cardTitle]}>
                          {d.comidas_por_dia}
                        </Text>
                        <Text style={styles.statLabel}>{t('comidasDia')}</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text
                          style={[styles.statValue, isDark && darkStyles.cardTitle]}
                          numberOfLines={1}>
                          {d.nivel_actividad_nombre}
                        </Text>
                        <Text style={styles.statLabel}>{t('actividad')}</Text>
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

  /* Iconos de encabezado */
  plateIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateIconInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
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
    marginBottom: 0,
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

  /* CTA crear plan personalizado */
  createPlanCard: {
    borderRadius: 20,
    marginTop: 28,
    marginBottom: 16,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  pressedScale: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  createPlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  createPlanBlob: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  createPlanIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  createPlanTextWrap: {
    flex: 1,
  },
  createPlanTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  createPlanSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  createPlanArrow: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },

  /* Icono sparkle */
  sparkleWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleRay: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  sparkleRayV: {
    width: 3.5,
    height: 18,
  },
  sparkleRayH: {
    width: 18,
    height: 3.5,
  },

  /* Lista de dietas */
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
  metaChip: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 5,
  },
  metaChipText: {
    fontSize: 10,
    fontWeight: '700',
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
    color: '#2E7D32',
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
  statsRow: {
    backgroundColor: '#262626',
  },
});
