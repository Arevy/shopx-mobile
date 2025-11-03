import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {PaperProvider} from 'react-native-paper';
import {I18nextProvider} from 'react-i18next';

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
            loading={null}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
