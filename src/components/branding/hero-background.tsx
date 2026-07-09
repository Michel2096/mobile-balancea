import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Fondo-balancea-2.png is a clean produce photo with no branding baked in, so it
// composites safely under the app's own logo at any width. (Fondo-balancea.png has
// a glowing wordmark baked into the photo itself and is used as standalone decorative
// art elsewhere instead of behind live UI, where it would visually duplicate the logo.)
const BACKGROUND = require('@/img/Fondo-balancea-2.png');

const DEFAULT_OVERLAY: [string, string] = ['rgba(46,125,50,0.88)', 'rgba(27,94,32,0.93)'];

type HeroBackgroundProps = {
  children?: ReactNode;
  overlayColors?: [string, string];
  style?: StyleProp<ViewStyle>;
};

export function HeroBackground({ children, overlayColors, style }: HeroBackgroundProps) {
  return (
    <View style={[styles.wrap, style]}>
      <Image source={BACKGROUND} contentFit="cover" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={overlayColors ?? DEFAULT_OVERLAY}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
