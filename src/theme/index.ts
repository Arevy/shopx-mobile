import {DarkTheme as NavigationDarkTheme} from '@react-navigation/native';
import {DefaultTheme as NavigationLightTheme} from '@react-navigation/native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
  type MD3Theme,
} from 'react-native-paper';

const baseFont = configureFonts({
  config: {
    fontFamily: 'System',
  },
});

const primaryColor = '#c8ff5f';
const secondaryColor = '#b3f04e';

export const lightPaperTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: baseFont,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#416300',
    secondary: '#4e6350',
    background: '#f4f5f2',
    surface: '#ffffff',
    surfaceVariant: '#e8ece2',
    outline: '#737b6d',
    outlineVariant: '#d9dfd1',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    primaryContainer: '#e0efc3',
    onPrimaryContainer: '#263b00',
    secondaryContainer: '#e8ece2',
    onSecondaryContainer: '#34452e',
    onSurface: '#20251e',
    onSurfaceVariant: '#56604f',
    onBackground: '#20251e',
    elevation: {
      level0: 'transparent',
      level1: '#f2f5ec',
      level2: '#edf1e6',
      level3: '#e8ece2',
      level4: '#e2e8d9',
      level5: '#dbe3d0',
    },
  },
};

export const darkPaperTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: baseFont,
  colors: {
    ...MD3DarkTheme.colors,
    primary: primaryColor,
    secondary: secondaryColor,
    background: '#101112',
    surface: '#1a1d20',
    surfaceVariant: '#222629',
    outline: '#737d81',
    onPrimary: '#101112',
    onSecondary: '#101112',
    primaryContainer: '#2c3d18',
    onPrimaryContainer: '#d4ffa0',
    secondaryContainer: '#303a28',
    onSecondaryContainer: '#d2e8c2',
    onSurface: '#f4f5f2',
    onSurfaceVariant: '#adb5b9',
    onBackground: '#f4f5f2',
    elevation: {
      level0: 'transparent',
      level1: '#1a1d20',
      level2: '#222629',
      level3: '#262c2e',
      level4: '#2c3335',
      level5: '#343a3d',
    },
  },
};

export const lightNavigationTheme = {
  ...NavigationLightTheme,
  colors: {
    ...NavigationLightTheme.colors,
    primary: '#416300',
    background: '#f4f5f2',
    card: '#ffffff',
    border: '#d9dfd1',
    text: '#20251e',
  },
};

export const darkNavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: primaryColor,
    background: '#101112',
    card: '#1a1d20',
    border: '#343a3d',
    text: '#f4f5f2',
  },
};
