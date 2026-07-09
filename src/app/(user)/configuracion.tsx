import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import { getUser, userApi, UserProfile } from '@/services/api';
import { useAppPreferences } from '@/context/app-preferences';
import { SettingCard } from '@/components/settings/SettingCard';
import { ThemeSwitcher } from '@/components/settings/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/settings/LanguageSwitcher';

export default function ConfiguracionScreen() {
  const { isDark, toggleScheme, language, toggleLanguage, t } = useAppPreferences();
  const currentUser = getUser();
  const [profile, setProfile] = useState<UserProfile | null>(currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [securityOpen, setSecurityOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  async function fetchProfile() {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getProfile(currentUser.id);
      setProfile(data);
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

  return (
    <SafeAreaView style={[styles.safeArea, isDark && darkStyles.safeArea]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView
          contentContainerStyle={[styles.scrollOuter, isDark && darkStyles.scrollOuter]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header hero */}
          <LinearGradient
            colors={['#4EC920', '#1B5E20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}>
            <View pointerEvents="none" style={styles.headerBlobLarge} />
            <View pointerEvents="none" style={styles.headerBlobSmall} />
            <View pointerEvents="none" style={styles.headerDotsRow}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={styles.headerDot} />
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              onPress={() => router.back()}>
              <Text style={styles.backBtnText}>{t('back')}</Text>
            </Pressable>

            <Text style={styles.heroTitle}>{t('settingsTitle')}</Text>
            <Text style={styles.heroDesc}>{t('settingsHeroDesc')}</Text>

            <View style={styles.headerUserRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {(profile?.nombre ?? 'U')[0]?.toUpperCase() ?? 'U'}
                </Text>
              </View>
              <Text style={styles.headerUserName} numberOfLines={1}>
                {profile?.nombre ?? t('settingsSubtitle')}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>

            {/* Idioma */}
            <SettingCard
              icon="globe-outline"
              iconBg="#E3F2FD"
              iconColor="#1565C0"
              title={t('changeLanguage')}
              description={t('settingsLanguageDesc')}
              isDark={isDark}>
              <LanguageSwitcher language={language} onToggle={toggleLanguage} isDark={isDark} />
            </SettingCard>

            {/* Tema */}
            <SettingCard
              icon="color-palette-outline"
              iconBg="#FFF3E0"
              iconColor="#E8622C"
              title={t('changeTheme')}
              description={t('settingsThemeDesc')}
              isDark={isDark}>
              <ThemeSwitcher
                isDark={isDark}
                onToggle={toggleScheme}
                lightLabel={t('lightMode')}
                darkLabel={t('darkMode')}
              />
            </SettingCard>

            {/* Notificaciones */}
            <SettingCard
              icon="notifications-outline"
              iconBg="#FCE4EC"
              iconColor="#C2185B"
              title={t('notifTitle')}
              description={t('settingsNotifCardDesc')}
              isDark={isDark}
              onPress={() => router.push('/notificaciones')}
            />

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#4EC920" />
                <Text style={[styles.loadingText, isDark && darkStyles.loadingText]}>
                  {t('loadingAccount')}
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorBox}>
                <Text style={[styles.errorTitle, isDark && darkStyles.errorTitle]}>
                  {t('loadErrorTitle')}
                </Text>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={fetchProfile} style={styles.retryBtn}>
                  <Text style={styles.retryText}>{t('retry')}</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Cuenta */}
                <SettingCard
                  icon="person-outline"
                  iconBg="#E8F5E9"
                  iconColor="#2E7D32"
                  title={t('accountTitle')}
                  description={t('settingsAccountDesc')}
                  isDark={isDark}>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('email')}</Text>
                    <View style={[styles.readonlyBox, isDark && darkStyles.readonlyBox]}>
                      <Text style={[styles.readonlyText, isDark && darkStyles.readonlyText]}>
                        {profile?.correo ?? '—'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('accountType')}</Text>
                    <View style={[styles.readonlyBox, isDark && darkStyles.readonlyBox]}>
                      <Text style={[styles.readonlyText, isDark && darkStyles.readonlyText]}>
                        {profile?.tipo_cuenta ?? '—'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>{t('phone')}</Text>
                    <View style={[styles.readonlyBox, isDark && darkStyles.readonlyBox]}>
                      <Text style={[styles.readonlyText, isDark && darkStyles.readonlyText]}>
                        {profile?.telefono || '—'}
                      </Text>
                    </View>
                  </View>
                </SettingCard>

                {/* Seguridad */}
                <SettingCard
                  icon="lock-closed-outline"
                  iconBg="#EDE7F6"
                  iconColor="#7B1FA2"
                  title={t('changePasswordTitle')}
                  description={t('settingsSecurityDesc')}
                  isDark={isDark}
                  onPress={() => setSecurityOpen((v) => !v)}>
                  {securityOpen && (
                    <View style={styles.securityForm}>
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
                          {savingPassword ? t('saving') : t('updatePassword')}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </SettingCard>
              </>
            )}

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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

  /* Header hero */
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 60,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  headerBlobLarge: {
    position: 'absolute',
    top: -60,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerBlobSmall: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerDotsRow: {
    position: 'absolute',
    top: 24,
    right: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 46,
    gap: 6,
  },
  headerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
    maxWidth: 260,
  },
  headerUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#2E7D32',
    fontSize: 17,
    fontWeight: '800',
  },
  headerUserName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },

  /* Contenido */
  content: {
    paddingHorizontal: 20,
    gap: 14,
    marginTop: -32,
  },

  fieldGroup: {
    gap: 5,
  },
  label: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readonlyBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  readonlyText: {
    color: '#888',
    fontSize: 14,
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
  securityForm: {
    gap: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
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
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 30,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  errorBox: {
    alignItems: 'center',
    paddingTop: 30,
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
  readonlyBox: {
    backgroundColor: '#262626',
    borderColor: '#333',
  },
  readonlyText: {
    color: '#bbb',
  },
  input: {
    backgroundColor: '#262626',
    borderColor: '#3a4a33',
    color: '#f2f2f2',
  },
  loadingText: {
    color: '#9a9a9a',
  },
  errorTitle: {
    color: '#f2f2f2',
  },
});
