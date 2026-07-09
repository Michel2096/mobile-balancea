import { Image, type ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';

const ASPECT_RATIO = 1023 / 297;

const SOURCES = {
  color: require('@/img/Logo_balancea_titulo.png'),
  white: require('@/img/Logo_balancea_blanco_titulo.png'),
} as const;

type BrandLogoProps = {
  /** 'color' = dark wordmark for light backgrounds, 'white' = white wordmark for dark/green backgrounds */
  variant?: keyof typeof SOURCES;
  width?: number;
  style?: StyleProp<ImageStyle>;
};

export function BrandLogo({ variant = 'color', width = 140, style }: BrandLogoProps) {
  return (
    <Image
      source={SOURCES[variant]}
      contentFit="contain"
      style={[{ width, aspectRatio: ASPECT_RATIO }, style]}
      accessibilityLabel="Balancea"
    />
  );
}
