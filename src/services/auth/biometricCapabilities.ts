import { Platform } from 'react-native';
import Keychain, { BIOMETRY_TYPE } from 'react-native-keychain';
import {
  BIOMETRIC_FACE_ENABLED,
  getSupportedBiometry,
} from './biometricService';
import { weakPromptAvailable } from './biometricWeakPrompt';

export type BiometricCapabilities = {
  fingerprint: boolean;
  face: boolean;
  strongBiometryType: BIOMETRY_TYPE | null;
  weakAvailable: boolean;
};

export const getBiometricCapabilities =
  async (): Promise<BiometricCapabilities> => {
    if (!BIOMETRIC_FACE_ENABLED) {
      const strongBiometryType = await getSupportedBiometry();
      const fingerprint =
        strongBiometryType === Keychain.BIOMETRY_TYPE.FINGERPRINT ||
        strongBiometryType === Keychain.BIOMETRY_TYPE.TOUCH_ID;

      return {
        fingerprint,
        face: false,
        strongBiometryType,
        weakAvailable: false,
      };
    }

    if (Platform.OS !== 'android') {
      const strongBiometryType = await getSupportedBiometry();
      const fingerprint =
        strongBiometryType === Keychain.BIOMETRY_TYPE.TOUCH_ID ||
        strongBiometryType === Keychain.BIOMETRY_TYPE.FINGERPRINT;
      const face =
        strongBiometryType === Keychain.BIOMETRY_TYPE.FACE_ID ||
        strongBiometryType === Keychain.BIOMETRY_TYPE.FACE;

      return {
        fingerprint,
        face,
        strongBiometryType,
        weakAvailable: false,
      };
    }

    const [strongBiometryType, weakAvailable] = await Promise.all([
      getSupportedBiometry(),
      weakPromptAvailable(),
    ]);

    const fingerprint =
      strongBiometryType === Keychain.BIOMETRY_TYPE.FINGERPRINT;
    const face = weakAvailable;

    return {
      fingerprint,
      face,
      strongBiometryType,
      weakAvailable,
    };
  };
