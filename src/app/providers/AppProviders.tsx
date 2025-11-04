import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {PaperProvider} from 'react-native-paper';
import {I18nextProvider} from 'react-i18next';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {store, persistor} from '@/store';
import {setHydrated} from '@/store/slices/sessionSlice';
import {useBootstrapUserContext} from '@/hooks/useBootstrapUserContext';
import {useAppTheme} from '@/hooks/useAppTheme';
import {i18n} from '@/i18n';
import {env} from '@/config/env';
import {useAppSelector} from '@/store/hooks';

type AppProvidersProps = {
  children: React.ReactNode;
};

const UserContextBootstrapper: React.FC = () => {
  useBootstrapUserContext();
  return null;
};

const logFontError =
  (family: string) =>
  (error: unknown): void => {
    const inDev =
      (typeof __DEV__ !== 'undefined' && __DEV__) ||
      process.env.NODE_ENV !== 'production';
    if (inDev) {
      // eslint-disable-next-line no-console
      console.warn(`[icons] Failed to load ${family} font`, error);
    }
  };

FeatherIcon.loadFont().catch(logFontError('Feather'));
MaterialCommunityIcons.loadFont().catch(
  logFontError('MaterialCommunityIcons'),
);

const LocalizationBootstrapper: React.FC = () => {
  const language = useAppSelector(state => state.ui.language);

  useEffect(() => {
    if (language && language !== i18n.language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return null;
};

const ThemedProviders: React.FC<AppProvidersProps> = ({children}) => {
  const {paperTheme, navigationTheme} = useAppTheme();

  return (
    <I18nextProvider i18n={i18n}>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer
          theme={navigationTheme}
          documentTitle={{formatter: (_, route) => `${env.SITE_NAME} · ${route?.name ?? ''}`}}>
          <UserContextBootstrapper />
          <LocalizationBootstrapper />
          {children}
        </NavigationContainer>
      </PaperProvider>
    </I18nextProvider>
  );
};

export const AppProviders: React.FC<AppProvidersProps> = ({children}) => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate
            loading={<PersistGateFallback />}
            persistor={persistor}
            onBeforeLift={() => {
              store.dispatch(setHydrated(true));
            }}>
            <ThemedProviders>{children}</ThemedProviders>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const PersistGateFallback: React.FC = () => (
  <View style={styles.fallback}>
    <ActivityIndicator size="large" />
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
