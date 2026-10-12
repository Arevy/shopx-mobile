import {useColorScheme} from 'react-native';
import {useMemo} from 'react';

import {useAppSelector} from '@/store/hooks';
import {
  darkNavigationTheme,
  darkPaperTheme,
  lightNavigationTheme,
  lightPaperTheme,
} from '@/theme';
import type {ThemePreference} from '@/store/slices/uiSlice';

const resolveThemePreference = (
  preference: ThemePreference,
  deviceScheme: 'light' | 'dark' | 'unspecified' | null | undefined,
): 'light' | 'dark' => {
  if (preference === 'system') {
    return deviceScheme === 'dark' ? 'dark' : 'light';
  }

  return preference;
};

export const useAppTheme = () => {
  const deviceScheme = useColorScheme();
  const preference = useAppSelector(state => state.ui.theme);
  const branding = useAppSelector(
    state => state.platform.configuration?.branding,
  );

  const mode = resolveThemePreference(preference, deviceScheme);

  return useMemo(() => {
    if (branding && mode === 'dark') {
      return {
        paperTheme: {
          ...darkPaperTheme,
          colors: {
            ...darkPaperTheme.colors,
            primary: branding.accent,
            background: branding.background,
            surface: branding.surface,
          },
        },
        navigationTheme: {
          ...darkNavigationTheme,
          colors: {
            ...darkNavigationTheme.colors,
            primary: branding.accent,
            background: branding.background,
            card: branding.surface,
          },
        },
        mode,
      };
    }
    if (mode === 'dark') {
      return {
        paperTheme: darkPaperTheme,
        navigationTheme: darkNavigationTheme,
        mode,
      };
    }

    return {
      paperTheme: lightPaperTheme,
      navigationTheme: lightNavigationTheme,
      mode,
    };
  }, [mode, branding]);
};
