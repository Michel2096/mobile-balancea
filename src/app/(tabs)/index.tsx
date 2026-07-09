import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import {
  getUser,
  setUser,
  clearToken,
  clearUser,
  userApi,
  direccionesApi,
  tarjetasApi,
  dashboardApi,
  ordenesApi,
  UserProfile,
  Direccion,
  Tarjeta,
  ActivityItem,
} from '@/services/api';
import { getCartCount, useCart } from '@/services/cart';
import { useAppPreferences } from '@/context/app-preferences';
import { NotificationButton } from '@/components/notifications/NotificationButton';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from '@/components/branding/brand-logo';
import { HeroBackground } from '@/components/branding/hero-background';

type MenuIconName = 'productos' | 'carrito' | 'nosotros' | 'dietas' | 'configuracion';

type MenuItem = {
  key: string;
  labelKey: string;
  route: '/productos' | '/sobre-nosotros' | '/dietas' | '/configuracion' | '/carrito';
  icon: MenuIconName;
  iconBg: string;
  iconColor: string;
};

const MENU_ITEMS: MenuItem[] = [
  { key: 'productos', labelKey: 'menuProductos', route: '/productos', icon: 'productos', iconBg: '#E8F5E9', iconColor: '#2E7D32' },
  { key: 'carrito', labelKey: 'menuCarrito', route: '/carrito', icon: 'carrito', iconBg: '#FFF3E0', iconColor: '#E8622C' },
  { key: 'nosotros', labelKey: 'menuNosotros', route: '/sobre-nosotros', icon: 'nosotros', iconBg: '#E3F2FD', iconColor: '#1565C0' },
  { key: 'dietas', labelKey: 'menuDietas', route: '/dietas', icon: 'dietas', iconBg: '#EDE7F6', iconColor: '#7B1FA2' },
  { key: 'configuracion', labelKey: 'menuConfiguracion', route: '/configuracion', icon: 'configuracion', iconBg: '#FCE4EC', iconColor: '#AD1457' },
];

function MenuItemIcon({ name, color }: { name: MenuIconName; color: string }) {
  switch (name) {
    case 'productos':
      return (
        <View style={styles.miCapsuleWrap}>
          <View style={[styles.miCapsuleHalf, { backgroundColor: color }]} />
          <View style={[styles.miCapsuleHalf, { backgroundColor: color, opacity: 0.4 }]} />
        </View>
      );
    case 'carrito':
      return (
        <View style={styles.miBasketWrap}>
          <View style={[styles.miBasketHandle, { borderColor: color }]} />
          <View style={[styles.miBasketBody, { backgroundColor: color }]} />
        </View>
      );
    case 'nosotros':
      return (
        <View style={styles.miInfoWrap}>
          <View style={[styles.miInfoDot, { backgroundColor: color }]} />
          <View style={[styles.miInfoBar, { backgroundColor: color }]} />
        </View>
      );
    case 'dietas':
      return (
        <View style={styles.miTargetWrap}>
          <View style={[styles.miTargetRing, { borderColor: color }]} />
          <View style={[styles.miTargetDot, { backgroundColor: color }]} />
        </View>
      );
    case 'configuracion':
      return (
        <View style={styles.miGearWrap}>
          <View style={[styles.miGearRing, { borderColor: color }]} />
          <View style={[styles.miGearNotchH, { backgroundColor: color }]} />
          <View style={[styles.miGearNotchV, { backgroundColor: color }]} />
        </View>
      );
  }
}

const MONTHS: Record<'es' | 'en', string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

function formatMemberSince(dateStr: string | undefined, lang: 'es' | 'en') {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return `${MONTHS[lang][d.getMonth()]} ${d.getFullYear()}`;
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

const GENDER_OPTIONS = [
  { value: 'masculino', labelKey: 'profileGenderMale' },
  { value: 'femenino', labelKey: 'profileGenderFemale' },
  { value: 'otro', labelKey: 'profileGenderOther' },
  { value: 'no_decir', labelKey: 'profileGenderPrefer' },
];

function BasketIcon() {
  return (
    <View style={styles.basketIconWrap}>
      <View style={styles.basketIconBody} />
      <View style={styles.basketIconHandle} />
    </View>
  );
}

export default function ProfileScreen() {
  const { isDark, language, t } = useAppPreferences();
  const currentUser = getUser();
  const cartItems = useCart();
  const cartCount = getCartCount(cartItems);
  const { width: screenWidth } = useWindowDimensions();
  const menuPanelWidth = Math.min(screenWidth * 0.82, 320);

  const [profile, setProfile] = useState<UserProfile | null>(currentUser);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [pedidosCount, setPedidosCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuSlide = useRef(new Animated.Value(0)).current;

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sexo, setSexo] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const [addAddressVisible, setAddAddressVisible] = useState(false);
  const [calle, setCalle] = useState('');
  const [numeroExterior, setNumeroExterior] = useState('');
  const [numeroInterior, setNumeroInterior] = useState('');
  const [colonia, setColonia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [referencias, setReferencias] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const [addCardVisible, setAddCardVisible] = useState(false);
  const [nombreTitular, setNombreTitular] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [mesExpiracion, setMesExpiracion] = useState('');
  const [anioExpiracion, setAnioExpiracion] = useState('');
  const [savingCard, setSavingCard] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  function applyProfile(data: UserProfile) {
    setProfile(data);
    setNombre(data.nombre ?? '');
    setCorreo(data.correo ?? '');
    setTelefono(data.telefono ?? '');
    setSexo(data.sexo ?? '');
  }

  async function fetchProfile() {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const [data, activityData, ordenes] = await Promise.all([
        userApi.getProfile(currentUser.id),
        dashboardApi.getActivity(currentUser.id).catch(() => []),
        currentUser.telefono
          ? ordenesApi.getByTelefono(currentUser.telefono).catch(() => [])
          : Promise.resolve([]),
      ]);
      applyProfile(data);
      setActivity(activityData);
      setPedidosCount(ordenes.length);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('loadErrorFallback'));
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [currentUser?.id])
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

  function openMenu() {
    menuSlide.setValue(0);
    setMenuVisible(true);
  }

  function closeMenu(after?: () => void) {
    Animated.timing(menuSlide, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMenuVisible(false);
        after?.();
      }
    });
  }

  useEffect(() => {
    if (menuVisible) {
      Animated.timing(menuSlide, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible, menuSlide]);

  function handleSelectMenuItem(item: MenuItem) {
    closeMenu(() => router.push(item.route));
  }

  async function handleSaveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const updated = await userApi.updateProfile(profile.id, {
        nombre: nombre.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
        sexo: sexo || undefined,
      });
      setUser(updated);
      applyProfile(updated);
      Alert.alert(t('successTitle'), t('profileUpdateSuccess'));
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('profileUpdateError'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddAddress() {
    if (!calle || !numeroExterior || !colonia || !ciudad || !estado || !codigoPostal) {
      Alert.alert(t('requiredFieldsTitle'), t('requiredFieldsMsg'));
      return;
    }
    setSavingAddress(true);
    try {
      await direccionesApi.add({
        calle,
        numero_exterior: numeroExterior,
        numero_interior: numeroInterior || undefined,
        colonia,
        ciudad,
        estado,
        codigo_postal: codigoPostal,
        referencias: referencias || undefined,
      });
      setCalle('');
      setNumeroExterior('');
      setNumeroInterior('');
      setColonia('');
      setCiudad('');
      setEstado('');
      setCodigoPostal('');
      setReferencias('');
      setAddAddressVisible(false);
      Alert.alert(t('successTitle'), t('profileAddressAdded'));
      await fetchProfile();
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('profileAddressError'));
    } finally {
      setSavingAddress(false);
    }
  }

  function handleDeleteAddress(direccion: Direccion) {
    Alert.alert(t('profileConfirmDeleteAddress'), undefined, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('profileDelete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await direccionesApi.remove(direccion.id);
            await fetchProfile();
          } catch (err: unknown) {
            Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('profileAddressError'));
          }
        },
      },
    ]);
  }

  async function handleAddCard() {
    if (!nombreTitular || !numeroTarjeta || !mesExpiracion || !anioExpiracion) {
      Alert.alert(t('requiredFieldsTitle'), t('requiredFieldsMsg'));
      return;
    }
    if (!profile) return;
    setSavingCard(true);
    try {
      await tarjetasApi.add(profile.id, {
        nombre_titular: nombreTitular,
        numero_tarjeta: numeroTarjeta,
        mes_expiracion: mesExpiracion,
        anio_expiracion: anioExpiracion,
      });
      setNombreTitular('');
      setNumeroTarjeta('');
      setMesExpiracion('');
      setAnioExpiracion('');
      setAddCardVisible(false);
      Alert.alert(t('successTitle'), t('profileCardAdded'));
      await fetchProfile();
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('profileCardError'));
    } finally {
      setSavingCard(false);
    }
  }

  function handleDeleteCard(tarjeta: Tarjeta) {
    Alert.alert(t('profileConfirmDeleteCard'), undefined, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('profileDelete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await tarjetasApi.remove(tarjeta.id);
            await fetchProfile();
          } catch (err: unknown) {
            Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('profileCardError'));
          }
        },
      },
    ]);
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('requiredFieldsTitle'), t('requiredFieldsMsg'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('errorTitle'), t('passwordMismatch'));
      return;
    }
    setSavingPassword(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert(t('successTitle'), t('passwordUpdated'));
    } catch (err: unknown) {
      Alert.alert(t('errorTitle'), err instanceof Error ? err.message : t('passwordUpdateError'));
    } finally {
      setSavingPassword(false);
    }
  }

  const initial = (profile?.nombre ?? 'U')[0]?.toUpperCase() ?? 'U';
  const roleLabel =
    profile?.rol_texto === 'admin' ? t('profileRoleAdmin') : t('profileRoleClient');
  const genderLabel = GENDER_OPTIONS.find((g) => g.value === sexo)?.labelKey;
  const direcciones = profile?.direcciones ?? [];
  const tarjetas = profile?.tarjetas ?? [];

  return (
    <SafeAreaView style={[styles.safeArea, isDark && darkStyles.safeArea]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView
          contentContainerStyle={[styles.scrollOuter, isDark && darkStyles.scrollOuter]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Encabezado con fondo de marca */}
          <HeroBackground style={styles.header}>
            <View pointerEvents="none" style={styles.headerBlob} />

            <View style={styles.headerTopRow}>
              <Pressable
                onPress={openMenu}
                style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
                hitSlop={10}>
                <View style={styles.hamburgerIcon}>
                  <View style={styles.hamburgerBar} />
                  <View style={[styles.hamburgerBar, styles.hamburgerBarMid]} />
                  <View style={styles.hamburgerBar} />
                </View>
              </Pressable>

              <View style={styles.headerRightRow}>
                <NotificationButton />
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
              </View>
            </View>

            <Text style={styles.headerTitle}>{t('profileTitle')}</Text>
            <Text style={styles.headerSubtitle}>{t('profileSubtitle')}</Text>

            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            <Text style={styles.nameText}>{profile?.nombre ?? 'Usuario'}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{roleLabel}</Text>
            </View>
            <Text style={styles.emailBadge}>{profile?.correo ?? ''}</Text>
            {!!profile?.telefono && (
              <Text style={styles.phoneCountryText}>
                {profile.telefono} · {t('profileCountry')}
              </Text>
            )}
            <Text style={styles.memberSince}>
              {t('profileMemberSince')} {formatMemberSince(profile?.fecha_registro, language)}
            </Text>
          </HeroBackground>

          <Modal
            visible={menuVisible}
            transparent
            animationType="none"
            onRequestClose={() => closeMenu()}>
            <Animated.View
              style={[styles.menuOverlay, { opacity: menuSlide }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => closeMenu()} />
            </Animated.View>
            <Animated.View
              style={[
                styles.menuPanelWrap,
                {
                  width: menuPanelWidth,
                  transform: [
                    {
                      translateX: menuSlide.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-menuPanelWidth, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <SafeAreaView
                style={[styles.menuPanel, isDark && darkStyles.menuPanel]}
                edges={['top', 'left', 'bottom']}>
                <LinearGradient
                  colors={['#4EC920', '#1B5E20']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.menuHeader}>
                  <View pointerEvents="none" style={styles.menuHeaderBlob} />
                  <BrandLogo variant="white" width={110} style={styles.menuHeaderLogo} />
                  <View style={styles.menuAvatarCircle}>
                    <Text style={styles.menuAvatarLetter}>
                      {(profile?.nombre ?? 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.menuUserName} numberOfLines={1}>
                    {profile?.nombre ?? 'Usuario'}
                  </Text>
                  <Text style={styles.menuUserEmail} numberOfLines={1}>
                    {profile?.correo ?? ''}
                  </Text>
                </LinearGradient>

                <ScrollView style={styles.menuBody} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.menuSectionLabel, isDark && darkStyles.menuSectionLabel]}>
                    {t('menuSectionNavigation')}
                  </Text>
                  {MENU_ITEMS.map((item) => (
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.menuItem,
                        isDark && darkStyles.menuItem,
                        pressed && styles.menuItemPressed,
                      ]}
                      onPress={() => handleSelectMenuItem(item)}>
                      <View style={[styles.menuItemIconBubble, { backgroundColor: item.iconBg }]}>
                        <MenuItemIcon name={item.icon} color={item.iconColor} />
                      </View>
                      <Text style={[styles.menuItemText, isDark && darkStyles.menuItemText]}>
                        {t(item.labelKey)}
                      </Text>
                      <Text style={styles.menuItemChevron}>›</Text>
                    </Pressable>
                  ))}

                  <Pressable
                    style={({ pressed }) => [styles.menuLogoutItem, pressed && styles.menuLogoutItemPressed]}
                    onPress={() => closeMenu(handleLogout)}>
                    <Text style={styles.menuLogoutText}>{t('menuLogout')}</Text>
                  </Pressable>
                </ScrollView>
              </SafeAreaView>
            </Animated.View>
          </Modal>

          <View style={styles.content}>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, isDark && darkStyles.card]}>
                <Text style={[styles.statValue, isDark && darkStyles.cardTitle]}>
                  {profile?.total_direcciones ?? direcciones.length}
                </Text>
                <Text style={[styles.statLabel, isDark && darkStyles.cardSubtitle]}>
                  {t('profileAddresses')}
                </Text>
              </View>
              <View style={[styles.statBox, isDark && darkStyles.card]}>
                <Text style={[styles.statValue, isDark && darkStyles.cardTitle]}>
                  {profile?.total_tarjetas ?? tarjetas.length}
                </Text>
                <Text style={[styles.statLabel, isDark && darkStyles.cardSubtitle]}>
                  {t('profileCards')}
                </Text>
              </View>
              <View style={[styles.statBox, isDark && darkStyles.card]}>
                <Text style={[styles.statValue, isDark && darkStyles.cardTitle]}>
                  {pedidosCount}
                </Text>
                <Text style={[styles.statLabel, isDark && darkStyles.cardSubtitle]}>
                  {t('profileOrders')}
                </Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#4EC920" />
              </View>
            ) : error ? (
              <View style={styles.errorBox}>
                <Text style={[styles.errorTitle, isDark && darkStyles.cardTitle]}>
                  {t('loadErrorTitle')}
                </Text>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={fetchProfile} style={styles.retryBtn}>
                  <Text style={styles.retryText}>{t('retry')}</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Informacion personal */}
                <View style={[styles.card, isDark && darkStyles.card]}>
                  <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                    {t('profilePersonalInfo')}
                  </Text>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('profileFullName')}</Text>
                    <TextInput
                      style={[styles.input, isDark && darkStyles.input]}
                      value={nombre}
                      onChangeText={setNombre}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('email')}</Text>
                    <TextInput
                      style={[styles.input, isDark && darkStyles.input]}
                      value={correo}
                      onChangeText={setCorreo}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('phone')}</Text>
                    <TextInput
                      style={[styles.input, isDark && darkStyles.input]}
                      value={telefono}
                      onChangeText={setTelefono}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('profileGender')}</Text>
                    <Pressable
                      style={[styles.selectBox, isDark && darkStyles.input]}
                      onPress={() => setGenderModalVisible(true)}>
                      <Text style={[styles.selectBoxText, isDark && darkStyles.readonlyText]}>
                        {genderLabel ? t(genderLabel) : t('profileSelect')}
                      </Text>
                      <Text style={styles.selectBoxChevron}>▾</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.saveButton,
                      (pressed || savingProfile) && styles.pressed,
                    ]}
                    onPress={handleSaveProfile}
                    disabled={savingProfile}>
                    <Text style={styles.saveButtonText}>
                      {savingProfile ? t('saving') : t('profileEditFull')}
                    </Text>
                  </Pressable>
                </View>

                {/* Actividad reciente */}
                <View style={[styles.card, isDark && darkStyles.card]}>
                  <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                    {t('recentActivityTitle')}
                  </Text>
                  {activity.length === 0 ? (
                    <Text style={styles.emptyDesc}>{t('noActivity')}</Text>
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
                            <Ionicons name="checkmark" size={12} color="#4EC920" />
                          </View>
                        )}
                      </View>
                    ))
                  )}
                </View>

                {/* Mis direcciones */}
                <View style={[styles.card, isDark && darkStyles.card]}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                      {t('profileMyAddresses')}
                    </Text>
                    <Pressable
                      style={({ pressed }) => [styles.smallBtn, pressed && styles.pressed]}
                      onPress={() => setAddAddressVisible((v) => !v)}>
                      <Text style={styles.smallBtnText}>{t('profileManage')}</Text>
                    </Pressable>
                  </View>

                  {direcciones.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={[styles.emptyTitle, isDark && darkStyles.cardTitle]}>
                        {t('profileNoAddressesTitle')}
                      </Text>
                      <Text style={styles.emptyDesc}>{t('profileNoAddressesDesc')}</Text>
                      {!addAddressVisible && (
                        <Pressable onPress={() => setAddAddressVisible(true)}>
                          <Text style={styles.emptyCta}>{t('profileAddFirstAddress')}</Text>
                        </Pressable>
                      )}
                    </View>
                  ) : (
                    <View style={styles.listGroup}>
                      {direcciones.map((d) => (
                        <View
                          key={d.id}
                          style={[styles.listRow, isDark && darkStyles.readonlyBox]}>
                          <Text style={[styles.listRowText, isDark && darkStyles.readonlyText]}>
                            {d.direccion_completa ??
                              `${d.calle} ${d.numero_exterior}, ${d.colonia}, ${d.ciudad}`}
                          </Text>
                          <Pressable onPress={() => handleDeleteAddress(d)} hitSlop={8}>
                            <Text style={styles.listRowDelete}>{t('profileDelete')}</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                  {addAddressVisible && (
                    <View style={styles.inlineForm}>
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('profileStreet')}</Text>
                        <TextInput
                          style={[styles.input, isDark && darkStyles.input]}
                          value={calle}
                          onChangeText={setCalle}
                        />
                      </View>
                      <View style={styles.fieldRow}>
                        <View style={[styles.fieldGroup, styles.fieldFlex]}>
                          <Text style={styles.label}>{t('profileExtNumber')}</Text>
                          <TextInput
                            style={[styles.input, isDark && darkStyles.input]}
                            value={numeroExterior}
                            onChangeText={setNumeroExterior}
                          />
                        </View>
                        <View style={[styles.fieldGroup, styles.fieldFlex]}>
                          <Text style={styles.label}>{t('profileIntNumber')}</Text>
                          <TextInput
                            style={[styles.input, isDark && darkStyles.input]}
                            value={numeroInterior}
                            onChangeText={setNumeroInterior}
                          />
                        </View>
                      </View>
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('profileNeighborhood')}</Text>
                        <TextInput
                          style={[styles.input, isDark && darkStyles.input]}
                          value={colonia}
                          onChangeText={setColonia}
                        />
                      </View>
                      <View style={styles.fieldRow}>
                        <View style={[styles.fieldGroup, styles.fieldFlex]}>
                          <Text style={styles.label}>{t('profileCity')}</Text>
                          <TextInput
                            style={[styles.input, isDark && darkStyles.input]}
                            value={ciudad}
                            onChangeText={setCiudad}
                          />
                        </View>
                        <View style={[styles.fieldGroup, styles.fieldFlex]}>
                          <Text style={styles.label}>{t('profileState')}</Text>
                          <TextInput
                            style={[styles.input, isDark && darkStyles.input]}
                            value={estado}
                            onChangeText={setEstado}
                          />
                        </View>
                      </View>
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('profileZip')}</Text>
                        <TextInput
                          style={[styles.input, isDark && darkStyles.input]}
                          value={codigoPostal}
                          onChangeText={setCodigoPostal}
                          keyboardType="number-pad"
                        />
                      </View>
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('profileReferences')}</Text>
                        <TextInput
                          style={[styles.input, isDark && darkStyles.input]}
                          value={referencias}
                          onChangeText={setReferencias}
                        />
                      </View>
                      <View style={styles.inlineFormActions}>
                        <Pressable
                          style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                          onPress={() => setAddAddressVisible(false)}>
                          <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            styles.saveButton,
                            styles.inlineSaveBtn,
                            (pressed || savingAddress) && styles.pressed,
                          ]}
                          onPress={handleAddAddress}
                          disabled={savingAddress}>
                          <Text style={styles.saveButtonText}>
                            {savingAddress ? t('saving') : t('profileAddAddress')}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>

                {/* Mis tarjetas */}
                <View style={[styles.card, isDark && darkStyles.card]}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                      {t('profileMyCards')}
                    </Text>
                    <Pressable
                      style={({ pressed }) => [styles.smallBtn, pressed && styles.pressed]}
                      onPress={() => setAddCardVisible((v) => !v)}>
                      <Text style={styles.smallBtnText}>{t('profileAddCard')}</Text>
                    </Pressable>
                  </View>

                  {tarjetas.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={[styles.emptyTitle, isDark && darkStyles.cardTitle]}>
                        {t('profileNoCardsTitle')}
                      </Text>
                      <Text style={styles.emptyDesc}>{t('profileNoCardsDesc')}</Text>
                      {!addCardVisible && (
                        <Pressable onPress={() => setAddCardVisible(true)}>
                          <Text style={styles.emptyCta}>{t('profileAddFirstCard')}</Text>
                        </Pressable>
                      )}
                    </View>
                  ) : (
                    <View style={styles.listGroup}>
                      {tarjetas.map((c) => (
                        <View
                          key={c.id}
                          style={[styles.listRow, isDark && darkStyles.readonlyBox]}>
                          <Text style={[styles.listRowText, isDark && darkStyles.readonlyText]}>
                            {c.tipo_tarjeta?.toUpperCase()} •••• {c.numero_enmascarado?.slice(-4)}{' '}
                            · {c.mes_expiracion}/{c.anio_expiracion}
                          </Text>
                          <Pressable onPress={() => handleDeleteCard(c)} hitSlop={8}>
                            <Text style={styles.listRowDelete}>{t('profileDelete')}</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                  {addCardVisible && (
                    <View style={styles.inlineForm}>
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('profileCardHolder')}</Text>
                        <TextInput
                          style={[styles.input, isDark && darkStyles.input]}
                          value={nombreTitular}
                          onChangeText={setNombreTitular}
                          autoCapitalize="words"
                        />
                      </View>
                      <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{t('profileCardNumber')}</Text>
                        <TextInput
                          style={[styles.input, isDark && darkStyles.input]}
                          value={numeroTarjeta}
                          onChangeText={setNumeroTarjeta}
                          keyboardType="number-pad"
                          maxLength={19}
                        />
                      </View>
                      <View style={styles.fieldRow}>
                        <View style={[styles.fieldGroup, styles.fieldFlex]}>
                          <Text style={styles.label}>{t('profileExpMonth')}</Text>
                          <TextInput
                            style={[styles.input, isDark && darkStyles.input]}
                            value={mesExpiracion}
                            onChangeText={setMesExpiracion}
                            keyboardType="number-pad"
                            maxLength={2}
                            placeholder="MM"
                            placeholderTextColor="#b0c8a0"
                          />
                        </View>
                        <View style={[styles.fieldGroup, styles.fieldFlex]}>
                          <Text style={styles.label}>{t('profileExpYear')}</Text>
                          <TextInput
                            style={[styles.input, isDark && darkStyles.input]}
                            value={anioExpiracion}
                            onChangeText={setAnioExpiracion}
                            keyboardType="number-pad"
                            maxLength={4}
                            placeholder="AAAA"
                            placeholderTextColor="#b0c8a0"
                          />
                        </View>
                      </View>
                      <View style={styles.inlineFormActions}>
                        <Pressable
                          style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                          onPress={() => setAddCardVisible(false)}>
                          <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            styles.saveButton,
                            styles.inlineSaveBtn,
                            (pressed || savingCard) && styles.pressed,
                          ]}
                          onPress={handleAddCard}
                          disabled={savingCard}>
                          <Text style={styles.saveButtonText}>
                            {savingCard ? t('saving') : t('profileAddCardFull')}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>

                {/* Seguridad */}
                <View style={[styles.card, isDark && darkStyles.card]}>
                  <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                    {t('profileSecurity')}
                  </Text>
                  <Text style={styles.securityDesc}>{t('profileSecurityDesc')}</Text>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('currentPassword')}</Text>
                    <TextInput
                      style={[styles.input, isDark && darkStyles.input]}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry
                      placeholder="••••••••"
                      placeholderTextColor="#b0c8a0"
                    />
                  </View>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('newPassword')}</Text>
                    <TextInput
                      style={[styles.input, isDark && darkStyles.input]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      placeholder={t('newPasswordPlaceholder')}
                      placeholderTextColor="#b0c8a0"
                    />
                  </View>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('confirmPassword')}</Text>
                    <TextInput
                      style={[styles.input, isDark && darkStyles.input]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholder={t('confirmPasswordPlaceholder')}
                      placeholderTextColor="#b0c8a0"
                    />
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.saveButton,
                      (pressed || savingPassword) && styles.pressed,
                    ]}
                    onPress={handleChangePassword}
                    disabled={savingPassword}>
                    <Text style={styles.saveButtonText}>
                      {savingPassword ? t('saving') : t('profileChangePasswordFull')}
                    </Text>
                  </Pressable>
                </View>

                {/* Informacion del sistema */}
                <View style={[styles.card, isDark && darkStyles.card]}>
                  <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                    {t('profileSystemInfo')}
                  </Text>
                  <Pressable
                    style={({ pressed }) => [styles.systemInfoRow, pressed && styles.pressed]}
                    onPress={() => router.push('/sobre-nosotros')}>
                    <Text style={[styles.systemInfoText, isDark && darkStyles.cardTitle]}>
                      {t('profileSystemInfoDesc')}
                    </Text>
                    <Text style={styles.systemInfoChevron}>›</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selector de sexo */}
      <Modal
        visible={genderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGenderModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setGenderModalVisible(false)} />
        <View style={[styles.genderModal, isDark && darkStyles.card]}>
          {GENDER_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={({ pressed }) => [styles.genderOption, pressed && styles.pressed]}
              onPress={() => {
                setSexo(opt.value);
                setGenderModalVisible(false);
              }}>
              <Text style={[styles.genderOptionText, isDark && darkStyles.cardTitle]}>
                {t(opt.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  kav: {
    flex: 1,
  },
  scrollOuter: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
  },

  /* Encabezado */
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
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
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    width: 20,
    height: 14,
    justifyContent: 'space-between',
  },
  hamburgerBar: {
    height: 2.4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  hamburgerBarMid: {
    width: '70%',
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
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 8,
  },
  avatarInitial: {
    color: '#2E7D32',
    fontSize: 34,
    fontWeight: '800',
  },
  nameText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emailBadge: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 2,
  },
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
  },
  rolePillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  phoneCountryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 6,
  },
  memberSince: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 8,
  },

  /* Hamburger menu */
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  menuPanelWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
  },
  menuPanel: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
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
  menuHeaderLogo: {
    marginBottom: 14,
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
    paddingTop: 20,
  },
  menuSectionLabel: {
    color: '#9aa89a',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    marginBottom: 4,
    borderRadius: 14,
    paddingHorizontal: 6,
  },
  menuItemPressed: {
    backgroundColor: '#f7fbf3',
    transform: [{ scale: 0.98 }],
  },
  menuItemIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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

  /* Iconos del menú */
  miCapsuleWrap: {
    flexDirection: 'row',
    width: 18,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    transform: [{ rotate: '-30deg' }],
  },
  miCapsuleHalf: {
    flex: 1,
  },
  miBasketWrap: {
    width: 20,
    height: 18,
    alignItems: 'center',
  },
  miBasketHandle: {
    position: 'absolute',
    top: 0,
    width: 11,
    height: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  miBasketBody: {
    width: 18,
    height: 12,
    borderRadius: 4,
    marginTop: 6,
  },
  miInfoWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    gap: 3,
  },
  miInfoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  miInfoBar: {
    width: 4,
    height: 9,
    borderRadius: 2,
  },
  miTargetWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miTargetRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  miTargetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  miGearWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miGearRing: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  miGearNotchH: {
    position: 'absolute',
    width: 18,
    height: 2.4,
    borderRadius: 2,
  },
  miGearNotchV: {
    position: 'absolute',
    width: 2.4,
    height: 18,
    borderRadius: 2,
  },

  /* Contenido */
  content: {
    paddingHorizontal: 20,
    gap: 14,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  statValue: {
    color: '#1a2e1a',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#1a2e1a',
    fontSize: 18,
    fontWeight: '800',
  },
  smallBtn: {
    backgroundColor: '#f0f9e8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  smallBtnText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },

  fieldGroup: {
    gap: 5,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldFlex: {
    flex: 1,
  },
  label: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f7f9f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1a2e1a',
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f7f9f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  selectBoxText: {
    fontSize: 15,
    color: '#1a2e1a',
  },
  selectBoxChevron: {
    color: '#2E7D32',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  emptyTitle: {
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyDesc: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
  },
  emptyCta: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },

  listGroup: {
    gap: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  listRowText: {
    flex: 1,
    color: '#333',
    fontSize: 13,
  },
  listRowDelete: {
    color: '#e05050',
    fontSize: 12,
    fontWeight: '700',
  },

  inlineForm: {
    gap: 12,
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inlineFormActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
  inlineSaveBtn: {
    flex: 1,
    marginTop: 0,
  },

  securityDesc: {
    color: '#777',
    fontSize: 13,
    lineHeight: 19,
    marginTop: -6,
  },

  /* Actividad reciente */
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

  /* Informacion del sistema */
  systemInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f7f9f5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#eef3ea',
  },
  systemInfoText: {
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '600',
  },
  systemInfoChevron: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: '700',
  },

  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorBox: {
    alignItems: 'center',
    paddingVertical: 40,
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

  /* Modal de sexo */
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  genderModal: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '40%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  genderOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  genderOptionText: {
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '600',
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
  cardSubtitle: {
    color: '#9a9a9a',
  },
  readonlyBox: {
    backgroundColor: '#262626',
    borderColor: '#333',
  },
  readonlyText: {
    color: '#ddd',
  },
  input: {
    backgroundColor: '#262626',
    borderColor: '#3a4a33',
    color: '#f2f2f2',
  },
  menuPanel: {
    backgroundColor: '#1e1e1e',
  },
  menuSectionLabel: {
    color: '#6f7d6f',
  },
  menuItem: {
    backgroundColor: 'transparent',
  },
  menuItemText: {
    color: '#f2f2f2',
  },
});
