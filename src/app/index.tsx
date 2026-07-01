import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function LandingScreen() {
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

          <Image
            source={require('../../assets/images/logo-glow.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.brand}>Balancea</Text>
          <Text style={styles.tagline}>Tu equilibrio, tu bienestar</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bienvenido a Balancea</Text>
            <View style={styles.divider} />

            <Text style={styles.description}>
              Balancea es una aplicación diseñada para ayudarte a mantener un estilo de vida saludable
              y equilibrado. Registra tus hábitos, monitorea tu progreso y alcanza tus metas de
              bienestar físico y mental.
            </Text>

            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Text style={styles.featureText}>Seguimiento de habitos diarios</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureText}>Metas personalizadas de bienestar</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureText}>Balance fisico y mental</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.loginHint}>
              Para acceder a todas las funciones, inicia sesión con tu cuenta.
            </Text>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={() => router.push('/login')}>
              <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={() => router.push('/sobre-nosotros')}>
              <Text style={styles.secondaryButtonText}>Sobre Nosotros</Text>
            </Pressable>
          </View>

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
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 12,
  },
  brand: {
    color: '#4EC920',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontStyle: 'italic',
    marginBottom: 28,
  },
  card: {
    backgroundColor: 'rgba(20, 32, 20, 0.88)',
    borderRadius: 20,
    padding: 24,
    gap: 14,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: 'rgba(78, 201, 32, 0.25)',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 10,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(78, 201, 32, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  loginHint: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  primaryButton: {
    backgroundColor: '#4EC920',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(78, 201, 32, 0.6)',
  },
  secondaryButtonText: {
    color: '#4EC920',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
