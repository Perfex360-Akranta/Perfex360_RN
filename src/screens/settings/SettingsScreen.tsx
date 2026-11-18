import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeContext';
import {
  FeatureToggleState,
  useFeatureToggles,
} from '../../context/FeatureToggleContext';
import BiometricSettingsRow from '../../components/settings/BiometricSettingsRow';

interface FeatureItemConfig {
  key: keyof FeatureToggleState;
  title: string;
  description: string;
  icon: string;
  badge?: string;
}

const FEATURE_ITEMS: FeatureItemConfig[] = [
  {
    key: 'scanForm',
    title: 'Scan Form (Full OCR)',
    description: 'Auto-fill entire form with one document photo upload',
    icon: 'document-scanner',
  },
  {
    key: 'voiceControl',
    title: 'Voice Automation (Mic)',
    description: 'Hands-free voice commands, field dictation, and actions',
    icon: 'mic',
  },
  // {
  //   key: 'voiceGuidance',
  //   title: 'Voice Guidance (TTS)',
  //   description: 'Spoken audio prompts and voice guidance between fields',
  //   icon: 'record-voice-over',
  // },
  {
    key: 'fieldAssist',
    title: 'Field-Level Assist (+)',
    description: 'Inline + button for mic, single-field OCR & photo assist',
    icon: 'add-circle-outline',
  },
  {
    key: 'qrScanner',
    title: 'Equipment & QR Scanner',
    description: 'Camera barcode & QR code scanner for machines and locations',
    icon: 'qr-code-scanner',
  },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, themeMode } = useAppTheme();
  const { features, toggleFeature, resetToDefaults } = useFeatureToggles();
  const [resetting, setResetting] = useState(false);

  const handleToggle = async (key: keyof FeatureToggleState) => {
    try {
      await toggleFeature(key);
    } catch (err) {
      console.warn(`[SettingsScreen] Failed to toggle ${key}:`, err);
    }
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset Feature Settings',
      'All features will be reset to their default ON state. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              await resetToDefaults();
            } finally {
              setResetting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Intro Header Card */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerIconWrap}>
          <MaterialIcons name="tune" size={28} color={colors.primary} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Feature Preferences
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Configure and toggle smart automation tools across the application. All features are enabled by default.
          </Text>
        </View>
      </View>

      {/* Feature Toggles Section */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        APPLICATION FEATURES
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {FEATURE_ITEMS.map((item, index) => {
          const isEnabled = features[item.key];
          const isLast = index === FEATURE_ITEMS.length - 1;

          return (
            <View key={item.key}>
              <View style={styles.featureRow}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isEnabled
                        ? colors.primaryLight
                        : colors.surfaceSecondary,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={22}
                    color={isEnabled ? colors.primary : colors.iconSecondary}
                  />
                </View>

                <View style={styles.featureInfo}>
                  <View style={styles.titleLine}>
                    <Text
                      style={[
                        styles.featureTitle,
                        { color: colors.text },
                        !isEnabled && { opacity: 0.65 },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: isEnabled
                            ? colors.successBackground
                            : colors.disabled,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: isEnabled
                              ? colors.success
                              : colors.textSecondary,
                          },
                        ]}
                      >
                        {isEnabled ? 'ON' : 'OFF'}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.featureDesc,
                      { color: colors.textSecondary },
                      !isEnabled && { opacity: 0.65 },
                    ]}
                  >
                    {item.description}
                  </Text>
                </View>

                <Switch
                  value={isEnabled}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary,
                  }}
                  thumbColor={isEnabled ? '#FFFFFF' : '#F4F4F4'}
                  accessibilityRole="switch"
                  accessibilityLabel={`Toggle ${item.title}`}
                  accessibilityState={{ checked: isEnabled }}
                />
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.rowDivider,
                    { backgroundColor: colors.border },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <BiometricSettingsRow />

      {/* App Info & Theme Summary Section */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        SYSTEM & APPEARANCE
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.systemRow}>
          <MaterialIcons name="palette" size={22} color={colors.primary} />
          <View style={styles.systemInfo}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Current Theme
            </Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
              {themeMode === 'system'
                ? 'System Default'
                : themeMode === 'dark'
                ? 'Dark Mode'
                : 'Light Mode'}
            </Text>
          </View>
        </View>

        <View
          style={[styles.rowDivider, { backgroundColor: colors.border }]}
        />

        <View style={styles.systemRow}>
          <MaterialIcons name="info-outline" size={22} color={colors.primary} />
          <View style={styles.systemInfo}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Application
            </Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
              Perfex360 v0.0.1
            </Text>
          </View>
        </View>
      </View>

      {/* Reset to Defaults Action */}
      <View style={styles.resetWrap}>
        <TouchableOpacity
          style={[
            styles.resetButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={confirmReset}
          disabled={resetting}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Reset all feature toggles to defaults"
        >
          <MaterialIcons
            name="restore"
            size={20}
            color={colors.error}
          />
          <Text style={[styles.resetButtonText, { color: colors.error }]}>
            Reset All Features to Defaults (ON)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  headerCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7, 84, 125, 0.08)',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  featureDesc: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  systemInfo: {
    flex: 1,
  },
  resetWrap: {
    marginTop: 4,
    marginBottom: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
