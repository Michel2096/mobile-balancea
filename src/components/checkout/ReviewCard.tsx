import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  isDark: boolean;
  children: ReactNode;
};

export function ReviewCard({ icon, title, isDark, children }: Props) {
  return (
    <View style={[styles.card, isDark && darkStyles.card]}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={17} color="#2E7D32" />
        </View>
        <Text style={[styles.title, isDark && darkStyles.title]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#1a2e1a',
    fontSize: 15,
    fontWeight: '800',
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
});
