import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  currentStep: number;
  labels: string[];
};

export function CheckoutStepper({ currentStep, labels }: Props) {
  const fillPct = labels.length > 1 ? ((currentStep - 1) / (labels.length - 1)) * 100 : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={styles.baseLine} />
        <View style={[styles.fillLine, { width: `${fillPct}%` }]} />
        <View style={styles.circlesRow}>
          {labels.map((_, idx) => {
            const n = idx + 1;
            const done = currentStep > n;
            const active = currentStep === n;
            return (
              <View key={n} style={[styles.circle, (done || active) && styles.circleActive]}>
                {done ? (
                  <Ionicons name="checkmark" size={14} color="#1B5E20" />
                ) : (
                  <Text style={[styles.circleText, active && styles.circleTextActive]}>{n}</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.labelsRow}>
        {labels.map((label, idx) => (
          <Text
            key={label}
            style={[styles.label, currentStep === idx + 1 && styles.labelActive]}
            numberOfLines={1}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginTop: 22,
  },
  track: {
    height: 28,
    justifyContent: 'center',
  },
  baseLine: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  fillLine: {
    position: 'absolute',
    left: 14,
    height: 2,
    backgroundColor: '#ffffff',
  },
  circlesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: '#ffffff',
  },
  circleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  circleTextActive: {
    color: '#1B5E20',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  label: {
    flex: 1,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
