import { NativeModules, Platform } from 'react-native';

type SpeechEvent = { value?: string[] };
type SpeechErrorEvent = { error?: { code?: string; message?: string } };

type VoiceModule = {
  start: (locale: string) => Promise<void>;
  stop: () => Promise<void>;
  cancel: () => Promise<void>;
  destroy: () => Promise<void>;
  removeAllListeners: () => void;
  isAvailable: () => Promise<boolean | number>;
  onSpeechPartialResults: ((event: SpeechEvent) => void) | null;
  onSpeechResults: ((event: SpeechEvent) => void) | null;
  onSpeechError: ((event: SpeechErrorEvent) => void) | null;
  onSpeechEnd: (() => void) | null;
};

export type SpeechSession = {
  stop: () => Promise<void>;
  cancel: () => Promise<void>;
};

function deviceLocale() {
  try {
    const identifier =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings?.AppleLocale ??
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
        : NativeModules.I18nManager?.localeIdentifier;

    if (typeof identifier === 'string' && identifier.trim()) {
      return identifier.replace('_', '-');
    }
  } catch {
    // Fall through to the app default.
  }

  return 'en-IN';
}

function loadVoice(): VoiceModule {
  // Loaded on demand so screens render even if the native module is unavailable.
  const imported = require('@dev-amirzubair/react-native-voice');
  return (imported.default ?? imported) as VoiceModule;
}

export function speechErrorMessage(error?: { code?: string; message?: string }) {
  const code = String(error?.code ?? '');
  if (code === '5' || code === '203') {
    return '';
  }
  if (code === '6' || code === '9' || /permission/i.test(error?.message ?? '')) {
    return 'Allow microphone and speech recognition access, then try again.';
  }
  if (code === '7') {
    return 'No speech was recognized. Speak again after tapping the microphone.';
  }
  return error?.message || 'Speech recognition failed.';
}

export async function startSpeechSession(handlers: {
  onTranscript: (text: string) => void;
  onEnd: () => void;
  onError: (message: string) => void;
}): Promise<SpeechSession> {
  const voice = loadVoice();
  const available = await voice.isAvailable();
  if (!available) {
    throw new Error('Speech recognition is not available on this device.');
  }

  let settled = false;
  const finish = () => {
    if (settled) {
      return;
    }
    settled = true;
    handlers.onEnd();
  };

  voice.onSpeechPartialResults = event => {
    const text = event.value?.[0];
    if (text) {
      handlers.onTranscript(text);
    }
  };
  voice.onSpeechResults = event => {
    const text = event.value?.[0];
    if (text) {
      handlers.onTranscript(text);
    }
  };
  voice.onSpeechError = event => {
    const message = speechErrorMessage(event.error);
    finish();
    if (message) {
      handlers.onError(message);
    }
  };
  voice.onSpeechEnd = finish;

  await voice.start(deviceLocale());

  return {
    stop: async () => {
      await voice.stop();
    },
    cancel: async () => {
      settled = true;
      await voice.cancel();
    },
  };
}

export async function releaseSpeech() {
  try {
    const voice = loadVoice();
    voice.onSpeechPartialResults = null;
    voice.onSpeechResults = null;
    voice.onSpeechError = null;
    voice.onSpeechEnd = null;
    await voice.destroy();
    voice.removeAllListeners();
  } catch {
    // The recognizer may already be released.
  }
}
