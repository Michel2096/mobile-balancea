import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
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
  UserProfile,
  Direccion,
  Tarjeta,
} from '@/services/api';
import { useAppPreferences } from '@/context/app-preferences';

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

const GENDER_OPTIONS = [
  { value: 'masculino', labelKey: 'profileGenderMale' },
  { value: 'femenino', labelKey: 'profileGenderFemale' },
  { value: 'otro', labelKey: 'profileGenderOther' },
  { value: 'no_decir', labelKey: 'profileGenderPrefer' },
];

export default function ProfileScreen() {
  const { isDark, language, t } = useAppPreferences();
  const currentUser = getUser();

  const [profile, setProfile] = useState<UserProfile | null>(currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const data = await userApi.getProfile(currentUser.id);
      applyProfile(data);
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

          {/* Encabezado en degradado */}
          <LinearGradient
            colors={['#4EC920', '#1B5E20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}>
            <View pointerEvents="none" style={styles.headerBlob} />

            <View style={styles.headerTopRow}>
              <Pressable
                style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
                onPress={() => router.back()}>
                <Text style={styles.headerBtnText}>{t('profileBack')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
                onPress={handleLogout}>
                <Text style={styles.headerBtnText}>{t('profileLogout')}</Text>
              </Pressable>
            </View>

            <Text style={styles.headerTitle}>{t('profileTitle')}</Text>

            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            <Text style={styles.nameText}>{profile?.nombre ?? 'Usuario'}</Text>
            <Text style={styles.emailBadge}>{profile?.correo ?? ''}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{roleLabel}</Text>
            </View>
            <Text style={styles.memberSince}>
              {t('profileMemberSince')} {formatMemberSince(profile?.fecha_registro, language)}
            </Text>
          </LinearGradient>

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
    marginBottom: 10,
  },
  headerBtn: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
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
    marginTop: 10,
  },
  rolePillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  memberSince: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 8,
  },

  /* Contenido */
  content: {
    paddingHorizontal: 20,
    gap: 14,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  statValue: {
    color: '#1a2e1a',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
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
});
