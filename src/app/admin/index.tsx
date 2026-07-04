import { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import {
  adminApi,
  clearToken,
  clearUser,
  getUser,
  ordenesApi,
  suplementosApi,
} from '@/services/api';
import { useAppPreferences } from '@/context/app-preferences';

export default function AdminDashboardScreen() {
  const { isDark, t } = useAppPreferences();
  const currentUser = getUser();

  const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);
  const [totalProductos, setTotalProductos] = useState<number | null>(null);
  const [productosActivos, setProductosActivos] = useState<number | null>(null);
  const [pedidosPendientes, setPedidosPendientes] = useState<number | null>(null);

  async function fetchCounts() {
    try {
      const users = await adminApi.getAllUsers();
      setTotalUsuarios(users.length);
    } catch {
      setTotalUsuarios(null);
    }
    try {
      const productos = await suplementosApi.getAll();
      setTotalProductos(productos.length);
      setProductosActivos(productos.filter((p) => p.activo).length);
    } catch {
      setTotalProductos(null);
      setProductosActivos(null);
    }
    try {
      const ordenes = await ordenesApi.getAll();
      setPedidosPendientes(ordenes.filter((o) => o.estado === 'pendiente').length);
    } catch {
      setPedidosPendientes(null);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchCounts();
    }, [])
  );

  function doLogout() {
    clearToken();
    clearUser();
    router.replace('/login');
  }

  function handleLogout() {
    if (Platform.OS === 'web') {
      if (window.confirm(t('profileConfirmLogoutMsg'))) doLogout();
      return;
    }
    Alert.alert(t('profileConfirmLogout'), t('profileConfirmLogoutMsg'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('profileLogoutFull'), style: 'destructive', onPress: doLogout },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDark && darkStyles.safeArea]}>
      <ScrollView contentContainerStyle={styles.scrollOuter} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#4EC920', '#1B5E20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          <View pointerEvents="none" style={styles.headerBlob} />
          <View style={styles.headerTopRow}>
            <Text style={styles.title}>{t('adminPanelTitle')}</Text>
          </View>
          <Text style={styles.subtitle}>
            {t('adminWelcome')} {currentUser?.nombre ?? ''}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalUsuarios === null ? '—' : totalUsuarios}</Text>
              <Text style={styles.statLabel}>{t('adminStatUsuarios')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {productosActivos === null || totalProductos === null
                  ? '—'
                  : `${productosActivos}/${totalProductos}`}
              </Text>
              <Text style={styles.statLabel}>{t('adminStatProductos')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{pedidosPendientes === null ? '—' : pedidosPendientes}</Text>
              <Text style={styles.statLabel}>{t('adminStatPedidos')}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
            onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>{t('profileLogoutFull')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  scrollOuter: { flexGrow: 1, paddingBottom: 40 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
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
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 6, fontWeight: '500' },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    paddingVertical: 14,
  },
  statValue: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  statLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 3,
  },

  content: { paddingHorizontal: 20, marginTop: 24 },
  pressed: { opacity: 0.75 },
  logoutBtn: {
    backgroundColor: '#fdecea',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f5c6c0',
  },
  logoutBtnText: { color: '#c0392b', fontSize: 15, fontWeight: '700' },
});

const darkStyles = StyleSheet.create({
  safeArea: { backgroundColor: '#121212' },
});
