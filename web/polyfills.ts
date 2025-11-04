import * as SafeAreaContext from 'react-native-safe-area-context';

if (typeof window !== 'undefined') {
  (window as typeof window & {global: typeof globalThis}).global = window as typeof window & {global: typeof globalThis};
  if (!(window as any).exports) {
    (window as any).exports = {};
  }
  if (!(window as any).module) {
    (window as any).module = {exports: (window as any).exports};
  }
  if (!(window as any).__DEV__) {
    (window as any).__DEV__ = process.env.NODE_ENV !== 'production';
  }
  if (!(window as any).process) {
    (window as any).process = {env: {NODE_ENV: process.env.NODE_ENV || 'development'}};
  }
}

if (typeof globalThis !== 'undefined') {
  const registry: Record<string, unknown> = {
    'react-native-safe-area-context': SafeAreaContext,
  };

  const previousRequire = (globalThis as any).require;
  (globalThis as any).require = (request: string) => {
    if (registry[request]) {
      return registry[request];
    }
    if (typeof previousRequire === 'function') {
      return previousRequire(request);
    }
    throw new Error(`Cannot require module '${request}' from webpack bundle.`);
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('gesturestart', (event: Event) => {
    event.preventDefault();
  });
}
