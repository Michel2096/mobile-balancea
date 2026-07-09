import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  onBack?: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel: string;
  loading?: boolean;
  disabled?: boolean;
};

export function CheckoutNavButtons({ onBack, backLabel, onNext, nextLabel, loading, disabled }: Props) {
  return (
    <View style={styles.row}>
      {onBack && (
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={onBack}>
          <Text style={styles.backBtnText}>{backLabel}</Text>
        </Pressable>
      )}
      <Pressable
        style={({ pressed }) => [
          styles.nextBtn,
          onBack ? styles.nextBtnFlex : styles.nextBtnFull,
          disabled && styles.nextBtnDisabled,
          pressed && !disabled && styles.pressed,
        ]}
        disabled={disabled}
        onPress={onNext}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={[styles.nextBtnText, disabled && styles.nextBtnTextDisabled]}>{nextLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  backBtn: {
    flex: 1,
    borderRadius: 16,
    minHeight: 56,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  backBtnText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '700',
  },
  nextBtn: {
    borderRadius: 16,
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtnFlex: {
    flex: 1,
  },
  nextBtnFull: {
    width: '100%',
  },
  nextBtnDisabled: {
    backgroundColor: '#c9d6c4',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  nextBtnTextDisabled: {
    color: '#f0f0f0',
  },
});
