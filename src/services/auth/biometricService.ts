import AsyncStorage from '@react-native-async-storage/async-storage';
import Keychain, { BIOMETRY_TYPE } from 'react-native-keychain';

export const BIOMETRIC_FEATURE_ENABLED = true;
export const BIOMETRIC_SERVICE = 'perfex360.biometric';
export const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';

export type BiometricReadResult =
  | { status: 'ok'; username: string; password: string }
  | { status: 'unavailable' }
  | { status: 'cancelled' }
  | { status: 'error'; message?: string };

let activeLoginUsername = '';

export const setActiveBiometricUsername = (username: string): void => {
  activeLoginUsername = username;
};

export const getActiveBiometricUsername = (): string => activeLoginUsername;

export const getBiometricFlag = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
};

export const setBiometricFlag = async (enabled: boolean): Promise<void> => {
  try {
    if (enabled) {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    }
  } catch {
    // Best-effort storage update
  }
};

export const hasBiometricCredentials = async (): Promise<boolean> => {
  try {
    return Boolean(
      await Keychain.hasGenericPassword({ service: BIOMETRIC_SERVICE }),
    );
  } catch {
    return false;
  }
};

export const isBiometricLoginAvailable = async (): Promise<boolean> => {
  if (!BIOMETRIC_FEATURE_ENABLED) {
    return false;
  }

  const flagEnabled = await getBiometricFlag();
  if (!flagEnabled) {
    return false;
  }

  const hasCredentials = await hasBiometricCredentials();
  if (!hasCredentials) {
    // Clear stale flag left behind after app reinstall or external Keychain reset
    await setBiometricFlag(false);
    return false;
  }

  return true;
};

export const getSupportedBiometry =
  async (): Promise<BIOMETRY_TYPE | null> => {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch {
      return null;
    }
  };

export const saveBiometricCredentials = async (
  username: string,
  password: string,
): Promise<boolean> => {
  try {
    const saved = await Keychain.setGenericPassword(username, password, {
      service: BIOMETRIC_SERVICE,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      authenticationPrompt: {
        title: 'Confirm Biometric Login',
        subtitle: 'Authenticate to enable biometric login',
        cancel: 'Cancel',
      },
    });

    if (!saved) {
      return false;
    }

    await setBiometricFlag(true);
    return true;
  } catch {
    return false;
  }
};

export const clearBiometricData = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: BIOMETRIC_SERVICE });
  } catch {
    // Ignore Keychain reset error so AsyncStorage cleanup still runs
  }

  try {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
  } catch {
    // Ignore AsyncStorage cleanup error
  }
};

const isPermanentBiometricUnavailableError = (err: unknown): boolean => {
  const errorObj = err as { code?: string; message?: string } | null | undefined;
  const code = String(errorObj?.code || '');
  const message = String(errorObj?.message || '');

  if (
    code === Keychain.ERROR_CODE.BIOMETRIC_NOT_ENROLLED ||
    code === Keychain.ERROR_CODE.BIOMETRIC_UNAVAILABLE ||
    code === Keychain.ERROR_CODE.AUTH_INVALIDATED ||
    code === Keychain.ERROR_CODE.PASSCODE_NOT_SET
  ) {
    return true;
  }

  if (
    code === Keychain.ERROR_CODE.BIOMETRIC_TEMPORARILY_UNAVAILABLE ||
    code === Keychain.ERROR_CODE.BIOMETRIC_LOCKOUT ||
    code === Keychain.ERROR_CODE.BIOMETRIC_LOCKOUT_PERMANENT ||
    code === Keychain.ERROR_CODE.AUTH_CANCELED
  ) {
    return false;
  }

  return /not.?enrolled|biometry.?not.?available|no.?biometrics|permanently.?invalidated|LAErrorBiometryNotAvailable|passcode.?not.?set/i.test(
    message,
  );
};

const isUserCancelError = (err: unknown): boolean => {
  const errorObj = err as { code?: string; message?: string } | null | undefined;
  const code = String(errorObj?.code || '');
  const message = String(errorObj?.message || '');

  if (code === Keychain.ERROR_CODE.AUTH_CANCELED) {
    return true;
  }

  return /cancel|user.?cancel|authentication.?canceled|dismissed/i.test(
    message,
  );
};

export const readBiometricCredentials =
  async (): Promise<BiometricReadResult> => {
    const biometryType = await getSupportedBiometry();
    if (!biometryType) {
      await setBiometricFlag(false);
      return { status: 'unavailable' };
    }

    try {
      const credentials = await Keychain.getGenericPassword({
        service: BIOMETRIC_SERVICE,
        authenticationPrompt: {
          title: 'Biometric Login',
          subtitle: 'Authenticate to sign in to Perfex360',
          cancel: 'Cancel',
        },
      });

      if (!credentials) {
        const stillExists = await hasBiometricCredentials();
        if (!stillExists) {
          await setBiometricFlag(false);
          return { status: 'unavailable' };
        }
        return { status: 'cancelled' };
      }

      return {
        status: 'ok',
        username: credentials.username,
        password: credentials.password,
      };
    } catch (err: unknown) {
      if (isPermanentBiometricUnavailableError(err)) {
        await setBiometricFlag(false);
        return { status: 'unavailable' };
      }

      if (isUserCancelError(err)) {
        return { status: 'cancelled' };
      }

      const errorObj = err as { message?: string } | null | undefined;
      return {
        status: 'error',
        message: errorObj?.message || 'Biometric authentication failed',
      };
    }
  };

export const isInvalidCredentialsError = (error: unknown): boolean => {
  const err = error as
    | {
        response?: {
          status?: number;
          data?: { message?: string };
        };
      }
    | null
    | undefined;

  if (!err?.response) {
    return false;
  }

  const status = err.response.status;
  if (status === 401 || status === 403) {
    return true;
  }

  const message = String(err.response.data?.message || '');
  return /invalid\s*(credentials|username|password|user|login)|bad credentials|unauthorized|wrong password|incorrect password/i.test(
    message,
  );
};
