import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SobreNosotrosScreen() {
  return (
    <ImageBackground
      source={require('../../assets/Fondo.png')}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>

          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>

          <Image
            source={require('../../assets/images/logo-glow.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.pageTitle}>Sobre Nosotros</Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Nuestra Misión</Text>
            <View style={styles.divider} />
            <Text style={styles.text}>
              En Balancea creemos que el bienestar es un equilibrio entre la mente, el cuerpo y los
              hábitos cotidianos. Nuestra misión es proporcionar una herramienta accesible y motivadora
              que acompañe a las personas en su camino hacia una vida más saludable.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Quiénes Somos</Text>
            <View style={styles.divider} />
            <Text style={styles.text}>
              Somos un equipo apasionado por la tecnología y el bienestar humano. Combinamos
              experiencia en desarrollo de software con conocimientos en salud y nutrición para
              crear una aplicación que realmente marque la diferencia en tu día a día.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>¿Qué Ofrecemos?</Text>
            <View style={styles.divider} />

            <View style={styles.offerItem}>
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>Seguimiento personalizado</Text>
                <Text style={styles.offerDesc}>Registra y analiza tus habitos diarios de manera sencilla.</Text>
              </View>
            </View>

            <View style={styles.offerItem}>
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>Progreso visible</Text>
                <Text style={styles.offerDesc}>Visualiza tu avance con estadisticas claras y motivadoras.</Text>
              </View>
            </View>

            <View style={styles.offerItem}>
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>Comunidad de apoyo</Text>
                <Text style={styles.offerDesc}>Conecta con personas que comparten tus mismas metas.</Text>
              </View>
            </View>

            <View style={styles.offerItem}>
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>Privacidad garantizada</Text>
                <Text style={styles.offerDesc}>Tu informacion siempre segura y bajo tu control.</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contáctanos</Text>
            <View style={styles.divider} />
            <Text style={styles.text}>
              ¿Tienes preguntas, sugerencias o comentarios? Nos encantaría escucharte.
            </Text>
            <Text style={styles.contactEmail}>soporte@balancea.app</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
            onPress={() => router.push('/login')}>
            <Text style={styles.loginButtonText}>Ir al Login</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  backButtonText: {
    color: '#4EC920',
    fontSize: 15,
    fontWeight: '600',
  },
  logo: {
    width: 80,
    height: 80,
    marginTop: 4,
  },
  pageTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(20, 32, 20, 0.88)',
    borderRadius: 18,
    padding: 20,
    gap: 12,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: 'rgba(78, 201, 32, 0.2)',
  },
  sectionTitle: {
    color: '#4EC920',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  text: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 22,
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  offerIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  offerContent: {
    flex: 1,
    gap: 2,
  },
  offerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  offerDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 19,
  },
  contactEmail: {
    color: '#4EC920',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#4EC920',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
    marginTop: 4,
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
