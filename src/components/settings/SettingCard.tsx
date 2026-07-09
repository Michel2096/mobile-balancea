import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg?: string;
  iconColor?: string;
  title: string;
  description?: string;
  onPress?: () => void;
  isDark: boolean;
  children?: ReactNode;
};

export function SettingCard({
  icon,
  iconBg = '#E8F5E9',
  iconColor = '#2E7D32',
  title,
  description,
  onPress,
  isDark,
  children,
}: Props) {
  return (
    <View style={[styles.card, isDark && darkStyles.card]}>
      {onPress ? (
        <Pressable
          style={({ pressed }) => [styles.headerRow, pressed && styles.pressed]}
          onPress={onPress}>
          <View style={[styles.iconBubble, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={21} color={iconColor} />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.title, isDark && darkStyles.title]}>{title}</Text>
            {!!description && (
              <Text style={[styles.description, isDark && darkStyles.description]}>
                {description}
              </Text>
            )}
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ) : (
        <View style={styles.headerRow}>
          <View style={[styles.iconBubble, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={21} color={iconColor} />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.title, isDark && darkStyles.title]}>{title}</Text>
            {!!description && (
              <Text style={[styles.description, isDark && darkStyles.description]}>
                {description}
              </Text>
            )}
          </View>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#ebebeb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#1a2e1a',
    fontSize: 15.5,
    fontWeight: '800',
  },
  description: {
    color: '#8a8a8a',
    fontSize: 12.5,
    marginTop: 2,
  },
  chevron: {
    color: '#c4c4c4',
    fontSize: 22,
    fontWeight: '700',
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
  description: {
    color: '#9a9a9a',
  },
});
