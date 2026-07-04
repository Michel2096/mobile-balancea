import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useAppPreferences } from '@/context/app-preferences';

const OFFERINGS = [
  { titleKey: 'offer1Title', descKey: 'offer1Desc' },
  { titleKey: 'offer2Title', descKey: 'offer2Desc' },
  { titleKey: 'offer3Title', descKey: 'offer3Desc' },
  { titleKey: 'offer4Title', descKey: 'offer4Desc' },
];

const VALOR_KEYS = [
  'valorSaludIntegral',
  'valorRespaldoProfesional',
  'valorCompromiso',
  'valorAccesibilidad',
  'valorInnovacion',
  'valorEmpatia',
  'valorRespeto',
  'valorDisciplina',
];

const DOCUMENTOS = [
  {
    key: 'canva',
    title: 'Canva Balancea',
    desc: 'Presentación y diseño de nuestra marca',
    asset: require('@/pdfs/canva-diet-lettuce.pdf'),
  },
  {
    key: 'carta-usuario',
    title: 'Carta del Usuario',
    desc: 'Términos y condiciones para usuarios',
    asset: require('@/pdfs/carta-usuario.pdf'),
  },
  {
    key: 'balance',
    title: 'Balance Balancea',
    desc: 'Presentación y diseño de nuestra marca',
    asset: require('@/pdfs/balance-diet-lettuce.pdf'),
  },
  {
    key: 'foda',
    title: 'Foda Balancea',
    desc: 'Presentación y diseño de nuestra marca',
    asset: require('@/pdfs/foda-diet-lettuce-completo.pdf'),
  },
  {
    key: 'madurez',
    title: 'Carta de Madurez Balancea',
    desc: 'Próximamente disponible',
    asset: null,
  },
  {
    key: 'ficha',
    title: 'Ficha Técnica Balancea',
    desc: 'Presentación y diseño de nuestra marca',
    asset: require('@/pdfs/ficha-tecnica-diet-lettuce.pdf'),
  },
];

const EQUIPO = [
  { key: 'jc', nombre: 'Villavicencio Gonzalez Juan Carlos', telefono: '+52 7294030702' },
  { key: 'ac', nombre: 'Jiménez Ocampo Amanda Carolina', telefono: '+52 7292948980' },
  { key: 'ax', nombre: 'Arzte Neri Axel', telefono: '+52 7226780112' },
  { key: 'ma', nombre: 'Lopez Villar Miguel Angel', telefono: '+52 7226165733' },
];

async function openDocument(asset: number, dialogTitle: string) {
  const file = Asset.fromModule(asset);
  await file.downloadAsync();
  if (!file.localUri) return;

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.localUri, { mimeType: 'application/pdf', dialogTitle });
  } else {
    await Linking.openURL(file.localUri);
  }
}

export default function SobreNosotrosScreen() {
  const { isDark, t } = useAppPreferences();
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);

  async function handleDocPress(key: string, asset: number, title: string) {
    if (loadingDoc) return;
    setLoadingDoc(key);
    try {
      await openDocument(asset, title);
    } finally {
      setLoadingDoc(null);
    }
  }

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

          <View style={styles.headerTopRow}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              onPress={() => router.back()}>
              <Text style={styles.backBtnText}>{t('backVolver')}</Text>
            </Pressable>

            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/images/logo-glow.png')}
                style={styles.navLogo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.title}>{t('menuNosotros')}</Text>
          <Text style={styles.subtitle}>{t('aboutSubtitle')}</Text>
        </LinearGradient>

        <View style={styles.content}>

          {/* Quienes somos, como tarjeta flotante */}
          <View style={[styles.floatingCard, isDark && darkStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>Balancea</Text>
            </View>
            <Text style={[styles.cardText, isDark && darkStyles.cardText]}>{t('aboutIntro')}</Text>
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
              {VALOR_KEYS.map((key) => (
                <View key={key} style={styles.valorChip}>
                  <Text style={styles.valorChipText}>{t(key)}</Text>
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

          {/* Meta */}
          <View style={[styles.card, isDark && darkStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                {t('metaTitle')}
              </Text>
            </View>
            <Text style={[styles.cardText, isDark && darkStyles.cardText]}>{t('metaText')}</Text>
          </View>

          {/* Que ofrecemos */}
          <View style={[styles.card, isDark && darkStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                {t('ofrecemosTitle')}
              </Text>
            </View>
            <View style={styles.offeringsList}>
              {OFFERINGS.map((o, i) => (
                <View key={i} style={styles.offeringItem}>
                  <View style={styles.offeringBullet}>
                    <Text style={styles.offeringBulletText}>{i + 1}</Text>
                  </View>
                  <View style={styles.offeringContent}>
                    <Text style={[styles.offeringTitle, isDark && darkStyles.cardTitle]}>
                      {t(o.titleKey)}
                    </Text>
                    <Text style={styles.offeringDesc}>{t(o.descKey)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Documentos importantes */}
          <View style={[styles.card, isDark && darkStyles.card]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={[styles.cardTitle, isDark && darkStyles.cardTitle]}>
                {t('documentosTitle')}
              </Text>
            </View>
            <View style={styles.docsList}>
              {DOCUMENTOS.map((doc, i) => {
                const isLoading = loadingDoc === doc.key;
                const disabled = !doc.asset || isLoading;
                return (
                  <View
                    key={doc.key}
                    style={[styles.docRow, i < DOCUMENTOS.length - 1 && styles.docRowDivider]}>
                    <View style={styles.docTextWrap}>
                      <Text style={[styles.docTitle, isDark && darkStyles.cardTitle]}>
                        {doc.title}
                      </Text>
                      <Text style={styles.docDesc}>{doc.desc}</Text>
                    </View>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#2E7D32" />
                    ) : (
                      <View style={styles.docActions}>
                        <Pressable
                          disabled={disabled}
                          onPress={() =>
                            handleDocPress(doc.key, doc.asset, `${t('docVer')} ${doc.title}`)
                          }
                          style={({ pressed }) => [
                            styles.docTag,
                            !doc.asset && styles.docTagDisabled,
                            pressed && styles.pressed,
                          ]}>
                          <Text style={[styles.docTagText, !doc.asset && styles.docTagTextDisabled]}>
                            {t('docVer')}
                          </Text>
                        </Pressable>
                        <Pressable
                          disabled={disabled}
                          onPress={() =>
                            handleDocPress(doc.key, doc.asset, `${t('docDescargar')} ${doc.title}`)
                          }
                          style={({ pressed }) => [
                            styles.docTag,
                            !doc.asset && styles.docTagDisabled,
                            pressed && styles.pressed,
                          ]}>
                          <Text style={[styles.docTagText, !doc.asset && styles.docTagTextDisabled]}>
                            {t('docDescargar')}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
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
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },

  /* Contenido */
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  floatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },

  /* Card */
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

  /* Offerings */
  offeringsList: {
    gap: 14,
  },
  offeringItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  offeringBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4EC920',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  offeringBulletText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  offeringContent: {
    flex: 1,
    gap: 3,
  },
  offeringTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2e1a',
  },
  offeringDesc: {
    fontSize: 13,
    color: '#777',
    lineHeight: 19,
  },

  /* Valores */
  valoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  valorChip: {
    backgroundColor: '#f0f9e8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  valorChipText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Documentos */
  docsList: {
    gap: 0,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 14,
  },
  docRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  docTextWrap: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2e1a',
  },
  docDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    lineHeight: 17,
  },
  docActions: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
  },
  docTag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  docTagText: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
  },
  docTagDisabled: {
    opacity: 0.5,
  },
  docTagTextDisabled: {
    color: '#aaa',
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
