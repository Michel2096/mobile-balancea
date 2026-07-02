import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const COLORS = {
  primaryGreen: '#2E7D32',
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

const CARDS = [
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/images/logo-glow.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brand}>Balancea</Text>
          <Text style={styles.tagline}>
            Tu bienestar comienza con una mejor alimentación.
          </Text>
        </View>

        {/* Tarjetas informativas */}
        <View style={styles.cardsWrap}>
          {CARDS.map(({ key, title, description, Icon }) => (
            <View key={key} style={styles.card}>
              <View style={styles.cardIconBadge}>
                <Icon />
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDescription}>{description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Botones */}
        <View style={styles.ctaSection}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={() => router.push('/login')}>
            <Text style={styles.primaryBtnText}>Comenzar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={() => router.push('/sobre-nosotros')}>
            <Text style={styles.secondaryBtnText}>Conocer más</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Balancea © 2026</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
  },

  /* Encabezado */
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 26,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 58,
    height: 58,
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.primaryGreen,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
  },

  /* Tarjetas */
  cardsWrap: {
    gap: 14,
    marginBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },

  /* Iconos */
  iconPlate: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlateInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
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
    width: 24,
    height: 24,
  },
  iconCrossV: {
    position: 'absolute',
    left: 9,
    top: 1,
    width: 6,
    height: 22,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  iconCrossH: {
    position: 'absolute',
    left: 1,
    top: 9,
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },

  /* Botones */
  ctaSection: {
    gap: 12,
    marginBottom: 28,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
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
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
