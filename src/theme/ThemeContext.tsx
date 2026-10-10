
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  themeConfig,
  ThemeMode,
} from './themeConfig';

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: (typeof themeConfig)['light'] | (typeof themeConfig)['dark'];
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

const STORAGE_KEY = '@perfex360/theme';

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => {
        if (
          value === 'light' ||
          value === 'dark' ||
          value === 'system'
        ) {
          setThemeModeState(value);
        }
      })
      .catch(error => console.warn('Unable to load theme:', error));
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);

    AsyncStorage.setItem(STORAGE_KEY, mode).catch(error =>
      console.warn('Unable to save theme:', error),
    );
  };

  const colors =
    themeMode === 'system'
      ? systemScheme === 'dark'
        ? themeConfig.dark
        : themeConfig.light
      : themeMode === 'dark'
        ? themeConfig.dark
        : themeConfig.light;

  const value = useMemo(
    () => ({ themeMode, setThemeMode, colors }),
    [themeMode, colors],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useAppTheme must be used inside ThemeProvider',
    );
  }

  return context;
}
