import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAppPreferences } from '@/context/app-preferences';
import { BrandLogo } from '@/components/branding/brand-logo';
import { HeroBackground } from '@/components/branding/hero-background';

const COLORS = {
  primaryGreen: '#2E7D32',
  deepGreen: '#1B5E20',
  lightGreen: '#66BB6A',
  softGreen: '#A5D6A7',
  paleGreen: '#E8F5E9',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  textDark: '#263238',
  textMuted: '#6B7B6E',
};

/* ---------- Iconografía vectorial simple (sin librerías externas) ---------- */

function NutritionIcon() {
  return (
    <View style={styles.iconPlate}>
      <View style={styles.iconPlateInner} />
    </View>
  );
}

function TrackingIcon() {
  return (
    <View style={styles.iconBars}>
      <View style={[styles.iconBar, { height: 9 }]} />
      <View style={[styles.iconBar, { height: 15 }]} />
      <View style={[styles.iconBar, { height: 21 }]} />
    </View>
  );
}

function WellnessIcon() {
  return (
    <View style={styles.iconCrossWrap}>
      <View style={styles.iconCrossV} />
      <View style={styles.iconCrossH} />
    </View>
  );
}

const FEATURES = [
  { key: 'nutricion', titleKey: 'feature1Title', descKey: 'feature1Desc', Icon: NutritionIcon },
  { key: 'seguimiento', titleKey: 'feature2Title', descKey: 'feature2Desc', Icon: TrackingIcon },
  { key: 'vida', titleKey: 'feature3Title', descKey: 'feature3Desc', Icon: WellnessIcon },
];

/* ---------- Iconos de categorías, contacto y confianza ---------- */

function CapsuleIcon() {
  return (
    <View style={styles.capsuleWrap}>
      <View style={styles.capsuleHalf} />
      <View style={[styles.capsuleHalf, styles.capsuleHalfMuted]} />
    </View>
  );
}

function TeardropIcon() {
  return <View style={styles.teardrop} />;
}

function DotsClusterIcon() {
  return (
    <View style={styles.dotsCluster}>
      <View style={[styles.clusterDot, styles.clusterDotTop]} />
      <View style={[styles.clusterDot, styles.clusterDotLeft]} />
      <View style={[styles.clusterDot, styles.clusterDotRight]} />
    </View>
  );
}

function TargetIcon() {
  return (
    <View style={styles.targetWrap}>
      <View style={styles.targetRing} />
      <View style={styles.targetDot} />
    </View>
  );
}

function DiamondIcon() {
  return <View style={styles.diamond} />;
}

function PhoneIcon() {
  return <View style={styles.phoneShape} />;
}

function MailIcon() {
  return <View style={styles.mailShape} />;
}

function ClockIcon() {
  return (
    <View style={styles.clockWrap}>
      <View style={styles.clockRing} />
      <View style={styles.clockHandV} />
      <View style={styles.clockHandH} />
    </View>
  );
}

function SpeedIcon() {
  return (
    <View style={styles.speedBars}>
      <View style={[styles.speedBar, { height: 8 }]} />
      <View style={[styles.speedBar, { height: 13 }]} />
      <View style={[styles.speedBar, { height: 18 }]} />
    </View>
  );
}

function LockIcon() {
  return (
    <View style={styles.lockWrap}>
      <View style={styles.lockShackle} />
      <View style={styles.lockBody} />
    </View>
  );
}

const CATEGORY_PALETTE = [
  ['#66BB6A', '#2E7D32'],
  ['#FFA270', '#E8622C'],
  ['#7FB3F2', '#1565C0'],
  ['#C792EA', '#7B1FA2'],
  ['#4FD1C5', '#00695C'],
];

const CATEGORIES = [
  { key: 'proteinas', labelKey: 'catProteinas', Icon: CapsuleIcon },
  { key: 'quemadores', labelKey: 'catQuemadores', Icon: TeardropIcon },
  { key: 'vitaminas', labelKey: 'catVitaminas', Icon: DotsClusterIcon },
  { key: 'apetito', labelKey: 'catApetito', Icon: TargetIcon },
  { key: 'energeticos', labelKey: 'catEnergeticos', Icon: DiamondIcon },
];

const TRUST_BADGES = [
  { key: 'calidad', labelKey: 'trustCalidad', Icon: TargetIcon },
  { key: 'envio', labelKey: 'trustEnvio', Icon: SpeedIcon },
  { key: 'pagos', labelKey: 'trustPagos', Icon: LockIcon },
  { key: 'atencion', labelKey: 'trustAtencion', Icon: DiamondIcon },
];

const CONTACT_ITEMS = [
  {
    key: 'ubicacion',
    labelKey: 'contactUbicacionLabel',
    valueKey: 'ubicacion',
    Icon: TeardropIcon,
  },
  {
    key: 'telefono',
    labelKey: 'contactTelefonoLabel',
    value: '+52 7294030702',
    Icon: PhoneIcon,
    href: 'tel:+527294030702',
  },
  {
    key: 'email',
    labelKey: 'contactEmailLabel',
    value: 'dietlettuce1@gmail.com',
    Icon: MailIcon,
    href: 'mailto:dietlettuce1@gmail.com',
  },
  { key: 'horario', labelKey: 'contactHorarioLabel', valueKey: 'contactHorarioValue', Icon: ClockIcon },
];

const SOCIALS = [
  {
    key: 'facebook',
    label: 'Facebook',
    icon: require('@/img/facebook.png'),
    href: 'https://www.facebook.com/profile.php?id=61582244528322',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    icon: require('@/img/instagram.png'),
    href: 'https://www.instagram.com/dietlettuce1/',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    icon: require('@/img/tik-tok.png'),
    href: 'https://www.tiktok.com/@dietlettuce01',
  },
];

/* ---------- Fondo decorativo ambiental ---------- */

function AmbientBackground() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.ambientLayer]}>
      <View style={styles.ambientBlobTop} />
      <BlurView intensity={70} tint="light" style={styles.ambientBlurTop} />
      <View style={styles.ambientBlobBottom} />
      <BlurView intensity={60} tint="light" style={styles.ambientBlurBottom} />
    </View>
  );
}

/* ---------- Botón con retroalimentación táctil ---------- */

type ScalePressableProps = {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function ScalePressable({ onPress, children, style }: ScalePressableProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [style, pressed && styles.pressedScale]}>
      {children}
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { isDark, t } = useAppPreferences();

  return (
    <View style={[styles.root, isDark && darkStyles.root]}>
      <StatusBar style="light" />
      <AmbientBackground />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}>

        {/* Hero de bienvenida: ocupa toda la pantalla al abrir la app */}
        <HeroBackground
          style={[
            styles.hero,
            { minHeight: height, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 56 },
          ]}>

          <View pointerEvents="none" style={styles.heroBlobLarge} />
          <View pointerEvents="none" style={styles.heroBlobSmall} />
          <View pointerEvents="none" style={styles.heroRing} />

          <View style={styles.heroCenter}>
            <Animated.View entering={FadeIn.duration(500)} style={styles.eyebrowPill}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>{t('heroEyebrow')}</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(120)} style={styles.brandLogoWrap}>
              <BrandLogo variant="white" width={190} />
            </Animated.View>
            <Animated.Text entering={FadeInDown.duration(600).delay(200)} style={styles.tagline}>
              {t('heroTagline')}
            </Animated.Text>

            {/* Botones de acción, siempre visibles y centrados */}
            <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.ctaSection}>
              <ScalePressable onPress={() => router.push('/login')} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>{t('heroLoginBtn')}</Text>
                <Text style={styles.primaryBtnArrow}>→</Text>
              </ScalePressable>

              <ScalePressable onPress={() => router.push('/sobre-nosotros')} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>{t('heroKnowMore')}</Text>
              </ScalePressable>
            </Animated.View>

            <Animated.View entering={FadeIn.duration(500).delay(500)} style={styles.scrollHint}>
              <Text style={styles.scrollHintText}>{t('scrollHint')}</Text>
              <Text style={styles.scrollHintChevron}>⌄</Text>
            </Animated.View>
          </View>
        </HeroBackground>

        <View style={styles.content}>
          {/* Tarjeta flotante de beneficios */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(260)}
            style={[styles.floatingCard, isDark && darkStyles.card]}>
            <Text style={styles.floatingCardEyebrow}>{t('whatYouCanDo')}</Text>
            {FEATURES.map(({ key, titleKey, descKey, Icon }, index) => (
              <View
                key={key}
                style={[styles.featureRow, index < FEATURES.length - 1 && styles.featureRowDivider]}>
                <LinearGradient
                  colors={[COLORS.lightGreen, COLORS.primaryGreen]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardIconBadge}>
                  <Icon />
                </LinearGradient>
                <View style={styles.cardTextWrap}>
                  <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                    {t(titleKey)}
                  </Text>
                  <Text style={styles.cardDescription}>{t(descKey)}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Categorías de productos */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(300)}
            style={[styles.sectionCard, isDark && darkStyles.card]}>
            <Text style={[styles.sectionTitle, isDark && darkStyles.cardTitle]}>
              {t('ourProducts')}
            </Text>
            <Text style={styles.sectionSubtitle}>{t('ourProductsSubtitle')}</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(({ key, labelKey, Icon }, index) => (
                <View key={key} style={styles.categoryChip}>
                  <LinearGradient
                    colors={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length] as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.categoryIconBadge}>
                    <Icon />
                  </LinearGradient>
                  <Text style={[styles.categoryLabel, isDark && darkStyles.cardTitle]}>
                    {t(labelKey)}
                  </Text>
                </View>
              ))}
            </View>
            <ScalePressable onPress={() => router.push('/productos')} style={styles.outlineBtn}>
              <Text style={styles.outlineBtnText}>{t('verTodosProductos')}</Text>
              <Text style={styles.outlineBtnArrow}>›</Text>
            </ScalePressable>
          </Animated.View>

          {/* Sellos de confianza */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(340)}
            style={[styles.sectionCard, isDark && darkStyles.card]}>
            <Text style={[styles.sectionTitle, isDark && darkStyles.cardTitle]}>
              {t('whyChooseUs')}
            </Text>
            <View style={styles.trustGrid}>
              {TRUST_BADGES.map(({ key, labelKey, Icon }) => (
                <View key={key} style={styles.trustItem}>
                  <View style={styles.trustIconBadge}>
                    <Icon />
                  </View>
                  <Text style={[styles.trustLabel, isDark && darkStyles.cardTitle]}>
                    {t(labelKey)}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Contacto */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(380)}
            style={[styles.sectionCard, isDark && darkStyles.card]}>
            <Text style={[styles.sectionTitle, isDark && darkStyles.cardTitle]}>
              {t('contactoTitle')}
            </Text>
            {CONTACT_ITEMS.map(({ key, labelKey, value, valueKey, Icon, href }, index) => {
              const row = (
                <View
                  style={[
                    styles.contactRow,
                    index < CONTACT_ITEMS.length - 1 && styles.contactRowDivider,
                  ]}>
                  <View style={styles.contactIconBadge}>
                    <Icon />
                  </View>
                  <View style={styles.contactTextWrap}>
                    <Text style={styles.contactLabel}>{t(labelKey)}</Text>
                    <Text style={[styles.contactValue, isDark && darkStyles.cardTitle]}>
                      {value ?? t(valueKey!)}
                    </Text>
                  </View>
                </View>
              );
              return href ? (
                <Pressable key={key} onPress={() => Linking.openURL(href)}>
                  {row}
                </Pressable>
              ) : (
                <View key={key}>{row}</View>
              );
            })}
          </Animated.View>

          {/* Redes sociales */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(420)}
            style={[styles.sectionCard, isDark && darkStyles.card]}>
            <Text style={[styles.sectionTitle, isDark && darkStyles.cardTitle]}>
              {t('findUs')}
            </Text>
            <Text style={styles.sectionSubtitle}>{t('findUsSubtitle')}</Text>
            <View style={styles.socialRow}>
              {SOCIALS.map(({ key, label, icon, href }) => (
                <Pressable key={key} style={styles.socialItem} onPress={() => Linking.openURL(href)}>
                  <Image source={icon} style={styles.socialBadge} resizeMode="contain" />
                  <Text style={styles.socialLabel}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Pie de página */}
          <Animated.View entering={FadeIn.duration(500).delay(460)} style={styles.footerWrap}>
            <BrandLogo variant="color" width={130} />
            <Text style={styles.footerTagline}>{t('taglineFull')}</Text>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Balancea. Todos los derechos reservados.
            </Text>
          </Animated.View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },

  /* Fondo ambiental decorativo */
  ambientLayer: {
    overflow: 'hidden',
  },
  ambientBlobTop: {
    position: 'absolute',
    top: 140,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.paleGreen,
    opacity: 0.9,
  },
  ambientBlurTop: {
    position: 'absolute',
    top: 100,
    right: -130,
    width: 320,
    height: 320,
    borderRadius: 160,
    overflow: 'hidden',
  },
  ambientBlobBottom: {
    position: 'absolute',
    bottom: 60,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.paleGreen,
    opacity: 0.7,
  },
  ambientBlurBottom: {
    position: 'absolute',
    bottom: 20,
    left: -140,
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    paddingHorizontal: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  heroCenter: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBlobLarge: {
    position: 'absolute',
    top: -60,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroBlobSmall: {
    position: 'absolute',
    bottom: 20,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroRing: {
    position: 'absolute',
    top: 40,
    left: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 20,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.softGreen,
  },
  eyebrowText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  brandLogoWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  scrollHint: {
    marginTop: 36,
    alignItems: 'center',
    gap: 6,
  },
  scrollHintText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scrollHintChevron: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 16,
    fontWeight: '700',
  },

  /* Contenido */
  scroll: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
  },

  /* Tarjeta flotante */
  floatingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 4,
    marginTop: -64,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  floatingCardEyebrow: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  featureRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 3,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },

  /* Iconos */
  iconPlate: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlateInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  iconBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 21,
  },
  iconBar: {
    width: 5,
    borderRadius: 2,
    backgroundColor: COLORS.white,
  },
  iconCrossWrap: {
    width: 22,
    height: 22,
  },
  iconCrossV: {
    position: 'absolute',
    left: 8,
    top: 0,
    width: 6,
    height: 22,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  iconCrossH: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },

  /* Botones (sobre el degradado verde del hero) */
  ctaSection: {
    width: '100%',
    gap: 12,
    marginTop: 32,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: {
    color: COLORS.primaryGreen,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  primaryBtnArrow: {
    color: COLORS.primaryGreen,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  secondaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  pressedScale: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  /* Tarjeta de sección genérica */
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },

  /* Categorías de productos */
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  categoryIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 14,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 18,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.softGreen,
  },
  outlineBtnText: {
    color: COLORS.primaryGreen,
    fontSize: 14,
    fontWeight: '700',
  },
  outlineBtnArrow: {
    color: COLORS.primaryGreen,
    fontSize: 16,
    fontWeight: '700',
  },

  /* Sellos de confianza */
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  trustItem: {
    width: '42%',
    alignItems: 'center',
    gap: 8,
  },
  trustIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },

  /* Contacto */
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  contactRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactTextWrap: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  /* Redes sociales */
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialItem: {
    alignItems: 'center',
    gap: 8,
  },
  socialBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  socialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  /* Formas de iconos: categorías, contacto y confianza */
  capsuleWrap: {
    flexDirection: 'row',
    width: 22,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    transform: [{ rotate: '-30deg' }],
  },
  capsuleHalf: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  capsuleHalfMuted: {
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  teardrop: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    backgroundColor: COLORS.white,
    transform: [{ rotate: '45deg' }],
  },
  dotsCluster: {
    width: 22,
    height: 20,
  },
  clusterDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.white,
  },
  clusterDotTop: {
    top: 0,
    left: 7,
  },
  clusterDotLeft: {
    bottom: 0,
    left: 0,
  },
  clusterDotRight: {
    bottom: 0,
    right: 0,
  },
  targetWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: COLORS.white,
  },
  targetDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.white,
  },
  diamond: {
    width: 15,
    height: 15,
    backgroundColor: COLORS.white,
    transform: [{ rotate: '45deg' }],
  },
  phoneShape: {
    width: 12,
    height: 20,
    borderRadius: 5,
    backgroundColor: COLORS.primaryGreen,
    transform: [{ rotate: '15deg' }],
  },
  mailShape: {
    width: 20,
    height: 14,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
  },
  clockWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockRing: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.2,
    borderColor: COLORS.primaryGreen,
  },
  clockHandV: {
    position: 'absolute',
    width: 2.2,
    height: 7,
    borderRadius: 2,
    backgroundColor: COLORS.primaryGreen,
    top: 5,
  },
  clockHandH: {
    position: 'absolute',
    width: 6,
    height: 2.2,
    borderRadius: 2,
    backgroundColor: COLORS.primaryGreen,
    left: 11,
  },
  speedBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 18,
  },
  speedBar: {
    width: 5,
    borderRadius: 2,
    backgroundColor: COLORS.primaryGreen,
  },
  lockWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  lockShackle: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 11,
    borderRadius: 6,
    borderWidth: 2.2,
    borderColor: COLORS.primaryGreen,
    borderBottomWidth: 0,
  },
  lockBody: {
    width: 16,
    height: 11,
    borderRadius: 3,
    backgroundColor: COLORS.primaryGreen,
  },

  /* Footer */
  footerWrap: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  footerTagline: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footerDivider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.softGreen,
    marginTop: 4,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

const darkStyles = StyleSheet.create({
  root: {
    backgroundColor: '#121212',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderColor: '#2a2a2a',
  },
  cardTitle: {
    color: '#f2f2f2',
  },
});
