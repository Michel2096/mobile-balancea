import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  isDark: boolean;
  onToggle: () => void;
  lightLabel: string;
  darkLabel: string;
};

export function ThemeSwitcher({ isDark, onToggle, lightLabel, darkLabel }: Props) {
  const [width, setWidth] = useState(0);
  const anim = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [isDark, anim]);

  function handleLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const half = width / 2;
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, half] });

  return (
    <View style={[styles.track, isDark && darkStyles.track]} onLayout={handleLayout}>
      {width > 0 && (
        <Animated.View
          style={[styles.indicator, { width: half, transform: [{ translateX }] }]}
        />
      )}
      <Pressable style={styles.segment} onPress={() => isDark && onToggle()}>
        <Ionicons
          name="sunny-outline"
          size={15}
          color={!isDark ? '#ffffff' : '#888'}
          style={styles.segmentIcon}
        />
        <Text style={[styles.segmentText, !isDark && styles.segmentTextActive]}>{lightLabel}</Text>
      </Pressable>
      <Pressable style={styles.segment} onPress={() => !isDark && onToggle()}>
        <Ionicons
          name="moon-outline"
          size={15}
          color={isDark ? '#ffffff' : '#888'}
          style={styles.segmentIcon}
        />
        <Text style={[styles.segmentText, isDark && styles.segmentTextActive]}>{darkLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 1,
  },
  segmentIcon: {
    marginTop: -1,
  },
  segmentText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
});

const darkStyles = StyleSheet.create({
  track: {
    backgroundColor: '#2a2a2a',
  },
});
