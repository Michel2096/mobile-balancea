import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type SummaryRow = {
  key: string;
  label: string;
  value: string;
  emphasis?: 'free';
};

type AddressLine = {
  label: string;
  value: string;
};

type Props = {
  title: string;
  rows: SummaryRow[];
  addressLine?: AddressLine;
  totalLabel: string;
  totalValue: string;
  isDark: boolean;
  footer?: ReactNode;
};

export function OrderSummaryCard({ title, rows, addressLine, totalLabel, totalValue, isDark, footer }: Props) {
  return (
    <View style={[styles.card, isDark && darkStyles.card]}>
      <Text style={[styles.title, isDark && darkStyles.title]}>{title}</Text>

      {rows.map((row) => (
        <View key={row.key} style={styles.row}>
          <Text style={[styles.label, isDark && darkStyles.label]}>{row.label}</Text>
          <Text style={[styles.value, isDark && darkStyles.value, row.emphasis === 'free' && styles.valueFree]}>
            {row.value}
          </Text>
        </View>
      ))}

      {addressLine && (
        <View style={[styles.addressBlock, isDark && darkStyles.addressBlock]}>
          <View style={styles.addressBlockHeader}>
            <Ionicons name="location-outline" size={13} color="#2E7D32" />
            <Text style={styles.addressBlockLabel}>{addressLine.label}</Text>
          </View>
          <Text style={[styles.addressBlockValue, isDark && darkStyles.value]}>{addressLine.value}</Text>
        </View>
      )}

      <View style={[styles.totalRow, isDark && darkStyles.totalRow]}>
        <Text style={[styles.totalLabel, isDark && darkStyles.title]}>{totalLabel}</Text>
        <Text style={styles.totalValue}>{totalValue}</Text>
      </View>

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    color: '#1a2e1a',
    fontSize: 17,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: '#1a2e1a',
    fontSize: 14,
    fontWeight: '700',
  },
  valueFree: {
    color: '#2E7D32',
  },
  addressBlock: {
    backgroundColor: '#f7f9f5',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e3e8dd',
  },
  addressBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressBlockLabel: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressBlockValue: {
    color: '#333',
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1FAEA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  totalLabel: {
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    color: '#1B5E20',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});

const darkStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderColor: '#2a2a2a',
  },
  title: {
    color: '#f2f2f2',
  },
  label: {
    color: '#aaa',
  },
  value: {
    color: '#f2f2f2',
  },
  addressBlock: {
    backgroundColor: '#20261f',
    borderColor: '#2a2a2a',
  },
  totalRow: {
    backgroundColor: '#16241a',
  },
});
