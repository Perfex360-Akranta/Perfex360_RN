
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';

import MaterialIcons from '@react-native-vector-icons/material-icons';
import LogoutButton from './LogoutButton';
import { useAppTheme } from '../../theme/ThemeContext';
import { ThemeMode } from '../../theme/themeConfig';

export default function AppHeaderSettingsMenu() {
  const [visible, setVisible] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const { colors, themeMode, setThemeMode } = useAppTheme();

  const selectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    setShowThemes(false);
    setVisible(false);
  };

  const closeMenu = () => {
    setVisible(false);
    setShowThemes(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel="More options"
      >
        <MaterialIcons
          name="more-vert"
          size={28}
          color={colors.text}
        />
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={closeMenu}
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Pressable
            onPress={() => {}}
            style={[
              styles.menu,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {!showThemes ? (
              <>
                <Text
                  style={[
                    styles.heading,
                    { color: colors.textSecondary },
                  ]}
                >
                  OPTIONS
                </Text>

                <TouchableOpacity
                  style={styles.item}
                  onPress={() => setShowThemes(true)}
                >
                  <MaterialIcons
                    name="palette"
                    size={22}
                    color={colors.primary}
                  />
                  <View style={styles.itemText}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Theme
                    </Text>
                    <Text
                      style={[
                        styles.subtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {themeMode === 'system'
                        ? 'System default'
                        : themeMode === 'dark'
                          ? 'Dark mode'
                          : 'Light mode'}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={22}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                <View
                  style={[
                    styles.separator,
                    { backgroundColor: colors.border },
                  ]}
                />

                <LogoutButton variant="menu" onDone={closeMenu} />
              </>
            ) : (
              <>
                <View style={styles.titleRow}>
                  <TouchableOpacity onPress={() => setShowThemes(false)}>
                    <MaterialIcons
                      name="arrow-back"
                      size={23}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[styles.label, { color: colors.text }]}
                  >
                    Choose theme
                  </Text>
                </View>

                {([
                  ['light', 'Light', 'light-mode'],
                  ['dark', 'Dark', 'dark-mode'],
                  ['system', 'System default', 'settings-suggest'],
                ] as const).map(([mode, label, icon]) => (
                  <TouchableOpacity
                    key={mode}
                    style={styles.item}
                    onPress={() => selectTheme(mode)}
                  >
                    <MaterialIcons
                      name={icon}
                      size={22}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.label,
                        styles.itemText,
                        { color: colors.text },
                      ]}
                    >
                      {label}
                    </Text>
                    {themeMode === mode && (
                      <MaterialIcons
                        name="check"
                        size={22}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 8,
  },
  menu: {
    width: 245,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 10,
    letterSpacing: 0.8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  itemText: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 5,
    marginHorizontal: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
