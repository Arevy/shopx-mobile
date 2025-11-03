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

const primaryColor = '#3f37c9';
const secondaryColor = '#4cc9f0';

export const lightPaperTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: baseFont,
  colors: {
    ...MD3LightTheme.colors,
    primary: primaryColor,
    secondary: secondaryColor,
    background: '#f7f7f7',
    surface: '#ffffff',
    surfaceVariant: '#edf2ff',
    outline: '#d0d5dd',
  },
};

export const darkPaperTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: baseFont,
  colors: {
    ...MD3DarkTheme.colors,
    primary: primaryColor,
    secondary: secondaryColor,
    background: '#0b1026',
    surface: '#1b213a',
    surfaceVariant: '#273059',
    outline: '#3b436c',
  },
};

export const lightNavigationTheme = {
  ...NavigationLightTheme,
  colors: {
    ...NavigationLightTheme.colors,
    primary: primaryColor,
    background: '#f7f7f7',
    card: '#ffffff',
    border: '#e0e4f0',
    text: '#1f2a48',
  },
};

export const darkNavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: primaryColor,
    background: '#0b1026',
    card: '#1b213a',
    border: '#273059',
    text: '#f1f5ff',
  },
};
