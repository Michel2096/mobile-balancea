import { useState, useCallback } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { getUser, clearToken, clearUser, dashboardApi, DashboardSummary, ActivityItem } from '@/services/api';
import { getCartCount, useCart } from '@/services/cart';
import { useAppPreferences } from '@/context/app-preferences';
import { Language } from '@/i18n/translations';

type MenuItem = {
  key: string;
  labelKey: string;
  route:
    | '/(tabs)'
    | '/productos'
    | '/sobre-nosotros'
    | '/dietas'
    | '/configuracion'
    | '/carrito'
    | '/(tabs)/profile';
};

const MENU_ITEMS: MenuItem[] = [
  { key: 'inicio', labelKey: 'menuInicio', route: '/(tabs)' },
  { key: 'perfil', labelKey: 'menuMiPerfil', route: '/(tabs)/profile' },
  { key: 'productos', labelKey: 'menuProductos', route: '/productos' },
  { key: 'carrito', labelKey: 'menuCarrito', route: '/carrito' },
  { key: 'nosotros', labelKey: 'menuNosotros', route: '/sobre-nosotros' },
  { key: 'dietas', labelKey: 'menuDietas', route: '/dietas' },
  { key: 'configuracion', labelKey: 'menuConfiguracion', route: '/configuracion' },
];

function BasketIcon() {
  return (
    <View style={styles.basketIconWrap}>
      <View style={styles.basketIconBody} />
      <View style={styles.basketIconHandle} />
    </View>
  );
}

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'greetingMorning';
  if (h < 19) return 'greetingAfternoon';
  return 'greetingEvening';
}

function formatDate(language: Language) {
  return new Date().toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatRelative(dateStr: string, t: (key: string, params?: Record<string, string | number>) => string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return t('timeLessThanHour');
  if (hours < 24) return t('timeHoursAgo', { n: hours });
  const days = Math.floor(hours / 24);
  if (days === 1) return t('timeYesterday');
  return t('timeDaysAgo', { n: days });
}

type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  isDark: boolean;
};

function StatCard({ label, value, unit, accent, isDark }: StatCardProps) {
  return (
    <View style={[styles.statCard, isDark && darkStyles.statCard, accent && styles.statCardAccent]}>
      <Text style={[styles.statValue, isDark && darkStyles.statValue, accent && styles.statValueAccent]}>
        {value}
      </Text>
      {unit ? (
        <Text style={[styles.statUnit, accent && styles.statUnitAccent]}>{unit}</Text>
      ) : null}
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { isDark, language, t } = useAppPreferences();
  const user = getUser();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const cartItems = useCart();
  const cartCount = getCartCount(cartItems);

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
      setError(err instanceof Error ? err.message : t('loadErrorFallback'));
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

        {/* Encabezado en degradado */}
        <LinearGradient
          colors={['#4EC920', '#1B5E20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          <View pointerEvents="none" style={styles.headerBlob} />

          <View style={styles.headerTopRow}>
            <Pressable
              onPress={() => setMenuVisible(true)}
              style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
              hitSlop={10}>
              <Text style={styles.menuButtonIcon}>☰</Text>
            </Pressable>

            <View style={styles.headerRightRow}>
              <Pressable
                onPress={() => router.push('/carrito')}
                style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}
                hitSlop={10}>
                <BasketIcon />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                  </View>
                )}
              </Pressable>

              <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {(user?.nombre ?? 'U')[0].toUpperCase()}
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.greetingText}>{t(greetingKey())},</Text>
          <Text style={styles.nameText}>{firstName}</Text>
          <Text style={styles.dateText}>{formatDate(language)}</Text>
        </LinearGradient>

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}>
          <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)} />
          <SafeAreaView
            style={[styles.menuPanel, isDark && darkStyles.menuPanel]}
            edges={['top', 'left', 'bottom']}>
            <LinearGradient
              colors={['#4EC920', '#1B5E20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuHeader}>
              <View pointerEvents="none" style={styles.menuHeaderBlob} />
              <View style={styles.menuAvatarCircle}>
                <Text style={styles.menuAvatarLetter}>
                  {(user?.nombre ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.menuUserName} numberOfLines={1}>{user?.nombre ?? 'Usuario'}</Text>
              <Text style={styles.menuUserEmail} numberOfLines={1}>{user?.correo ?? ''}</Text>
            </LinearGradient>

            <ScrollView style={styles.menuBody} showsVerticalScrollIndicator={false}>
              {MENU_ITEMS.map((item) => (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => [
                    styles.menuItem,
                    isDark && darkStyles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                  onPress={() => handleSelectMenuItem(item)}>
                  <View style={styles.menuItemDot} />
                  <Text style={[styles.menuItemText, isDark && darkStyles.menuItemText]}>
                    {t(item.labelKey)}
                  </Text>
                  <Text style={styles.menuItemChevron}>›</Text>
                </Pressable>
              ))}

              <Pressable
                style={({ pressed }) => [styles.menuLogoutItem, pressed && styles.menuLogoutItemPressed]}
                onPress={() => {
                  setMenuVisible(false);
                  handleLogout();
                }}>
                <Text style={styles.menuLogoutText}>{t('menuLogout')}</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        <View style={styles.content}>
          {loading && !refreshing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4EC920" />
              <Text style={styles.loadingText}>{t('dashLoading')}</Text>
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
          ) : (
            <>
              {/* Stat cards flotantes */}
              <View style={[styles.floatingCard, isDark && darkStyles.card]}>
                <Text style={[styles.floatingCardTitle, isDark && darkStyles.cardTitle]}>
                  {t('dashSummaryTitle')}
                </Text>
                <View style={styles.statsGrid}>
                  <StatCard
                    label={t('statBalance')}
                    value={String(summary?.balance_score ?? '0')}
                    unit={t('statBalanceUnit')}
                    accent
                    isDark={isDark}
                  />
                  <StatCard
                    label={t('statActividades')}
                    value={String(summary?.actividades_completadas ?? '0')}
                    unit={t('statActividadesUnit')}
                    isDark={isDark}
                  />
                  <StatCard
                    label={t('statRacha')}
                    value={String(summary?.racha_dias ?? '0')}
                    unit={t('statRachaUnit')}
                    isDark={isDark}
                  />
                  <StatCard
                    label={t('statMeta')}
                    value={`${summary?.meta_semanal_pct ?? '0'}%`}
                    isDark={isDark}
                  />
                </View>
              </View>

              {/* Progress bar */}
              <Text style={[styles.sectionTitle, isDark && darkStyles.cardTitle]}>
                {t('weeklyProgressTitle')}
              </Text>
              <View style={[styles.card, isDark && darkStyles.card]}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{t('weeklyProgressLabel')}</Text>
                  <Text style={styles.progressPct}>{pct}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` }]} />
                </View>
                <Text style={styles.progressSub}>
                  {pct >= 100
                    ? t('weeklyProgressDone')
                    : pct >= 50
                    ? t('weeklyProgressGood')
                    : t('weeklyProgressPending')}
                </Text>
              </View>

              {/* Recent activity */}
              <Text style={[styles.sectionTitle, isDark && darkStyles.cardTitle]}>
                {t('recentActivityTitle')}
              </Text>
              <View style={[styles.card, isDark && darkStyles.card]}>
                {activity.length === 0 ? (
                  <Text style={styles.emptyText}>{t('noActivity')}</Text>
                ) : (
                  activity.map((item, idx) => (
                    <View
                      key={item.id}
                      style={[styles.activityRow, idx < activity.length - 1 && styles.activityDivider]}>
                      <View style={[styles.dot, item.completada && styles.dotDone]} />
                      <View style={styles.activityInfo}>
                        <Text style={[styles.activityTitle, isDark && darkStyles.cardTitle]}>
                          {item.titulo}
                        </Text>
                        <Text style={styles.activityTime}>{formatRelative(item.fecha, t)}</Text>
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

  /* Header en degradado */
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
    marginBottom: 18,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonIcon: {
    color: '#ffffff',
    fontSize: 22,
  },
  pressed: {
    opacity: 0.75,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartButton: {
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
  greetingText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '500',
  },
  nameText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  dateText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarLetter: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: '800',
  },

  /* Contenido */
  content: {
    paddingHorizontal: 20,
    gap: 12,
  },
  floatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    gap: 12,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  floatingCardTitle: {
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Hamburger menu */
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  menuHeaderBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuAvatarLetter: {
    color: '#2E7D32',
    fontSize: 22,
    fontWeight: '800',
  },
  menuUserName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  menuUserEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  menuBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemPressed: {
    backgroundColor: '#f7fbf3',
  },
  menuItemDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4EC920',
  },
  menuItemText: {
    flex: 1,
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '600',
  },
  menuItemChevron: {
    color: '#c4c4c4',
    fontSize: 18,
    fontWeight: '700',
  },
  menuLogoutItem: {
    marginTop: 18,
    marginBottom: 20,
    backgroundColor: '#fdeaea',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  menuLogoutItemPressed: {
    opacity: 0.75,
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

/* Overrides para modo oscuro */
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
  statCard: {
    backgroundColor: '#1e1e1e',
    borderColor: '#2a2a2a',
  },
  statValue: {
    color: '#f2f2f2',
  },
  menuPanel: {
    backgroundColor: '#1e1e1e',
  },
  menuItem: {
    borderBottomColor: '#2a2a2a',
  },
  menuItemText: {
    color: '#f2f2f2',
  },
});
