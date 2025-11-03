import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';

import {AppProviders} from './providers/AppProviders';
import {RootNavigator} from '@/navigation/RootNavigator';

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AppProviders>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </AppProviders>
  );
};

export default App;
