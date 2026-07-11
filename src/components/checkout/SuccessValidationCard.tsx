import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  description: string;
  isDark: boolean;
};

export function SuccessValidationCard({ title, description, isDark }: Props) {
  return (
    <View style={[styles.card, isDark && darkStyles.card]}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={26} color="#2E7D32" />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, isDark && darkStyles.title]}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F1FAEA',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d4edbc',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#1B5E20',
    fontSize: 15,
    fontWeight: '800',
  },
  description: {
    color: '#3f6b3f',
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '500',
  },
});

const darkStyles = StyleSheet.create({
  card: {
    backgroundColor: '#16241a',
    borderColor: '#2a3a28',
  },
  title: {
    color: '#7ed957',
  },
});
