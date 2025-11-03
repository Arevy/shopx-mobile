import type {ReactNode} from 'react';
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

type ChildrenProps = {
  children?: ReactNode;
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler/jestSetup');
  const React = require('react');
  return {
    ...actual,
    GestureHandlerRootView: ({children}: ChildrenProps) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const inset = {top: 0, bottom: 0, left: 0, right: 0};
  const frame = {x: 0, y: 0, width: 375, height: 812};
  return {
    SafeAreaProvider: ({children}: ChildrenProps) =>
      React.createElement(React.Fragment, null, children),
    SafeAreaView: ({children}: ChildrenProps) =>
      React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    SafeAreaInsetsContext: React.createContext(inset),
    SafeAreaFrameContext: React.createContext(frame),
  };
});

jest.mock('react-native-device-info', () => ({
  getDeviceName: jest.fn().mockResolvedValue('Test Device'),
  getSystemVersion: jest.fn().mockResolvedValue('17.0'),
  getVersion: jest.fn().mockResolvedValue('1.0.0'),
  getBrand: jest.fn(() => 'Brand'),
  getModel: jest.fn(() => 'Model'),
  getBuildNumber: jest.fn().mockResolvedValue('100'),
}));

jest.mock('react-native-config', () => ({
  GRAPHQL_ENDPOINT: 'http://localhost:4000/graphql',
}));

jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native/src/private/animated/NativeAnimatedHelper');

jest.mock('redux-persist', () => {
  const actual = jest.requireActual('redux-persist');
  return {
    ...actual,
    persistStore: jest.fn(() => ({
      persist: jest.fn(),
      purge: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      subscribe: jest.fn(),
    })),
  };
});

jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({children}: ChildrenProps) => children,
}));

const {NativeModules} = require('react-native');

if (!NativeModules.PlatformConstants) {
  NativeModules.PlatformConstants = {
    forceTouchAvailable: false,
    interfaceIdiom: 'phone',
    osVersion: '17.0',
    systemName: 'iOS',
    reactNativeVersion: {
      major: 0,
      minor: 82,
      patch: 1,
      prerelease: null,
    },
  };
}

beforeAll(() => {
  global.fetch = jest.fn(
    () =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/json',
        },
        json: () =>
          Promise.resolve({data: {getProducts: [], getCategories: []}}),
        text: () =>
          Promise.resolve(
            JSON.stringify({data: {getProducts: [], getCategories: []}}),
          ),
      }) as unknown as Promise<Response>,
  ) as jest.Mock;
});

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
