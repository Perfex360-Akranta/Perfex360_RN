import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useVoiceControl } from '../../context/VoiceControlContext';
import { useFeatureToggles } from '../../context/FeatureToggleContext';

const IDLE = '#00897B'; // teal: clearly different from the blue buttons
const LIVE = '#E53935'; // red while listening

type Props = {
  inline?: boolean; // true: sits inside the form (for example in the Date row) instead of floating
};

export default function VoiceControlButton({ inline = false }: Props) {
  const { isFeatureEnabled } = useFeatureToggles();
  const voiceControlEnabled = isFeatureEnabled('voiceControl');
  const { listening, lastHeard, startListening, stopListening } = useVoiceControl();
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0)).current;

  const size = inline ? 46 : 60;
  const iconSize = inline ? 24 : 28;

  useEffect(() => {
    if (!listening) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [listening, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  const bubble = (
    <View style={styles.bubble}>
      <Text style={styles.bubbleText} numberOfLines={2}>
        {lastHeard || 'Listening…'}
      </Text>
    </View>
  );

  if (!voiceControlEnabled) {
    return null;
  }

  const button = (
    <View style={{ width: size + 4, height: size + 4, alignItems: 'center', justifyContent: 'center' }}>
      {listening && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulseRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
      )}
      <TouchableOpacity
        accessibilityLabel={listening ? 'Stop voice control' : 'Start voice control'}
        activeOpacity={0.85}
        style={[
          styles.fab,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: listening ? LIVE : IDLE,
          },
        ]}
        onPress={() => (listening ? stopListening() : startListening())}>
        <MaterialIcons name={listening ? 'stop' : 'mic'} size={iconSize} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  if (inline) {
    return (
      <View style={styles.inlineWrap}>
        {listening && (
          <View pointerEvents="none" style={[styles.inlineBubbleHolder, { bottom: size + 10 }]}>
            {bubble}
          </View>
        )}
        {button}
      </View>
    );
  }

  return (
    <View pointerEvents="box-none" style={[styles.floatWrap, { bottom: insets.bottom + 20 }]}>
      {listening && bubble}
      {button}
    </View>
  );
}

const styles = StyleSheet.create({
  floatWrap: {
    position: 'absolute',
    right: 18,
    alignItems: 'flex-end',
  },
  inlineWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineBubbleHolder: {
    position: 'absolute',
    right: 0,
    width: 220,
    alignItems: 'flex-end',
    zIndex: 20,
    elevation: 12,
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: LIVE,
  },
  fab: {
    borderWidth: 3,
    borderColor: '#FFFFFF', // white ring keeps it separate from anything around it
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  bubble: {
    maxWidth: 220,
    backgroundColor: 'rgba(20, 20, 30, 0.88)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 8,
  },
  bubbleText: {
    color: '#fff',
    fontSize: 13,
  },
});