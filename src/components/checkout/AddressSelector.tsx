import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Direccion } from '@/services/api';
import { AddressCard } from './AddressCard';

type Props = {
  direccion: Direccion;
  active: boolean;
  isDark: boolean;
  t: (key: string) => string;
  onSelect: () => void;
};

export function AddressSelector({ direccion, active, isDark, t, onSelect }: Props) {
  const [hovered, setHovered] = useState(false);

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
      <AddressCard direccion={direccion} isDark={isDark} t={t} />
      <View style={[styles.radio, active && styles.radioActive]}>
        {active && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 14,
    padding: 14,
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
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
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
});
