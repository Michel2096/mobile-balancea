import { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { refreshUnreadCount, useUnreadCount } from '@/services/notifications';
import { NotificationBadge } from './NotificationBadge';

function BellIcon() {
  return (
    <View style={styles.bellWrap}>
      <View style={styles.bellTopKnob} />
      <View style={styles.bellBody} />
      <View style={styles.bellClapper} />
    </View>
  );
}

export function NotificationButton() {
  const unreadCount = useUnreadCount();
  const pulse = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount();
    }, [])
  );

  useEffect(() => {
    if (unreadCount <= 0) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 480, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.delay(1600),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [unreadCount, pulse]);

  return (
    <Pressable
      onPress={() => router.push('/notificaciones')}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      hitSlop={10}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <BellIcon />
      </Animated.View>
      <NotificationBadge count={unreadCount} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  bellWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
  },
  bellTopKnob: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginBottom: 1,
  },
  bellBody: {
    width: 18,
    height: 15,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  bellClapper: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginTop: 1,
  },
});
