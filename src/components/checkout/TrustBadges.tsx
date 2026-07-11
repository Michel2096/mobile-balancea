import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Badge = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

type Props = {
  badges: Badge[];
  isDark: boolean;
};

export function TrustBadges({ badges, isDark }: Props) {
  return (
    <View style={styles.wrap}>
      {badges.map((badge) => (
        <View key={badge.title} style={[styles.card, isDark && darkStyles.card]}>
          <View style={styles.iconWrap}>
            <Ionicons name={badge.icon} size={18} color="#2E7D32" />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.title, isDark && darkStyles.title]}>{badge.title}</Text>
            <Text style={styles.description}>{badge.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 1,
  },
  title: {
    color: '#1a2e1a',
    fontSize: 13.5,
    fontWeight: '700',
  },
  description: {
    color: '#888',
    fontSize: 11.5,
    lineHeight: 15,
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
