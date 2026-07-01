import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { getUser, dashboardApi, DashboardSummary, ActivityItem } from '@/services/api';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
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
  return `Hace ${days} días`;
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
      {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      <Text style={styles.statLabel}>{label}</Text>
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

  return (
    <ImageBackground
      source={require('../../../assets/Fondo.png')}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.overlay} />
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
            <Text style={styles.greetingText}>
              {greeting()}, {user?.nombre?.split(' ')[0] ?? 'Usuario'}
            </Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4EC920" />
              <Text style={styles.loadingText}>Cargando tu resumen...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText} onPress={() => fetchData()}>
                Reintentar
              </Text>
            </View>
          ) : (
            <>
              {/* Stat cards */}
              <Text style={styles.sectionTitle}>Resumen de hoy</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  label="Balance"
                  value={String(summary?.balance_score ?? '—')}
                  unit="pts"
                  accent
                />
                <StatCard
                  label="Actividades"
                  value={String(summary?.actividades_completadas ?? '—')}
                  unit="hoy"
                />
                <StatCard
                  label="Racha"
                  value={String(summary?.racha_dias ?? '—')}
                  unit="días"
                />
                <StatCard
                  label="Meta semanal"
                  value={`${summary?.meta_semanal_pct ?? '—'}%`}
                />
              </View>

              {/* Weekly progress bar */}
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
                    ? '¡Meta alcanzada! Excelente semana.'
                    : pct >= 50
                    ? 'Vas muy bien, sigue así.'
                    : 'Aún hay tiempo para alcanzar tu meta.'}
                </Text>
              </View>

              {/* Recent activity */}
              <Text style={styles.sectionTitle}>Actividad reciente</Text>
              <View style={styles.card}>
                {activity.length === 0 ? (
                  <Text style={styles.emptyText}>Sin actividad registrada aún.</Text>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
  },

  /* Header */
  header: {
    marginBottom: 8,
  },
  greetingText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  dateText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
    textTransform: 'capitalize',
  },

  /* Section titles */
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
    letterSpacing: 0.3,
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
    backgroundColor: 'rgba(30, 38, 30, 0.82)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statCardAccent: {
    borderColor: '#4EC920',
    borderWidth: 1.5,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  statValueAccent: {
    color: '#4EC920',
  },
  statUnit: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },

  /* Generic card */
  card: {
    backgroundColor: 'rgba(30, 38, 30, 0.82)',
    borderRadius: 16,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  /* Progress bar */
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
  },
  progressPct: {
    color: '#4EC920',
    fontSize: 16,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4EC920',
    borderRadius: 5,
  },
  progressSub: {
    color: 'rgba(255,255,255,0.5)',
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
    borderBottomColor: 'rgba(255,255,255,0.07)',
    paddingBottom: 12,
    marginBottom: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotDone: {
    backgroundColor: '#4EC920',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    marginTop: 1,
  },
  badge: {
    backgroundColor: 'rgba(78, 201, 32, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#4EC920',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },

  /* Loading / error */
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  errorBox: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  errorText: {
    color: 'rgba(255,100,100,0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  retryText: {
    color: '#4EC920',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
