import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { getUser, clearToken, clearUser, dashboardApi, DashboardSummary, ActivityItem } from '@/services/api';

type MenuItem = {
  key: string;
  label: string;
  route: '/(tabs)' | '/productos' | '/sobre-nosotros' | '/dietas' | '/configuracion';
};

const MENU_ITEMS: MenuItem[] = [
  { key: 'inicio', label: 'Inicio', route: '/(tabs)' },
  { key: 'productos', label: 'Productos', route: '/productos' },
  { key: 'nosotros', label: 'Nosotros', route: '/sobre-nosotros' },
  { key: 'dietas', label: 'Dietas', route: '/dietas' },
  { key: 'configuracion', label: 'Configuración', route: '/configuracion' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos dias';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatDate() {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Hace menos de 1h';
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  return `Hace ${days} dias`;
}

type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
};

function StatCard({ label, value, unit, accent }: StatCardProps) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      {unit ? <Text style={[styles.statUnit, accent && styles.statUnitAccent]}>{unit}</Text> : null}
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const user = getUser();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  function handleLogout() {
    clearToken();
    clearUser();
    router.replace('/login');
  }

  function handleSelectMenuItem(item: MenuItem) {
    setMenuVisible(false);
    router.push(item.route);
  }

  async function fetchData(silent = false) {
    if (!user) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([
        dashboardApi.getSummary(user.id),
        dashboardApi.getActivity(user.id),
      ]);
      setSummary(s);
      setActivity(a);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user?.id])
  );

  function onRefresh() {
    setRefreshing(true);
    fetchData(true);
  }

  const pct = summary?.meta_semanal_pct ?? 0;
  const firstName = user?.nombre?.split(' ')[0] ?? 'Usuario';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4EC920"
            colors={['#4EC920']}
          />
        }>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => setMenuVisible(true)}
            style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
            hitSlop={10}>
            <Text style={styles.menuButtonIcon}>☰</Text>
          </Pressable>

          <View style={styles.headerLeft}>
            <Text style={styles.greetingText}>{greeting()},</Text>
            <Text style={styles.nameText}>{firstName}</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {(user?.nombre ?? 'U')[0].toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.greenDivider} />

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}>
          <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)} />
          <SafeAreaView style={styles.menuPanel} edges={['top', 'left', 'bottom']}>
            <View style={styles.menuUserRow}>
              <View style={styles.menuAvatarCircle}>
                <Text style={styles.menuAvatarLetter}>
                  {(user?.nombre ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.menuUserInfo}>
                <Text style={styles.menuUserName}>{user?.nombre ?? 'Usuario'}</Text>
                <Text style={styles.menuUserEmail}>{user?.correo ?? ''}</Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => handleSelectMenuItem(item)}>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </Pressable>
            ))}

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => {
                setMenuVisible(false);
                handleLogout();
              }}>
              <Text style={styles.menuLogoutText}>Cerrar sesión</Text>
            </Pressable>
          </SafeAreaView>
        </Modal>

        {loading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4EC920" />
            <Text style={styles.loadingText}>Cargando tu resumen...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>No se pudo cargar</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => fetchData()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Stat cards */}
            <Text style={styles.sectionTitle}>Resumen de hoy</Text>
            <View style={styles.statsGrid}>
              <StatCard
                label="Balance"
                value={String(summary?.balance_score ?? '0')}
                unit="pts"
                accent
              />
              <StatCard
                label="Actividades"
                value={String(summary?.actividades_completadas ?? '0')}
                unit="hoy"
              />
              <StatCard
                label="Racha"
                value={String(summary?.racha_dias ?? '0')}
                unit="dias"
              />
              <StatCard
                label="Meta semanal"
                value={`${summary?.meta_semanal_pct ?? '0'}%`}
              />
            </View>

            {/* Progress bar */}
            <Text style={styles.sectionTitle}>Progreso semanal</Text>
            <View style={styles.card}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Completado esta semana</Text>
                <Text style={styles.progressPct}>{pct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
              </View>
              <Text style={styles.progressSub}>
                {pct >= 100
                  ? 'Meta alcanzada. Excelente semana.'
                  : pct >= 50
                  ? 'Vas muy bien, sigue asi.'
                  : 'Aun hay tiempo para alcanzar tu meta.'}
              </Text>
            </View>

            {/* Recent activity */}
            <Text style={styles.sectionTitle}>Actividad reciente</Text>
            <View style={styles.card}>
              {activity.length === 0 ? (
                <Text style={styles.emptyText}>Sin actividad registrada aun.</Text>
              ) : (
                activity.map((item, idx) => (
                  <View
                    key={item.id}
                    style={[styles.activityRow, idx < activity.length - 1 && styles.activityDivider]}>
                    <View style={[styles.dot, item.completada && styles.dotDone]} />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>{item.titulo}</Text>
                      <Text style={styles.activityTime}>{formatRelative(item.fecha)}</Text>
                    </View>
                    {item.completada && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>✓</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </>
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
    paddingTop: 20,
    paddingBottom: 48,
    gap: 12,
    backgroundColor: '#ffffff',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'center',
    gap: 6,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  menuButtonIcon: {
    color: '#1a2e1a',
    fontSize: 24,
  },
  pressed: {
    opacity: 0.7,
  },
  greetingText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '500',
  },
  nameText: {
    color: '#1a2e1a',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  dateText: {
    color: '#888',
    fontSize: 12,
    marginTop: 3,
    textTransform: 'capitalize',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4EC920',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#4EC920',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  greenDivider: {
    height: 3,
    backgroundColor: '#4EC920',
    borderRadius: 2,
    marginBottom: 8,
  },

  /* Hamburger menu */
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '75%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4EC920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarLetter: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    color: '#1a2e1a',
    fontSize: 17,
    fontWeight: '800',
  },
  menuUserEmail: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  menuDivider: {
    height: 3,
    backgroundColor: '#4EC920',
    borderRadius: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemPressed: {
    backgroundColor: '#f7fbf3',
  },
  menuItemText: {
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '600',
  },
  menuLogoutText: {
    color: '#e05050',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Section titles */
  sectionTitle: {
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.2,
  },

  /* Stat grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardAccent: {
    backgroundColor: '#4EC920',
    borderColor: '#4EC920',
    shadowColor: '#4EC920',
    shadowOpacity: 0.3,
    elevation: 4,
  },
  statValue: {
    color: '#1a2e1a',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  statValueAccent: {
    color: '#ffffff',
  },
  statUnit: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  statUnitAccent: {
    color: 'rgba(255,255,255,0.8)',
  },
  statLabel: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  statLabelAccent: {
    color: 'rgba(255,255,255,0.9)',
  },

  /* Generic card */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
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

  /* Progress bar */
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#555',
    fontSize: 13,
    fontWeight: '500',
  },
  progressPct: {
    color: '#4EC920',
    fontSize: 17,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4EC920',
    borderRadius: 5,
  },
  progressSub: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },

  /* Activity list */
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  activityDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
    marginBottom: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  dotDone: {
    backgroundColor: '#4EC920',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 1,
  },
  badge: {
    backgroundColor: '#edfde0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#b6f088',
  },
  badgeText: {
    color: '#4EC920',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: '#bbb',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },

  /* Loading / error */
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 80,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  errorBox: {
    alignItems: 'center',
    paddingTop: 80,
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
