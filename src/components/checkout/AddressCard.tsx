import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Direccion } from '@/services/api';

export const ADDRESS_TYPE_OPTIONS = [
  { value: 'casa', labelKey: 'tipoCasa', icon: 'home-outline' as const },
  { value: 'oficina', labelKey: 'tipoOficina', icon: 'business-outline' as const },
  { value: 'otro', labelKey: 'tipoOtro', icon: 'location-outline' as const },
];

export function addressTypeInfo(tipo: string | undefined) {
  return ADDRESS_TYPE_OPTIONS.find((opt) => opt.value === tipo) ?? ADDRESS_TYPE_OPTIONS[2];
}

type Props = {
  direccion: Direccion;
  isDark: boolean;
  t: (key: string) => string;
};

export function AddressCard({ direccion, isDark, t }: Props) {
  const tipoInfo = addressTypeInfo(direccion.tipo);

  return (
    <View style={styles.body}>
      <View style={styles.headerRow}>
        <View style={styles.typeBadge}>
          <Ionicons name={tipoInfo.icon} size={12} color="#2E7D32" />
          <Text style={styles.typeBadgeText}>{t(tipoInfo.labelKey)}</Text>
        </View>
        {direccion.predeterminada && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>{t('direccionPredeterminada')}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.street, isDark && darkStyles.street]}>
        {direccion.calle} {direccion.numero_exterior}
        {direccion.numero_interior ? ` Int. ${direccion.numero_interior}` : ''}
      </Text>
      <Text style={[styles.subtext, isDark && darkStyles.subtext]}>
        {direccion.colonia}, {direccion.ciudad}, {direccion.estado}
      </Text>
      <Text style={[styles.subtext, isDark && darkStyles.subtext]}>
        {t('codigoPostalLabel')}: {direccion.codigo_postal}
      </Text>
      {!!direccion.referencias && (
        <Text style={[styles.referencias, isDark && darkStyles.referencias]} numberOfLines={2}>
          {t('referenciasLabel')}: {direccion.referencias}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
  },
  defaultBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultBadgeText: {
    color: '#E8622C',
    fontSize: 10,
    fontWeight: '700',
  },
  street: {
    color: '#1a2e1a',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  subtext: {
    color: '#666',
    fontSize: 12,
    lineHeight: 16,
  },
  referencias: {
    color: '#888',
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
    fontStyle: 'italic',
  },
});

const darkStyles = StyleSheet.create({
  street: {
    color: '#ddd',
  },
  subtext: {
    color: '#aaa',
  },
  referencias: {
    color: '#888',
  },
});
