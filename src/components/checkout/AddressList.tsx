import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Direccion } from '@/services/api';
import { AddressSelector } from './AddressSelector';

type Props = {
  direcciones: Direccion[];
  selectedId: number | string | null;
  onSelect: (id: number | string) => void;
  onAddPress: () => void;
  isDark: boolean;
  t: (key: string) => string;
};

export function AddressList({ direcciones, selectedId, onSelect, onAddPress, isDark, t }: Props) {
  const [addHovered, setAddHovered] = useState(false);

  const addButton = (
    <Pressable
      onPress={onAddPress}
      onHoverIn={() => setAddHovered(true)}
      onHoverOut={() => setAddHovered(false)}
      style={[styles.addBtn, isDark && darkStyles.addBtn, addHovered && styles.addBtnHover]}>
      <Ionicons name="add-circle-outline" size={18} color="#2E7D32" />
      <Text style={styles.addBtnText}>{t('agregarNuevaDireccionBtn')}</Text>
    </Pressable>
  );

  if (direcciones.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <View style={[styles.emptyIconWrap, isDark && darkStyles.emptyIconWrap]}>
          <Ionicons name="location-outline" size={26} color="#4EC920" />
        </View>
        <Text style={[styles.emptyTitle, isDark && darkStyles.title]}>{t('direccionesEmptyTitle')}</Text>
        <Text style={styles.emptyDesc}>{t('direccionesEmptyDesc')}</Text>
        {addButton}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, isDark && darkStyles.title]}>{t('misDireccionesLabel')}</Text>

      <View style={styles.list}>
        {direcciones.map((d) => (
          <AddressSelector
            key={d.id}
            direccion={d}
            active={selectedId === d.id}
            isDark={isDark}
            t={t}
            onSelect={() => onSelect(d.id)}
          />
        ))}
      </View>

      {addButton}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  title: {
    color: '#1a2e1a',
    fontSize: 16,
    fontWeight: '800',
  },
  list: {
    gap: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#d4edbc',
    backgroundColor: '#f0f9e8',
  },
  addBtnHover: {
    backgroundColor: '#e5f5d8',
    borderColor: '#b9dba0',
  },
  addBtnText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1FAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDesc: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
    maxWidth: 280,
  },
});

const darkStyles = StyleSheet.create({
  title: {
    color: '#f2f2f2',
  },
  addBtn: {
    backgroundColor: '#1c2a19',
    borderColor: '#2f4a26',
  },
  emptyIconWrap: {
    backgroundColor: '#1c2a19',
  },
});
