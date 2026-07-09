import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { Notificacion, notificacionesApi } from '@/services/api';
import { setUnreadCount } from '@/services/notifications';
import { useAppPreferences } from '@/context/app-preferences';
import { NotificationStats } from '@/components/notifications/NotificationStats';
import { NotificationFilters, FilterOption } from '@/components/notifications/NotificationFilters';
import { NotificationActions } from '@/components/notifications/NotificationActions';
import { NotificationList } from '@/components/notifications/NotificationList';

type EstadoFilter = 'todas' | 'no_leidas' | 'leidas';
type FechaFilter = 'todas' | 'hoy' | 'semana' | 'mes';

const PAGE_SIZE = 30;

const TIPO_LABEL_KEYS: Record<string, string> = {
  nuevo_pedido: 'notifTypeNuevoPedido',
  cambio_estado: 'notifTypeCambioEstado',
  pedido_cancelado: 'notifTypePedidoCancelado',
  suplemento_no_disponible: 'notifTypeSuplementoNoDisponible',
  mensaje: 'notifTypeMensaje',
  info: 'notifTypeInfo',
};

function tipoLabel(tipo: string, t: (key: string) => string) {
  const key = TIPO_LABEL_KEYS[tipo];
  if (key) return t(key);
  return tipo
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function matchesFecha(fechaCreacion: string, filtro: FechaFilter) {
  if (filtro === 'todas') return true;
  const fecha = new Date(fechaCreacion).getTime();
  const now = Date.now();
  const diffDays = (now - fecha) / (1000 * 60 * 60 * 24);
  if (filtro === 'hoy') return diffDays <= 1;
  if (filtro === 'semana') return diffDays <= 7;
  return diffDays <= 30;
}

export default function NotificacionesScreen() {
  const { isDark, t } = useAppPreferences();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [noLeidasCount, setNoLeidasCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingRead, setDeletingRead] = useState(false);

  const [tipoFilter, setTipoFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todas');
  const [fechaFilter, setFechaFilter] = useState<FechaFilter>('todas');
  const [soloPedidos, setSoloPedidos] = useState(false);

  useEffect(() => {
    setUnreadCount(noLeidasCount);
  }, [noLeidasCount]);

  async function fetchNotificaciones(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [data, contador] = await Promise.all([
        notificacionesApi.getAll(1, PAGE_SIZE),
        notificacionesApi.getContador(),
      ]);
      setNotificaciones(data.notificaciones);
      setPage(data.pagina_actual);
      setTotalPaginas(data.total_paginas);
      setTotalCount(data.total);
      setNoLeidasCount(contador.total_no_leidas);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('loadErrorFallback'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchNotificaciones();
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    fetchNotificaciones(true);
  }

  async function handleLoadMore() {
    if (page >= totalPaginas || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await notificacionesApi.getAll(page + 1, PAGE_SIZE);
      setNotificaciones((prev) => [...prev, ...data.notificaciones]);
      setPage(data.pagina_actual);
      setTotalPaginas(data.total_paginas);
      setTotalCount(data.total);
    } catch {
      // Falla silenciosa: el usuario puede reintentar deslizando de nuevo.
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleItemPress(notificacion: Notificacion) {
    if (notificacion.leida) return;
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n))
    );
    setNoLeidasCount((c) => Math.max(c - 1, 0));
    try {
      await notificacionesApi.marcarLeida(notificacion.id);
    } catch {
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notificacion.id ? { ...n, leida: false } : n))
      );
      setNoLeidasCount((c) => c + 1);
    }
  }

  function handleDelete(notificacion: Notificacion) {
    const doDelete = async () => {
      const previous = notificaciones;
      setNotificaciones((prev) => prev.filter((n) => n.id !== notificacion.id));
      setTotalCount((c) => Math.max(c - 1, 0));
      if (!notificacion.leida) setNoLeidasCount((c) => Math.max(c - 1, 0));
      try {
        await notificacionesApi.eliminar(notificacion.id);
      } catch {
        setNotificaciones(previous);
        setTotalCount((c) => c + 1);
        if (!notificacion.leida) setNoLeidasCount((c) => c + 1);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('notifDeleteConfirmMsg'))) doDelete();
      return;
    }
    Alert.alert(t('notifDeleteConfirmTitle'), t('notifDeleteConfirmMsg'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('profileDelete'), style: 'destructive', onPress: doDelete },
    ]);
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await notificacionesApi.marcarTodasLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidasCount(0);
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('notifMarkAllError'));
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleDeleteRead() {
    const doDelete = async () => {
      setDeletingRead(true);
      try {
        await notificacionesApi.eliminarLeidas();
        setNotificaciones((prev) => prev.filter((n) => !n.leida));
        setTotalCount(noLeidasCount);
      } catch (err: unknown) {
        Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('notifDeleteReadError'));
      } finally {
        setDeletingRead(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('notifDeleteReadConfirmMsg'))) doDelete();
      return;
    }
    Alert.alert(t('notifDeleteReadConfirmTitle'), t('notifDeleteReadConfirmMsg'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('profileDelete'), style: 'destructive', onPress: doDelete },
    ]);
  }

  function handleClearFilters() {
    setTipoFilter('todos');
    setEstadoFilter('todas');
    setFechaFilter('todas');
    setSoloPedidos(false);
  }

  const tipoOptions: FilterOption[] = useMemo(() => {
    const tiposPresentes = Array.from(new Set(notificaciones.map((n) => n.tipo)));
    return [
      { value: 'todos', label: t('notifFilterAllTypes') },
      ...tiposPresentes.map((tipo) => ({ value: tipo, label: tipoLabel(tipo, t) })),
    ];
  }, [notificaciones, t]);

  const estadoOptions: FilterOption[] = [
    { value: 'todas', label: t('notifFilterAllStatus') },
    { value: 'no_leidas', label: t('notifFilterUnread') },
    { value: 'leidas', label: t('notifFilterRead') },
  ];

  const fechaOptions: FilterOption[] = [
    { value: 'todas', label: t('notifFilterAllDates') },
    { value: 'hoy', label: t('notifFilterToday') },
    { value: 'semana', label: t('notifFilterWeek') },
    { value: 'mes', label: t('notifFilterMonth') },
  ];

  const filteredNotificaciones = useMemo(() => {
    return notificaciones.filter((n) => {
      if (tipoFilter !== 'todos' && n.tipo !== tipoFilter) return false;
      if (estadoFilter === 'no_leidas' && n.leida) return false;
      if (estadoFilter === 'leidas' && !n.leida) return false;
      if (!matchesFecha(n.fecha_creacion, fechaFilter)) return false;
      if (soloPedidos && n.orden_id == null) return false;
      return true;
    });
  }, [notificaciones, tipoFilter, estadoFilter, fechaFilter, soloPedidos]);

  const filtersActive =
    tipoFilter !== 'todos' || estadoFilter !== 'todas' || fechaFilter !== 'todas' || soloPedidos;

  const ultimaActividad = notificaciones[0]?.hace_cuanto ?? null;
  const leidasCount = Math.max(totalCount - noLeidasCount, 0);
  const hasRead = notificaciones.some((n) => n.leida);
  const hasUnread = noLeidasCount > 0;

  return (
    <SafeAreaView style={[styles.safeArea, isDark && darkStyles.safeArea]}>
      <ScrollView
        contentContainerStyle={[styles.scrollOuter, isDark && darkStyles.scrollOuter]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4EC920"
            colors={['#4EC920']}
          />
        }>
        <LinearGradient
          colors={['#4EC920', '#1B5E20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          <View pointerEvents="none" style={styles.headerBlob} />

          <View style={styles.headerTopRow}>
            <Pressable
              style={({ pressed }) => [styles.backIconBtn, pressed && styles.pressed]}
              hitSlop={10}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}>
              <Text style={styles.backIconBtnText}>←</Text>
            </Pressable>
          </View>

          <Text style={styles.headerTitle}>{t('notifTitle')}</Text>
          <Text style={styles.headerSubtitle}>{t('notifSubtitle')}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4EC920" />
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={[styles.errorTitle, isDark && darkStyles.title]}>
                {t('loadErrorTitle')}
              </Text>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => fetchNotificaciones()} style={styles.retryBtn}>
                <Text style={styles.retryText}>{t('retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <NotificationStats
                total={totalCount}
                noLeidas={noLeidasCount}
                leidas={leidasCount}
                ultimaActividad={ultimaActividad}
                isDark={isDark}
                labels={{
                  total: t('notifStatTotal'),
                  noLeidas: t('notifStatUnread'),
                  leidas: t('notifStatRead'),
                  ultimaActividad: t('notifStatLastActivity'),
                  sinActividad: t('notifStatNever'),
                }}
              />

              {notificaciones.length > 0 && (
                <NotificationFilters
                  isDark={isDark}
                  sectionLabels={{
                    tipo: t('notifFilterTypeLabel'),
                    estado: t('notifFilterStatusLabel'),
                    fecha: t('notifFilterDateLabel'),
                  }}
                  tipoOptions={tipoOptions}
                  tipoValue={tipoFilter}
                  onTipoChange={setTipoFilter}
                  estadoOptions={estadoOptions}
                  estadoValue={estadoFilter}
                  onEstadoChange={(v) => setEstadoFilter(v as EstadoFilter)}
                  fechaOptions={fechaOptions}
                  fechaValue={fechaFilter}
                  onFechaChange={(v) => setFechaFilter(v as FechaFilter)}
                  soloPedidos={soloPedidos}
                  onSoloPedidosChange={setSoloPedidos}
                  soloPedidosLabel={t('notifFilterOnlyOrders')}
                />
              )}

              <NotificationActions
                isDark={isDark}
                hasUnread={hasUnread}
                hasRead={hasRead}
                markingAll={markingAll}
                deletingRead={deletingRead}
                onMarkAllRead={handleMarkAllRead}
                onDeleteRead={handleDeleteRead}
                markAllReadLabel={t('notifMarkAllRead')}
                deleteReadLabel={t('notifDeleteReadAction')}
              />

              <NotificationList
                notificaciones={filteredNotificaciones}
                isDark={isDark}
                onItemPress={handleItemPress}
                onDelete={handleDelete}
                hasAnyNotifications={notificaciones.length > 0 && filtersActive}
                emptyAllTitle={t('notifEmptyTitle')}
                emptyAllDesc={t('notifEmptyDesc')}
                emptyFilteredTitle={t('notifEmptyFilteredTitle')}
                emptyFilteredDesc={t('notifEmptyFilteredDesc')}
                clearFiltersLabel={t('notifClearFilters')}
                onClearFilters={handleClearFilters}
                canLoadMore={page < totalPaginas}
                loadingMore={loadingMore}
                onLoadMore={handleLoadMore}
                loadMoreLabel={t('notifLoadMore')}
              />
            </>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
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
    alignItems: 'center',
    marginBottom: 18,
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
  pressed: {
    opacity: 0.75,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },

  content: {
    paddingHorizontal: 20,
    marginTop: -14,
    gap: 14,
  },

  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
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
  title: {
    color: '#f2f2f2',
  },
});
