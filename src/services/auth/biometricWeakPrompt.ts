import { Platform } from 'react-native';
import {
  authenticateWithOptions,
  BiometricStrength,
  isSensorAvailable,
} from '@sbaiahmed1/react-native-biometrics';

export type WeakPromptResult =
  | { status: 'ok' }
  | { status: 'cancelled' }
  | { status: 'unavailable' }
  | { status: 'error'; message?: string };

export interface WeakPromptOptions {
  title?: string;
  subtitle?: string;
  description?: string;
  cancel?: string;
}

const CANCEL_CODES = new Set([
  'USER_CANCELED',
  'SYSTEM_CANCELED',
  'NEGATIVE_BUTTON',
]);

const UNAVAILABLE_CODES = new Set([
  'NO_BIOMETRICS_ENROLLED',
  'NO_BIOMETRIC_HARDWARE',
  'BIOMETRIC_UNAVAILABLE',
  'NO_DEVICE_CREDENTIAL',
  'BiometricErrorNoHardware',
  'BiometricErrorHwUnavailable',
  'BiometricErrorNoneEnrolled',
  'BiometricErrorUnsupported',
]);

const NON_UNAVAILABLE_ERROR_CODES = new Set([
  'BIOMETRIC_LOCKOUT',
  'BIOMETRIC_LOCKOUT_PERMANENT',
  'BIOMETRIC_TIMEOUT',
  'BIOMETRIC_ERROR',
  'NO_ACTIVITY',
  'PROMPT_ERROR',
]);

const classifyWeakPromptFailure = (
  code?: string,
  message?: string,
): WeakPromptResult => {
  const normalizedCode = String(code || '');
  const normalizedMessage = String(message || '');

  if (
    CANCEL_CODES.has(normalizedCode) ||
    /cancel|user.?cancel|authentication.?canceled|dismissed/i.test(
      normalizedMessage,
    )
  ) {
    return { status: 'cancelled' };
  }

  if (NON_UNAVAILABLE_ERROR_CODES.has(normalizedCode)) {
    return {
      status: 'error',
      message: normalizedMessage || 'Biometric authentication failed',
    };
  }

  if (
    UNAVAILABLE_CODES.has(normalizedCode) ||
    /not.?enrolled|no.?biometrics|no.?biometric.?hardware|hardware.?unavailable|no.?hardware|unavailable|unsupported/i.test(
      normalizedMessage,
    )
  ) {
    return { status: 'unavailable' };
  }

  return {
    status: 'error',
    message: normalizedMessage || 'Biometric authentication failed',
  };
};

export const weakPromptAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const info = await isSensorAvailable({
      biometricStrength: BiometricStrength.Weak,
    });
    return Boolean(info?.available);
  } catch {
    return false;
  }
};

export const promptWeakBiometric = async (
  options?: WeakPromptOptions,
): Promise<WeakPromptResult> => {
  if (Platform.OS !== 'android') {
    return { status: 'unavailable' };
  }

  try {
    const result = await authenticateWithOptions({
      title: options?.title ?? 'Face Recognition',
      subtitle: options?.subtitle ?? 'Authenticate to sign in to Perfex360',
      description: options?.description,
      cancelLabel: options?.cancel ?? 'Cancel',
      disableDeviceFallback: true,
      allowDeviceCredentials: false,
      biometricStrength: BiometricStrength.Weak,
    });

    if (result?.success) {
      return { status: 'ok' };
    }

    return classifyWeakPromptFailure(result?.errorCode, result?.error);
  } catch (err: unknown) {
    const errorObj = err as
      | { code?: string; errorCode?: string; message?: string }
      | null
      | undefined;

    return classifyWeakPromptFailure(
      errorObj?.code || errorObj?.errorCode,
      errorObj?.message,
    );
  }
};
