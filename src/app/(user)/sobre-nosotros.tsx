import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppPreferences } from '@/context/app-preferences';

type IconVariant = 'cross' | 'dots' | 'capsule' | 'target' | 'diamond';

const ESENCIA = [
  { key: 'pasion', titleKey: 'esencia1Title', descKey: 'esencia1Desc', icon: 'cross' as IconVariant, color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'compromiso', titleKey: 'esencia2Title', descKey: 'esencia2Desc', icon: 'dots' as IconVariant, color: '#1565C0', bg: '#E3F2FD' },
  { key: 'innovacion', titleKey: 'esencia3Title', descKey: 'esencia3Desc', icon: 'capsule' as IconVariant, color: '#E8622C', bg: '#FFF3E0' },
  { key: 'excelencia', titleKey: 'esencia4Title', descKey: 'esencia4Desc', icon: 'target' as IconVariant, color: '#7B1FA2', bg: '#EDE7F6' },
];

const VALORES = [
  { key: 'calidad', labelKey: 'valorCalidad', icon: 'target' as IconVariant, color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'integridad', labelKey: 'valorIntegridad', icon: 'diamond' as IconVariant, color: '#1565C0', bg: '#E3F2FD' },
  { key: 'compromiso', labelKey: 'valorCompromiso', icon: 'dots' as IconVariant, color: '#E8622C', bg: '#FFF3E0' },
  { key: 'innovacion', labelKey: 'valorInnovacion', icon: 'capsule' as IconVariant, color: '#7B1FA2', bg: '#EDE7F6' },
  { key: 'respeto', labelKey: 'valorRespeto', icon: 'cross' as IconVariant, color: '#00695C', bg: '#E0F2F1' },
];

const METAS = ['meta1', 'meta2', 'meta3'];

const STATS = [
  { key: 'clientes', valueKey: 'statClientesValue', labelKey: 'statClientesLabel', descKey: 'statClientesDesc' },
  { key: 'productos', valueKey: 'statProductosValue', labelKey: 'statProductosLabel', descKey: 'statProductosDesc' },
  { key: 'satisfaccion', valueKey: 'statSatisfaccionValue', labelKey: 'statSatisfaccionLabel', descKey: 'statSatisfaccionDesc' },
  { key: 'calidad', valueKey: 'statCalidadValue', labelKey: 'statCalidadLabel', descKey: 'statCalidadDesc' },
];

const EQUIPO = [
  { key: 'jc', nombre: 'Villavicencio Gonzalez Juan Carlos', telefono: '+52 7294030702' },
  { key: 'ac', nombre: 'Jiménez Ocampo Amanda Carolina', telefono: '+52 7292948980' },
  { key: 'ax', nombre: 'Arzte Neri Axel', telefono: '+52 7226780112' },
  { key: 'ma', nombre: 'Lopez Villar Miguel Angel', telefono: '+52 7226165733' },
];

function PillarIcon({ variant, color }: { variant: IconVariant; color: string }) {
  switch (variant) {
    case 'cross':
      return (
        <View style={styles.icCrossWrap}>
          <View style={[styles.icCrossV, { backgroundColor: color }]} />
          <View style={[styles.icCrossH, { backgroundColor: color }]} />
        </View>
      );
    case 'dots':
      return (
        <View style={styles.icDotsWrap}>
          <View style={[styles.icDot, styles.icDotTop, { backgroundColor: color }]} />
          <View style={[styles.icDot, styles.icDotLeft, { backgroundColor: color }]} />
          <View style={[styles.icDot, styles.icDotRight, { backgroundColor: color }]} />
        </View>
      );
    case 'capsule':
      return (
        <View style={styles.icCapsuleWrap}>
          <View style={[styles.icCapsuleHalf, { backgroundColor: color }]} />
          <View style={[styles.icCapsuleHalf, { backgroundColor: color, opacity: 0.4 }]} />
        </View>
      );
    case 'target':
      return (
        <View style={styles.icTargetWrap}>
          <View style={[styles.icTargetRing, { borderColor: color }]} />
          <View style={[styles.icTargetDot, { backgroundColor: color }]} />
        </View>
      );
    case 'diamond':
      return <View style={[styles.icDiamond, { backgroundColor: color }]} />;
  }
}

export default function SobreNosotrosScreen() {
  const { isDark, t } = useAppPreferences();

  return (
    <SafeAreaView style={[styles.safeArea, isDark && darkStyles.safeArea]}>
      <ScrollView
        contentContainerStyle={[styles.scrollOuter, isDark && darkStyles.scrollOuter]}
        showsVerticalScrollIndicator={false}>

        {/* Encabezado en degradado */}
        <LinearGradient
          colors={['#4EC920', '#1B5E20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          <View pointerEvents="none" style={styles.headerBlob} />
          <View pointerEvents="none" style={styles.headerBlobSmall} />

          <View style={styles.headerTopRow}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              onPress={() => router.back()}>
              <Text style={styles.backBtnText}>{t('backVolver')}</Text>
            </Pressable>

            <View style={styles.logoWrap}>
              <Image
                source={require('../../../assets/images/logo-glow.png')}
                style={styles.navLogo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.eyebrow}>{t('menuNosotros').toUpperCase()}</Text>
          <Text style={styles.title}>{t('aboutSubtitle')}</Text>
          <Text style={styles.heroText}>{t('aboutIntro')}</Text>
        </LinearGradient>

        <View style={styles.content}>

          {/* Nuestra Esencia */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={[styles.sectionTitle, isDark && darkStyles.cardTitle]}>
              {t('esenciaTitle')}
            </Text>
          </View>
          <View style={styles.essenceGrid}>
            {ESENCIA.map((item) => (
              <View key={item.key} style={[styles.essenceCard, isDark && darkStyles.card]}>
                <View style={[styles.essenceIconBubble, { backgroundColor: item.bg }]}>
                  <PillarIcon variant={item.icon} color={item.color} />
                </View>
                <Text style={[styles.essenceTitle, isDark && darkStyles.cardTitle]}>
                  {t(item.titleKey)}
                </Text>
                <Text style={styles.essenceDesc}>{t(item.descKey)}</Text>
              </View>
            ))}
          </View>

          {/* Mision */}
          <View style={[styles.card, isDark && darkStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                {t('misionTitle')}
              </Text>
            </View>
            <Text style={[styles.cardText, isDark && darkStyles.cardText]}>{t('misionText')}</Text>
          </View>

          {/* Vision */}
          <View style={[styles.card, isDark && darkStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                {t('visionTitle')}
              </Text>
            </View>
            <Text style={[styles.cardText, isDark && darkStyles.cardText]}>{t('visionText')}</Text>
          </View>

          {/* Valores */}
          <View style={[styles.card, isDark && darkStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                {t('valoresTitle')}
              </Text>
            </View>
            <View style={styles.valoresGrid}>
              {VALORES.map((valor) => (
                <View key={valor.key} style={styles.valorItem}>
                  <View style={[styles.valorIconBubble, { backgroundColor: valor.bg }]}>
                    <PillarIcon variant={valor.icon} color={valor.color} />
                  </View>
                  <Text style={[styles.valorLabel, isDark && darkStyles.cardTitle]}>
                    {t(valor.labelKey)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Objetivo */}
          <View style={[styles.card, isDark && darkStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                {t('objetivoTitle')}
              </Text>
            </View>
            <Text style={[styles.cardText, isDark && darkStyles.cardText]}>
              {t('objetivoText')}
            </Text>
          </View>

          {/* Metas */}
          <View style={[styles.card, isDark && darkStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                {t('metasTitle')}
              </Text>
            </View>
            <View style={styles.metasList}>
              {METAS.map((key) => (
                <View key={key} style={styles.metaRow}>
                  <View style={styles.metaCheck}>
                    <Ionicons name="checkmark" size={13} color="#2E7D32" />
                  </View>
                  <Text style={[styles.metaText, isDark && darkStyles.cardText]}>{t(key)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Balancea en numeros */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={[styles.sectionTitle, isDark && darkStyles.cardTitle]}>
              {t('statsSectionTitle')}
            </Text>
          </View>
          <View style={styles.statsGrid}>
            {STATS.map((stat) => (
              <View key={stat.key} style={[styles.statCard, isDark && darkStyles.card]}>
                <Text style={[styles.statValue, isDark && darkStyles.cardTitle]} numberOfLines={1}>
                  {t(stat.valueKey)}
                </Text>
                <Text style={[styles.statLabel, isDark && darkStyles.cardTitle]}>
                  {t(stat.labelKey)}
                </Text>
                <Text style={styles.statDesc}>{t(stat.descKey)}</Text>
              </View>
            ))}
          </View>

          {/* Contacto */}
          <View style={[styles.card, styles.contactCard]}>
            <Text style={styles.contactLabel}>{t('contactoTitle')}</Text>
            <Text style={styles.contactPrompt}>{t('contactoPrompt')}</Text>

            <View style={styles.contactLocationRow}>
              <Text style={styles.contactLocationText}>{t('ubicacion')}</Text>
            </View>

            <View style={styles.teamList}>
              {EQUIPO.map((persona) => (
                <Pressable
                  key={persona.key}
                  style={({ pressed }) => [styles.teamRow, pressed && styles.pressed]}
                  onPress={() => Linking.openURL(`tel:${persona.telefono.replace(/\s+/g, '')}`)}>
                  <Text style={styles.teamName}>{persona.nombre}</Text>
                  <Text style={styles.teamPhone}>{persona.telefono}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [styles.emailPill, pressed && styles.pressed]}
              onPress={() => Linking.openURL('mailto:dietlettuce1@gmail.com')}>
              <Text style={styles.emailText}>dietlettuce1@gmail.com</Text>
            </Pressable>
          </View>

          {/* Pie de marca */}
          <View style={styles.brandFooter}>
            <Text style={[styles.brandFooterTitle, isDark && darkStyles.cardTitle]}>Balancea</Text>
            <Text style={styles.brandFooterTagline}>Tu decisión crea el equilibrio.</Text>
            <Text style={styles.brandFooterCopy}>
              © {new Date().getFullYear()} Balancea. Todos los derechos reservados.
            </Text>
          </View>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && styles.pressed]}
            onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>{t('irLogin')}</Text>
          </Pressable>

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

  /* Encabezado */
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
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
  headerBlobSmall: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogo: {
    width: 26,
    height: 26,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  heroText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
  },

  /* Contenido */
  content: {
    paddingHorizontal: 20,
    gap: 14,
    marginTop: 4,
  },
  sectionHeaderWrap: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1a2e1a',
  },

  /* Card genérica */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardAccentBar: {
    width: 4,
    height: 20,
    backgroundColor: '#2E7D32',
    borderRadius: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a2e1a',
  },
  cardText: {
    fontSize: 14,
    lineHeight: 23,
    color: '#555',
  },

  /* Nuestra esencia */
  essenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  essenceCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  essenceIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  essenceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2e1a',
    lineHeight: 18,
  },
  essenceDesc: {
    fontSize: 12.5,
    color: '#888',
    lineHeight: 18,
  },

  /* Valores */
  valoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'flex-start',
  },
  valorItem: {
    width: '28%',
    alignItems: 'center',
    gap: 8,
  },
  valorIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a2e1a',
    textAlign: 'center',
  },

  /* Metas */
  metasList: {
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  metaText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },

  /* Stats */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a2e1a',
    marginTop: 4,
  },
  statDesc: {
    fontSize: 11.5,
    color: '#888',
    marginTop: 3,
    lineHeight: 16,
  },

  /* Iconos compartidos */
  icCrossWrap: {
    width: 20,
    height: 20,
  },
  icCrossV: {
    position: 'absolute',
    left: 8,
    top: 0,
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  icCrossH: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  icDotsWrap: {
    width: 20,
    height: 18,
  },
  icDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  icDotTop: {
    top: 0,
    left: 6.5,
  },
  icDotLeft: {
    bottom: 0,
    left: 0,
  },
  icDotRight: {
    bottom: 0,
    right: 0,
  },
  icCapsuleWrap: {
    flexDirection: 'row',
    width: 20,
    height: 11,
    borderRadius: 5.5,
    overflow: 'hidden',
    transform: [{ rotate: '-30deg' }],
  },
  icCapsuleHalf: {
    flex: 1,
  },
  icTargetWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icTargetRing: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
  },
  icTargetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  icDiamond: {
    width: 14,
    height: 14,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },

  /* Contact */
  contactCard: {
    backgroundColor: '#f8fdf5',
    borderColor: '#d4edbc',
    alignItems: 'center',
    gap: 10,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactPrompt: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  emailPill: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#b6f088',
  },
  emailText: {
    color: '#3aab14',
    fontSize: 14,
    fontWeight: '700',
  },
  contactLocationRow: {
    paddingBottom: 2,
  },
  contactLocationText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '700',
  },
  teamList: {
    width: '100%',
    gap: 2,
  },
  teamRow: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5f3d9',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a2e1a',
    textAlign: 'center',
  },
  teamPhone: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3aab14',
    marginTop: 2,
  },

  /* Pie de marca */
  brandFooter: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  brandFooterTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a2e1a',
  },
  brandFooterTagline: {
    fontSize: 13,
    color: '#666',
  },
  brandFooterCopy: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },

  /* Login CTA */
  loginBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

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
  cardText: {
    color: '#c8c8c8',
  },
});
