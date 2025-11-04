import './polyfills';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import {AppRegistry} from 'react-native';
import App from '../src/app/App';
import appConfig from '../app.json';
import {Platform} from 'react-native';

if (typeof document !== 'undefined') {
  document.title = `ShopX (${Platform.OS})`;
}

const appName = appConfig.name;

AppRegistry.registerComponent(appName, () => App);

const rootTag = document.getElementById('root');

if (!rootTag) {
  throw new Error('Root element with id "root" was not found.');
}

const hadPlaceholder = rootTag.childNodes.length === 0;

if (hadPlaceholder) {
  rootTag.innerHTML =
    '<div style="display:flex;height:100%;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#555;">Loading ShopX…</div>';
}

const renderError = (error: unknown) => {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : String(error);
  rootTag.innerHTML = `<pre style="white-space:pre-wrap;font-family:monospace;padding:16px;color:#b71c1c;">${message}</pre>`;
};

window.addEventListener('error', event => {
  renderError(event.error ?? event.message ?? 'Runtime error');
});

window.addEventListener('unhandledrejection', event => {
  renderError(event.reason ?? 'Unhandled rejection');
});

try {
  if (hadPlaceholder) {
    rootTag.innerHTML = '';
  }
  AppRegistry.runApplication(appName, {
    rootTag,
  });
  rootTag.style.display = 'flex';
  rootTag.style.flexDirection = 'column';
  rootTag.style.minHeight = '0';
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info('[shopx-web] application started');
  }
} catch (error) {
  renderError(error);
  throw error;
}
