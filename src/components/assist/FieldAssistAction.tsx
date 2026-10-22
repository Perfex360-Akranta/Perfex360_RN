import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ActiveField, useFieldAssist } from '../../context/FieldAssistContext';

type Props = {
  field: ActiveField;
  style?: ViewStyle;
};

export default function FieldAssistAction({ field, style }: Props) {
  const {
    activeField,
    listening,
    busy,
    preview,
    openMenuFieldId,
    successFieldId,
    openFieldMenu,
    closeFieldMenu,
    toggleFieldMenu,
    startListeningForField,
    stopListening,
    captureImageForField,
  } = useFieldAssist();

  const isCurrentField = activeField?.id === field.id;
  const isMenuOpen = openMenuFieldId === field.id;
  const isListening = isCurrentField && listening;
  const isBusy = isCurrentField && busy !== null;
  const isSuccess = successFieldId === field.id;

  // Pulsing animation for red mic during listening
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isListening) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  // Spring animation for horizontal icon menu opening
  const menuAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isMenuOpen) {
      Animated.spring(menuAnim, {
        toValue: 1,
        friction: 6,
        tension: 90,
        useNativeDriver: true,
      }).start();
    } else {
      menuAnim.setValue(0);
    }
  }, [isMenuOpen, menuAnim]);

  const handleToggleMenu = () => {
    if (isListening) {
      stopListening();
      return;
    }
    toggleFieldMenu(field.id);
  };

  const handleSpeak = () => {
    startListeningForField(field);
  };

  const handleScan = () => {
    captureImageForField(field, 'camera');
  };

  const handleUpload = () => {
    captureImageForField(field, 'library');
  };

  return (
    <View style={[styles.container, style]}>
      {isMenuOpen ? (
        <Animated.View
          style={[
            styles.horizontalBar,
            {
              opacity: menuAnim,
              transform: [
                {
                  scale: menuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}>
          {/* Speak / Mic icon */}
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={handleSpeak}
            activeOpacity={0.65}
            accessibilityRole="button"
            accessibilityLabel="Speak to input">
            <MaterialIcons name="mic" size={17} color="#0054A6" />
          </TouchableOpacity>

          {/* Scan / Camera icon */}
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={handleScan}
            activeOpacity={0.65}
            accessibilityRole="button"
            accessibilityLabel="Scan text with camera">
            <MaterialIcons name="photo-camera" size={16} color="#0054A6" />
          </TouchableOpacity>

          {/* Upload / Gallery icon */}
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={handleUpload}
            activeOpacity={0.65}
            accessibilityRole="button"
            accessibilityLabel="Upload image to extract text">
            <MaterialIcons name="photo-library" size={16} color="#0054A6" />
          </TouchableOpacity>

          {/* Close icon */}
          <TouchableOpacity
            style={[styles.actionIconBtn, styles.closeIconBtn]}
            onPress={closeFieldMenu}
            activeOpacity={0.65}
            accessibilityRole="button"
            accessibilityLabel="Close options">
            <MaterialIcons name="close" size={14} color="#64748B" />
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <TouchableOpacity
          style={[
            styles.plusBtn,
            isListening && styles.listeningBtn,
            isSuccess && styles.successBtn,
            isBusy && styles.busyBtn,
          ]}
          onPress={handleToggleMenu}
          disabled={isBusy}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            isListening
              ? 'Listening - Tap to stop'
              : isBusy
              ? 'Processing'
              : isSuccess
              ? 'Completed'
              : 'Add input via voice, scan or upload'
          }>
          {isBusy ? (
            <ActivityIndicator size="small" color="#0054A6" />
          ) : isSuccess ? (
            <MaterialIcons name="check" size={16} color="#ffffff" />
          ) : isListening ? (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <MaterialIcons name="mic" size={16} color="#ffffff" />
            </Animated.View>
          ) : (
            <MaterialIcons name="add" size={18} color="#0054A6" />
          )}
        </TouchableOpacity>
      )}

      {/* Subtle speech feedback bubble when listening */}
      {isListening && preview ? (
        <View style={styles.listeningBadge}>
          <Text style={styles.listeningBadgeText} numberOfLines={1}>
            {preview}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plusBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EBF3FB',
    borderWidth: 1,
    borderColor: '#C7DCF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningBtn: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  busyBtn: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  successBtn: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
  },
  horizontalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  actionIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
  },
  listeningBadge: {
    position: 'absolute',
    bottom: -22,
    right: 0,
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: 160,
    zIndex: 9999,
  },
  listeningBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '600',
  },
});
