import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const COLORS = {
  primaryGreen: '#2E7D32',
  deepGreen: '#1B5E20',
  lightGreen: '#66BB6A',
  softGreen: '#A5D6A7',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  textDark: '#263238',
  textMuted: '#6B7B6E',
};

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
  {
    key: 'nutricion',
    title: 'Nutrición Inteligente',
    description: 'Recibe recomendaciones personalizadas.',
    Icon: NutritionIcon,
  },
  {
    key: 'seguimiento',
    title: 'Seguimiento Diario',
    description: 'Registra tus comidas y progreso.',
    Icon: TrackingIcon,
  },
  {
    key: 'vida',
    title: 'Vida Saludable',
    description: 'Construye hábitos que duren toda la vida.',
    Icon: WellnessIcon,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}>

        {/* Hero: primer elemento del scroll, así la tarjeta flotante puede
            superponerse a su borde inferior sin quedar recortada por el
            contenedor de scroll (pasaba cuando el hero vivía fuera del ScrollView). */}
        <LinearGradient
          colors={[COLORS.primaryGreen, COLORS.deepGreen]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 22 }]}>

          <View pointerEvents="none" style={styles.heroBlobLarge} />
          <View pointerEvents="none" style={styles.heroBlobSmall} />

          <Animated.View entering={FadeIn.duration(500)} style={styles.eyebrowPill}>
            <Text style={styles.eyebrowText}>SALUD · NUTRICIÓN · BIENESTAR</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(80)} style={styles.logoWrap}>
            <Image
              source={require('../../assets/images/logo-glow.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text entering={FadeInDown.duration(600).delay(160)} style={styles.brand}>
            Balancea
          </Animated.Text>
          <Animated.Text entering={FadeInDown.duration(600).delay(220)} style={styles.tagline}>
            Tu bienestar comienza con una mejor alimentación.
          </Animated.Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Tarjeta flotante de beneficios */}
          <Animated.View entering={FadeInUp.duration(600).delay(260)} style={styles.floatingCard}>
            {FEATURES.map(({ key, title, description, Icon }, index) => (
              <View
                key={key}
                style={[styles.featureRow, index < FEATURES.length - 1 && styles.featureRowDivider]}>
                <View style={styles.cardIconBadge}>
                  <Icon />
                </View>
                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardTitle}>{title}</Text>
                  <Text style={styles.cardDescription}>{description}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Botones */}
          <Animated.View entering={FadeInUp.duration(600).delay(360)} style={styles.ctaSection}>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
              onPress={() => router.push('/login')}>
              <Text style={styles.primaryBtnText}>Comenzar</Text>
              <Text style={styles.primaryBtnArrow}>→</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
              onPress={() => router.push('/sobre-nosotros')}>
              <Text style={styles.secondaryBtnText}>Conocer más</Text>
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.duration(500).delay(460)} style={styles.footerWrap}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>Balancea © 2026</Text>
          </Animated.View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 76,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
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
  eyebrowPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 18,
  },
  eyebrowText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  logo: {
    width: 54,
    height: 54,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
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
    paddingVertical: 4,
    marginTop: -48,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
  },
  featureRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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

  /* Botones */
  ctaSection: {
    gap: 12,
    marginBottom: 24,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  primaryBtnArrow: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.softGreen,
    backgroundColor: COLORS.lightGray,
  },
  secondaryBtnText: {
    color: COLORS.primaryGreen,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },

  /* Footer */
  footerWrap: {
    alignItems: 'center',
    gap: 14,
  },
  footerDivider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.softGreen,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
