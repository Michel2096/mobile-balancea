import { StyleSheet, Text, View } from 'react-native';

type Props = {
  total: number;
  noLeidas: number;
  leidas: number;
  ultimaActividad: string | null;
  isDark: boolean;
  labels: {
    total: string;
    noLeidas: string;
    leidas: string;
    ultimaActividad: string;
    sinActividad: string;
  };
};

export function NotificationStats({ total, noLeidas, leidas, ultimaActividad, isDark, labels }: Props) {
  const tiles = [
    { key: 'total', value: String(total), label: labels.total, accent: false },
    { key: 'noLeidas', value: String(noLeidas), label: labels.noLeidas, accent: true },
    { key: 'leidas', value: String(leidas), label: labels.leidas, accent: false },
    { key: 'ultima', value: ultimaActividad ?? labels.sinActividad, label: labels.ultimaActividad, accent: false, small: true },
  ];

  return (
    <View style={styles.grid}>
      {tiles.map((tile) => (
        <View
          key={tile.key}
          style={[
            styles.tile,
            isDark && darkStyles.tile,
            tile.accent && styles.tileAccent,
          ]}>
          <Text
            numberOfLines={1}
            style={[
              styles.value,
              isDark && darkStyles.value,
              tile.accent && styles.valueAccent,
              tile.small && styles.valueSmall,
            ]}>
            {tile.value}
          </Text>
          <Text style={[styles.label, tile.accent && styles.labelAccent]}>{tile.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  tileAccent: {
    backgroundColor: '#4EC920',
    borderColor: '#4EC920',
  },
  value: {
    color: '#1a2e1a',
    fontSize: 22,
    fontWeight: '800',
  },
  valueSmall: {
    fontSize: 14,
  },
  valueAccent: {
    color: '#ffffff',
  },
  label: {
    color: '#888',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  labelAccent: {
    color: 'rgba(255,255,255,0.9)',
  },
});

const darkStyles = StyleSheet.create({
  tile: {
    backgroundColor: '#1e1e1e',
    borderColor: '#2a2a2a',
  },
  value: {
    color: '#f2f2f2',
  },
});
