import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Keychain, { BIOMETRY_TYPE } from 'react-native-keychain';
import type { LoginRequest } from '../api/authApi';
import type {
  WeakPromptOptions,
  WeakPromptResult,
} from './biometricWeakPrompt';

type AuthApiModule = {
  login: (data: LoginRequest) => Promise<unknown>;
};

type WeakPromptModule = {
  weakPromptAvailable: () => Promise<boolean>;
  promptWeakBiometric: (
    options?: WeakPromptOptions,
  ) => Promise<WeakPromptResult>;
};

const getAuthApi = (): AuthApiModule => require('../api/authApi');

const getWeakPromptModule = (): WeakPromptModule =>
  require('./biometricWeakPrompt');

export const BIOMETRIC_FEATURE_ENABLED = true;
export const BIOMETRIC_SERVICE = 'perfex360.biometric';
export const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';
export const BIOMETRIC_FACE_ENABLED = true;
export const BIOMETRIC_FACE_SERVICE = 'perfex360.biometric.face';
export const BIOMETRIC_METHOD_KEY = 'biometricMethod';

export type BiometricMethod = 'fingerprint' | 'face';

export type BiometricReadResult =
  | { status: 'ok'; username: string; password: string }
  | { status: 'unavailable' }
  | { status: 'cancelled' }
  | { status: 'error'; message?: string };

export type BiometricSwitchResult =
  | { ok: true; method: BiometricMethod }
  | {
      ok: false;
      status: 'cancelled' | 'unavailable' | 'invalid_credentials' | 'error';
      message?: string;
    };

export type PasswordVerifier = (
  username: string,
  password: string,
) => Promise<void>;

export type EnrollBiometricOptions = {
  verifyPassword?: PasswordVerifier;
  skipPasswordVerification?: boolean;
};

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

export const getBiometricMethod = async (): Promise<BiometricMethod> => {
  if (!BIOMETRIC_FACE_ENABLED || Platform.OS !== 'android') {
    return 'fingerprint';
  }

  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_METHOD_KEY);
    return value === 'face' ? 'face' : 'fingerprint';
  } catch {
    return 'fingerprint';
  }
};

export const setBiometricMethod = async (
  method: BiometricMethod,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(BIOMETRIC_METHOD_KEY, method);
  } catch {
    // Best-effort storage update
  }
};

const getServiceForMethod = (method: BiometricMethod): string =>
  method === 'face' ? BIOMETRIC_FACE_SERVICE : BIOMETRIC_SERVICE;

const safeResetKeychainService = async (service: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service });
  } catch {
    // Ignore Keychain reset error
  }
};

const verifyUserPassword = async (
  username: string,
  password: string,
  options?: EnrollBiometricOptions,
): Promise<{ ok: true } | { ok: false; message: string }> => {
  if (options?.skipPasswordVerification) {
    return { ok: true };
  }

  const verifier: PasswordVerifier =
    options?.verifyPassword ??
    (async (user, pass) => {
      const { login } = getAuthApi();
      await login({ username: user, password: pass });
    });

  try {
    await verifier(username, password);
    return { ok: true };
  } catch (err: unknown) {
    const errorObj = err as
      | { response?: { data?: { message?: string } }; message?: string }
      | null
      | undefined;
    return {
      ok: false,
      message:
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        'Invalid Username or Password',
    };
  }
};

export const hasBiometricCredentials = async (
  method?: BiometricMethod,
): Promise<boolean> => {
  try {
    if (method !== undefined) {
      if (
        (!BIOMETRIC_FACE_ENABLED || Platform.OS !== 'android') &&
        method === 'face'
      ) {
        return false;
      }
      return Boolean(
        await Keychain.hasGenericPassword({
          service: getServiceForMethod(method),
        }),
      );
    }

    const service =
      BIOMETRIC_FACE_ENABLED && Platform.OS === 'android'
        ? getServiceForMethod(await getBiometricMethod())
        : BIOMETRIC_SERVICE;

    return Boolean(await Keychain.hasGenericPassword({ service }));
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

export const enrollFaceBiometricCredentials = async (
  username: string,
  password: string,
  options?: EnrollBiometricOptions,
): Promise<BiometricSwitchResult> => {
  if (!BIOMETRIC_FACE_ENABLED || Platform.OS !== 'android') {
    return {
      ok: false,
      status: 'unavailable',
      message: BIOMETRIC_FACE_ENABLED
        ? 'Face recognition is unavailable on this platform'
        : 'Face recognition is disabled',
    };
  }

  const passwordCheck = await verifyUserPassword(username, password, options);
  if (!passwordCheck.ok) {
    return {
      ok: false,
      status: 'invalid_credentials',
      message: passwordCheck.message,
    };
  }

  const { weakPromptAvailable, promptWeakBiometric } = getWeakPromptModule();

  const available = await weakPromptAvailable();
  if (!available) {
    return {
      ok: false,
      status: 'unavailable',
      message: 'Face recognition is unavailable on this device',
    };
  }

  const promptResult = await promptWeakBiometric({
    title: 'Confirm Face Login',
    subtitle: 'Authenticate to enable face login',
    cancel: 'Cancel',
  });

  if (promptResult.status !== 'ok') {
    return {
      ok: false,
      status: promptResult.status,
      message:
        promptResult.status === 'error' ? promptResult.message : undefined,
    };
  }

  try {
    const saved = await Keychain.setGenericPassword(username, password, {
      service: BIOMETRIC_FACE_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    if (!saved) {
      await safeResetKeychainService(BIOMETRIC_FACE_SERVICE);
      return {
        ok: false,
        status: 'error',
        message: 'Failed to store face credentials',
      };
    }
  } catch (err: unknown) {
    await safeResetKeychainService(BIOMETRIC_FACE_SERVICE);
    const errorObj = err as { message?: string } | null | undefined;
    return {
      ok: false,
      status: 'error',
      message: errorObj?.message || 'Failed to store face credentials',
    };
  }

  try {
    const readBack = await Keychain.getGenericPassword({
      service: BIOMETRIC_FACE_SERVICE,
    });

    if (
      !readBack ||
      readBack.username !== username ||
      readBack.password !== password
    ) {
      await safeResetKeychainService(BIOMETRIC_FACE_SERVICE);
      return {
        ok: false,
        status: 'error',
        message: 'Failed to verify stored face credentials',
      };
    }
  } catch (err: unknown) {
    await safeResetKeychainService(BIOMETRIC_FACE_SERVICE);
    const errorObj = err as { message?: string } | null | undefined;
    return {
      ok: false,
      status: 'error',
      message: errorObj?.message || 'Failed to verify stored face credentials',
    };
  }

  await safeResetKeychainService(BIOMETRIC_SERVICE);
  await setBiometricMethod('face');
  await setBiometricFlag(true);

  return { ok: true, method: 'face' };
};

export const switchBiometricMethod = async (
  targetMethod: BiometricMethod,
  username: string,
  password: string,
  options?: EnrollBiometricOptions,
): Promise<BiometricSwitchResult> => {
  if (targetMethod === 'face') {
    return enrollFaceBiometricCredentials(username, password, options);
  }

  const passwordCheck = await verifyUserPassword(username, password, options);
  if (!passwordCheck.ok) {
    return {
      ok: false,
      status: 'invalid_credentials',
      message: passwordCheck.message,
    };
  }

  const biometryType = await getSupportedBiometry();
  if (!biometryType) {
    return {
      ok: false,
      status: 'unavailable',
      message: 'No biometrics enrolled on this device',
    };
  }

  const previousMethod = await getBiometricMethod();
  const saved = await saveBiometricCredentials(username, password);
  if (!saved) {
    if (previousMethod === 'face') {
      await safeResetKeychainService(BIOMETRIC_SERVICE);
    }
    return {
      ok: false,
      status: 'cancelled',
      message: 'Biometric authentication was cancelled or failed.',
    };
  }

  if (BIOMETRIC_FACE_ENABLED && Platform.OS === 'android') {
    await safeResetKeychainService(BIOMETRIC_FACE_SERVICE);
    await setBiometricMethod('fingerprint');
  }

  return { ok: true, method: 'fingerprint' };
};

export const clearBiometricData = async (): Promise<void> => {
  await safeResetKeychainService(BIOMETRIC_SERVICE);
  await safeResetKeychainService(BIOMETRIC_FACE_SERVICE);

  try {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
  } catch {
    // Ignore AsyncStorage cleanup error
  }

  try {
    await AsyncStorage.removeItem(BIOMETRIC_METHOD_KEY);
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
    const activeMethod = await getBiometricMethod();
    if (
      BIOMETRIC_FACE_ENABLED &&
      Platform.OS === 'android' &&
      activeMethod === 'face'
    ) {
      const { weakPromptAvailable, promptWeakBiometric } =
        getWeakPromptModule();

      const available = await weakPromptAvailable();
      if (!available) {
        await setBiometricFlag(false);
        return { status: 'unavailable' };
      }

      const promptResult = await promptWeakBiometric({
        title: 'Face Login',
        subtitle: 'Authenticate to sign in to Perfex360',
        cancel: 'Cancel',
      });

      if (promptResult.status === 'unavailable') {
        await setBiometricFlag(false);
        return { status: 'unavailable' };
      }

      if (promptResult.status === 'cancelled') {
        return { status: 'cancelled' };
      }

      if (promptResult.status === 'error') {
        return {
          status: 'error',
          message: promptResult.message || 'Biometric authentication failed',
        };
      }

      try {
        const credentials = await Keychain.getGenericPassword({
          service: BIOMETRIC_FACE_SERVICE,
        });

        if (!credentials) {
          await setBiometricFlag(false);
          return { status: 'unavailable' };
        }

        return {
          status: 'ok',
          username: credentials.username,
          password: credentials.password,
        };
      } catch (err: unknown) {
        const errorObj = err as { message?: string } | null | undefined;
        return {
          status: 'error',
          message: errorObj?.message || 'Biometric authentication failed',
        };
      }
    }

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
        const stillExists = await hasBiometricCredentials('fingerprint');
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
