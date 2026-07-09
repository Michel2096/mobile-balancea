import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  codigo: string;
  isDark: boolean;
  t: (key: string) => string;
};

export function PaymentSuccessBanner({ codigo, isDark, t }: Props) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 60,
    }).start();
  }, [scale]);

  return (
    <View style={[styles.card, isDark && darkStyles.card]}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
        <Ionicons name="checkmark-circle" size={60} color="#4EC920" />
      </Animated.View>

      <Text style={[styles.title, isDark && darkStyles.title]}>{t('pedidoExitosoTitle')}</Text>
      <Text style={styles.subtitle}>{t('pedidoExitosoSubtitle')}</Text>

      <View style={[styles.secureBadge, isDark && darkStyles.secureBadge]}>
        <Ionicons name="shield-checkmark-outline" size={14} color="#2E7D32" />
        <Text style={styles.secureBadgeText}>{t('pagoAseguradoLabel')}</Text>
      </View>

      <View style={[styles.codeChip, isDark && darkStyles.codeChip]}>
        <Text style={[styles.codeChipLabel, isDark && darkStyles.codeChipLabel]}>
          {t('numeroPedidoLabel')}
        </Text>
        <Text style={styles.codeChipValue}>#{codigo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  iconWrap: {
    marginBottom: 4,
  },
  title: {
    color: '#1a2e1a',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  secureBadgeText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f7f9f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e3e8dd',
  },
  codeChipLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  codeChipValue: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '800',
  },
});

const darkStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
  },
  title: {
    color: '#f2f2f2',
  },
  secureBadge: {
    backgroundColor: '#1c2a19',
  },
  codeChip: {
    backgroundColor: '#20261f',
    borderColor: '#2a2a2a',
  },
  codeChipLabel: {
    color: '#aaa',
  },
});
