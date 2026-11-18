import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setFormOcrEnabled } from '../services/assist/formOcr';

export interface FeatureToggleState {
  /** Full-form document OCR scanning floating action button */
  scanForm: boolean;
  /** Mic / hands-free voice commands & automated form filling */
  voiceControl: boolean;
  /** Text-to-speech audio guidance & field prompts */
  voiceGuidance: boolean;
  /** Inline field-level assist (+ button with mic, camera OCR, gallery) */
  fieldAssist: boolean;
  /** Equipment and Functional Location QR code camera scanner */
  qrScanner: boolean;
}

export const DEFAULT_FEATURE_TOGGLES: FeatureToggleState = {
  scanForm: true,
  voiceControl: true,
  voiceGuidance: true,
  fieldAssist: true,
  qrScanner: true,
};

export const FEATURE_STORAGE_KEY = '@perfex360/feature_settings';

export interface FeatureToggleContextType {
  features: FeatureToggleState;
  isFeatureEnabled: (feature: keyof FeatureToggleState) => boolean;
  setFeature: (feature: keyof FeatureToggleState, enabled: boolean) => Promise<void>;
  toggleFeature: (feature: keyof FeatureToggleState) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const FeatureToggleContext = createContext<FeatureToggleContextType | undefined>(undefined);

export function FeatureToggleProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<FeatureToggleState>(DEFAULT_FEATURE_TOGGLES);
  const featuresRef = useRef<FeatureToggleState>(DEFAULT_FEATURE_TOGGLES);
  featuresRef.current = features;

  // Hydrate persisted toggle settings on initial load
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(FEATURE_STORAGE_KEY);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          const next: FeatureToggleState = {
            ...DEFAULT_FEATURE_TOGGLES,
            ...featuresRef.current,
            ...parsed,
          };
          featuresRef.current = next;
          if (isMounted) {
            setFeatures(next);
            // Keep runtime service flag in sync
            setFormOcrEnabled(Boolean(next.scanForm));
          }
        }
      } catch (err) {
        console.warn('[FeatureToggleContext] Failed to load settings from storage:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistFeatures = useCallback(async (nextState: FeatureToggleState) => {
    try {
      await AsyncStorage.setItem(FEATURE_STORAGE_KEY, JSON.stringify(nextState));
    } catch (err) {
      console.warn('[FeatureToggleContext] Failed to save settings to storage:', err);
    }
  }, []);

  const setFeature = useCallback(
    async (feature: keyof FeatureToggleState, enabled: boolean) => {
      const nextState: FeatureToggleState = { ...featuresRef.current, [feature]: enabled };
      featuresRef.current = nextState;
      setFeatures(nextState);
      if (feature === 'scanForm') {
        setFormOcrEnabled(enabled);
      }
      await persistFeatures(nextState);
    },
    [persistFeatures],
  );

  const toggleFeature = useCallback(
    async (feature: keyof FeatureToggleState) => {
      const nextValue = !featuresRef.current[feature];
      const nextState: FeatureToggleState = { ...featuresRef.current, [feature]: nextValue };
      featuresRef.current = nextState;
      setFeatures(nextState);
      if (feature === 'scanForm') {
        setFormOcrEnabled(nextValue);
      }
      await persistFeatures(nextState);
    },
    [persistFeatures],
  );

  const resetToDefaults = useCallback(async () => {
    featuresRef.current = DEFAULT_FEATURE_TOGGLES;
    setFeatures(DEFAULT_FEATURE_TOGGLES);
    setFormOcrEnabled(true);
    await persistFeatures(DEFAULT_FEATURE_TOGGLES);
  }, [persistFeatures]);

  const isFeatureEnabled = useCallback(
    (feature: keyof FeatureToggleState): boolean => {
      return features[feature] ?? true;
    },
    [features],
  );

  const value = useMemo<FeatureToggleContextType>(
    () => ({
      features,
      isFeatureEnabled,
      setFeature,
      toggleFeature,
      resetToDefaults,
    }),
    [features, isFeatureEnabled, setFeature, toggleFeature, resetToDefaults],
  );

  return (
    <FeatureToggleContext.Provider value={value}>
      {children}
    </FeatureToggleContext.Provider>
  );
}

export function useFeatureToggles(): FeatureToggleContextType {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    // If used outside of provider (e.g. isolated test or early render),
    // safely fall back to default enabled states
    return {
      features: DEFAULT_FEATURE_TOGGLES,
      isFeatureEnabled: () => true,
      setFeature: async () => {},
      toggleFeature: async () => {},
      resetToDefaults: async () => {},
    };
  }
  return context;
}
