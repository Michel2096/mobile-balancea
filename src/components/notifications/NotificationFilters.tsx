import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type FilterOption<T extends string = string> = {
  value: T;
  label: string;
};

type Props = {
  isDark: boolean;
  sectionLabels: { tipo: string; estado: string; fecha: string };
  tipoOptions: FilterOption[];
  tipoValue: string;
  onTipoChange: (value: string) => void;
  estadoOptions: FilterOption[];
  estadoValue: string;
  onEstadoChange: (value: string) => void;
  fechaOptions: FilterOption[];
  fechaValue: string;
  onFechaChange: (value: string) => void;
  soloPedidos: boolean;
  onSoloPedidosChange: (value: boolean) => void;
  soloPedidosLabel: string;
};

function Chip({
  label,
  active,
  isDark,
  onPress,
}: {
  label: string;
  active: boolean;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        isDark && darkStyles.chip,
        active && styles.chipActive,
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      <Text style={[styles.chipText, isDark && darkStyles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function NotificationFilters({
  isDark,
  sectionLabels,
  tipoOptions,
  tipoValue,
  onTipoChange,
  estadoOptions,
  estadoValue,
  onEstadoChange,
  fechaOptions,
  fechaValue,
  onFechaChange,
  soloPedidos,
  onSoloPedidosChange,
  soloPedidosLabel,
}: Props) {
  return (
    <View style={[styles.card, isDark && darkStyles.card]}>
      <View style={styles.group}>
        <Text style={[styles.groupLabel, isDark && darkStyles.groupLabel]}>{sectionLabels.tipo}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {tipoOptions.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={tipoValue === opt.value}
              isDark={isDark}
              onPress={() => onTipoChange(opt.value)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.group}>
        <Text style={[styles.groupLabel, isDark && darkStyles.groupLabel]}>{sectionLabels.estado}</Text>
        <View style={styles.chipsRow}>
          {estadoOptions.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={estadoValue === opt.value}
              isDark={isDark}
              onPress={() => onEstadoChange(opt.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={[styles.groupLabel, isDark && darkStyles.groupLabel]}>{sectionLabels.fecha}</Text>
        <View style={styles.chipsRow}>
          {fechaOptions.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={fechaValue === opt.value}
              isDark={isDark}
              onPress={() => onFechaChange(opt.value)}
            />
          ))}
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.pedidosToggle,
          isDark && darkStyles.chip,
          soloPedidos && styles.chipActive,
          pressed && styles.pressed,
        ]}
        onPress={() => onSoloPedidosChange(!soloPedidos)}>
        <View style={[styles.checkbox, soloPedidos && styles.checkboxActive]}>
          {soloPedidos && <Ionicons name="checkmark" size={11} color="#ffffff" />}
        </View>
        <Text
          style={[styles.chipText, isDark && darkStyles.chipText, soloPedidos && styles.chipTextActive]}>
          {soloPedidosLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ededed',
  },
  chipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  chipText: {
    color: '#666',
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
  },
  pedidosToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ededed',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

const darkStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderColor: '#2a2a2a',
  },
  groupLabel: {
    color: '#7fc95f',
  },
  chip: {
    backgroundColor: '#262626',
    borderColor: '#333',
  },
  chipText: {
    color: '#bbb',
  },
});
