import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Language } from '@/i18n/translations';

type Props = {
  language: Language;
  onToggle: () => void;
  isDark: boolean;
};

export function LanguageSwitcher({ language, onToggle, isDark }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[
          styles.chip,
          isDark && darkStyles.chip,
          language === 'es' && styles.chipActive,
        ]}
        onPress={() => language !== 'es' && onToggle()}>
        {language === 'es' && <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />}
        <Text style={[styles.chipText, isDark && darkStyles.chipText, language === 'es' && styles.chipTextActive]}>
          Español
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.chip,
          isDark && darkStyles.chip,
          language === 'en' && styles.chipActive,
        ]}
        onPress={() => language !== 'en' && onToggle()}>
        {language === 'en' && <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />}
        <Text style={[styles.chipText, isDark && darkStyles.chipText, language === 'en' && styles.chipTextActive]}>
          English
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    backgroundColor: '#f7f9f5',
  },
  chipActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#eaf6df',
  },
  chipText: {
    color: '#777',
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#2E7D32',
  },
});

const darkStyles = StyleSheet.create({
  chip: {
    backgroundColor: '#262626',
    borderColor: '#3a3a3a',
  },
  chipText: {
    color: '#bbb',
  },
});
