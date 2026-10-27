import React, { useEffect, useRef } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

const ACCENT = '#1976D2';
const ACCENT_RGB = '25, 118, 210';

type Props = {
  active: boolean; 
  enabled?: boolean; 
  badge?: string; 
  children: React.ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
};

export default function FocusHighlight({
  active,
  enabled = false,
  badge,
  children,
  onLayout,
}: Props) {
  const appear = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: active ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [active, appear]);

  useEffect(() => {
    if (!active) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  if (!enabled) {
    return <View onLayout={onLayout}>{children}</View>;
  }

  const borderColor = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [`rgba(${ACCENT_RGB}, 0)`, `rgba(${ACCENT_RGB}, 1)`],
  });
  const backgroundColor = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [`rgba(${ACCENT_RGB}, 0)`, `rgba(${ACCENT_RGB}, 0.07)`],
  });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.35] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });

  return (
    <Animated.View onLayout={onLayout} style={[styles.shell, { borderColor, backgroundColor }]}>
      {active && (
        <Animated.View
          pointerEvents="none"
          style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
        />
      )}
      {active && <View pointerEvents="none" style={styles.bar} />}

      {children}

      {active && !!badge && (
        <View pointerEvents="none" style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
    borderWidth: 2,
    borderRadius: 14,
  },
  glow: {
    position: 'absolute',
    top: -7,
    left: -7,
    right: -7,
    bottom: -7,
    borderWidth: 5,
    borderRadius: 19,
    borderColor: ACCENT,
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 4,
    borderRadius: 2,
    backgroundColor: ACCENT,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 14,
    backgroundColor: ACCENT,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    elevation: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});