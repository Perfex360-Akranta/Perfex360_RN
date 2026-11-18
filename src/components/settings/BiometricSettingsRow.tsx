import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAppTheme } from '../../theme/ThemeContext';
import { login } from '../../services/api/authApi';
import { getToken } from '../../services/storage/tokenStorage';
import { getUser } from '../../services/storage/userStorage';
import {
  BIOMETRIC_FEATURE_ENABLED,
  clearBiometricData,
  getActiveBiometricUsername,
  getSupportedBiometry,
  isBiometricLoginAvailable,
  saveBiometricCredentials,
} from '../../services/auth/biometricService';

export default function BiometricSettingsRow() {
  const { colors } = useAppTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeUsername, setActiveUsername] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [modalError, setModalError] = useState('');
  const confirmInFlightRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadBiometricStatus = async () => {
      if (!BIOMETRIC_FEATURE_ENABLED) {
        return;
      }

      try {
        const [token, user] = await Promise.all([getToken(), getUser()]);
        const authed = Boolean(token && user);

        if (!isMounted) {
          return;
        }

        if (!authed) {
          setIsAuthenticated(false);
          return;
        }

        const resolvedUsername =
          getActiveBiometricUsername() ||
          user?.loginId ||
          user?.username ||
          user?.userName ||
          '';

        const available = await isBiometricLoginAvailable();
        if (!isMounted) {
          return;
        }

        setActiveUsername(resolvedUsername);
        setBiometricEnabled(available);
        setIsAuthenticated(true);
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    };

    loadBiometricStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!BIOMETRIC_FEATURE_ENABLED || !isAuthenticated) {
    return null;
  }

  const handleToggle = async (nextValue: boolean) => {
    if (verifyingPassword || confirmInFlightRef.current) {
      return;
    }

    if (!nextValue) {
      await clearBiometricData();
      setBiometricEnabled(false);
      return;
    }

    setConfirmPassword('');
    setModalError('');
    setShowPasswordModal(true);
  };

  const handleCancelModal = () => {
    if (verifyingPassword || confirmInFlightRef.current) {
      return;
    }
    setShowPasswordModal(false);
    setConfirmPassword('');
    setModalError('');
  };

  const handleConfirmEnable = async () => {
    if (confirmInFlightRef.current || verifyingPassword) {
      return;
    }

    if (!confirmPassword) {
      setModalError('Please enter your password');
      return;
    }

    if (!activeUsername) {
      setModalError('Unable to identify current user. Please log in manually.');
      return;
    }

    confirmInFlightRef.current = true;
    setVerifyingPassword(true);
    setModalError('');

    try {
      try {
        await login({
          username: activeUsername,
          password: confirmPassword,
        });
      } catch (err: any) {
        setModalError(
          err?.response?.data?.message ||
            err?.message ||
            'Invalid Username or Password',
        );
        return;
      }

      const biometryType = await getSupportedBiometry();
      if (biometryType === null) {
        setShowPasswordModal(false);
        setConfirmPassword('');
        setBiometricEnabled(false);
        Alert.alert(
          'Biometrics Unavailable',
          'No biometrics enrolled on this device',
        );
        return;
      }

      const saved = await saveBiometricCredentials(
        activeUsername,
        confirmPassword,
      );
      if (!saved) {
        setModalError('Biometric authentication was cancelled or failed.');
        setBiometricEnabled(false);
        return;
      }

      setBiometricEnabled(true);
      setShowPasswordModal(false);
      setConfirmPassword('');
      Alert.alert('Success', 'Biometric login enabled');
    } finally {
      confirmInFlightRef.current = false;
      setVerifyingPassword(false);
    }
  };

  return (
    <>
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        SECURITY
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
        <View style={styles.row}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: biometricEnabled
                  ? colors.primaryLight
                  : colors.surfaceSecondary,
              },
            ]}
          >
            <MaterialIcons
              name="fingerprint"
              size={22}
              color={biometricEnabled ? colors.primary : colors.iconSecondary}
            />
          </View>

          <View style={styles.info}>
            <View style={styles.titleLine}>
              <Text
                style={[
                  styles.title,
                  { color: colors.text },
                  !biometricEnabled && styles.dimmedText,
                ]}
              >
                Biometric Login
              </Text>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: biometricEnabled
                      ? colors.successBackground
                      : colors.disabled,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: biometricEnabled
                        ? colors.success
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {biometricEnabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.description,
                { color: colors.textSecondary },
                !biometricEnabled && styles.dimmedText,
              ]}
            >
              Use Fingerprint or Face ID to sign in
            </Text>
          </View>

          <Switch
            value={biometricEnabled}
            onValueChange={handleToggle}
            trackColor={{
              false: colors.border,
              true: colors.primary,
            }}
            thumbColor={biometricEnabled ? '#FFFFFF' : '#F4F4F4'}
            accessibilityRole="switch"
            accessibilityLabel="Toggle Biometric Login"
            accessibilityState={{ checked: biometricEnabled }}
            testID="biometric-login-switch"
          />
        </View>
      </View>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Confirm Password
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: colors.textSecondary }]}
            >
              Re-enter your password to enable biometric login.
            </Text>

            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!verifyingPassword}
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              testID="biometric-password-input"
            />

            {modalError ? (
              <Text style={[styles.modalError, { color: colors.error }]}>
                {modalError}
              </Text>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { borderColor: colors.border },
                ]}
                onPress={handleCancelModal}
                disabled={verifyingPassword}
                testID="biometric-cancel-button"
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalConfirmButton,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={handleConfirmEnable}
                disabled={verifyingPassword}
                testID="biometric-confirm-button"
              >
                {verifyingPassword ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  row: {
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
  info: {
    flex: 1,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  dimmedText: {
    opacity: 0.65,
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
  description: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  modalError: {
    fontSize: 12,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 88,
    alignItems: 'center',
  },
  modalConfirmButton: {
    borderWidth: 0,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
