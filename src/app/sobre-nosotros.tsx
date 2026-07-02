import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const OFFERINGS = [
  {
    title: 'Seguimiento personalizado',
    desc: 'Registra y analiza tus habitos diarios de manera sencilla.',
  },
  {
    title: 'Progreso visible',
    desc: 'Visualiza tu avance con estadisticas claras y motivadoras.',
  },
  {
    title: 'Comunidad de apoyo',
    desc: 'Conecta con personas que comparten tus mismas metas.',
  },
  {
    title: 'Privacidad garantizada',
    desc: 'Tu informacion siempre segura y bajo tu control.',
  },
];

export default function SobreNosotrosScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollOuter}
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
              <Text style={styles.backBtnText}>← Volver</Text>
            </Pressable>

            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/images/logo-glow.png')}
                style={styles.navLogo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.title}>Sobre Nosotros</Text>
          <Text style={styles.subtitle}>Conoce el equipo y la visión detrás de Balancea.</Text>
        </LinearGradient>

        <View style={styles.content}>

          {/* Mision, como tarjeta flotante */}
          <View style={styles.floatingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={styles.cardTitle}>Nuestra Misión</Text>
            </View>
            <Text style={styles.cardText}>
              En Balancea creemos que el bienestar es un equilibrio entre la mente, el cuerpo
              y los habitos cotidianos. Nuestra mision es proporcionar una herramienta accesible
              y motivadora que acompane a las personas en su camino hacia una vida mas saludable.
            </Text>
          </View>

          {/* Quienes somos */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={styles.cardTitle}>Quienes Somos</Text>
            </View>
            <Text style={styles.cardText}>
              Somos un equipo apasionado por la tecnologia y el bienestar humano. Combinamos
              experiencia en desarrollo de software con conocimientos en salud y nutricion para
              crear una aplicacion que realmente marque la diferencia en tu dia a dia.
            </Text>
          </View>

          {/* Que ofrecemos */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardAccentBar} />
              <Text style={styles.cardTitle}>Que Ofrecemos</Text>
            </View>
            <View style={styles.offeringsList}>
              {OFFERINGS.map((o, i) => (
                <View key={i} style={styles.offeringItem}>
                  <View style={styles.offeringBullet}>
                    <Text style={styles.offeringBulletText}>{i + 1}</Text>
                  </View>
                  <View style={styles.offeringContent}>
                    <Text style={styles.offeringTitle}>{o.title}</Text>
                    <Text style={styles.offeringDesc}>{o.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Contacto */}
          <View style={[styles.card, styles.contactCard]}>
            <Text style={styles.contactLabel}>Contactanos</Text>
            <Text style={styles.contactPrompt}>
              Tienes preguntas, sugerencias o comentarios? Nos encantaria escucharte.
            </Text>
            <View style={styles.emailPill}>
              <Text style={styles.emailText}>soporte@balancea.app</Text>
            </View>
          </View>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && styles.pressed]}
            onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>Ir al Login</Text>
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
