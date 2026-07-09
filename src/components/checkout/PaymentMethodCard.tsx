import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
  active: boolean;
  isDark: boolean;
  onSelect: () => void;
};

export function PaymentMethodCard({ icon, title, subtitle, description, active, isDark, onSelect }: Props) {
  const [hovered, setHovered] = useState(false);
  const dotScale = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(dotScale, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 9,
    }).start();
  }, [active, dotScale]);

  return (
    <Pressable
      onPress={onSelect}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.card,
        isDark && darkStyles.card,
        hovered && !active && styles.cardHover,
        hovered && !active && isDark && darkStyles.cardHover,
        active && styles.cardActive,
      ]}>
      <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
        <Ionicons name={icon} size={22} color={active ? '#ffffff' : '#2E7D32'} />
      </View>

      <View style={styles.textWrap}>
        <Text style={[styles.title, isDark && darkStyles.title]}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={[styles.radio, active && styles.radioActive]}>
        <Animated.View
          style={[styles.radioDot, { opacity: dotScale, transform: [{ scale: dotScale }] }]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e3e8dd',
    backgroundColor: '#f9faf7',
  },
  cardHover: {
    borderColor: '#b9dba0',
    backgroundColor: '#f2f8ec',
  },
  cardActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#eaf6df',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapActive: {
    backgroundColor: '#2E7D32',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioActive: {
    borderColor: '#2E7D32',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
  },
});

const darkStyles = StyleSheet.create({
  card: {
    backgroundColor: '#20261f',
    borderColor: '#2a2a2a',
  },
  cardHover: {
    borderColor: '#3a4a33',
    backgroundColor: '#232b20',
  },
  title: {
    color: '#f2f2f2',
  },
});
