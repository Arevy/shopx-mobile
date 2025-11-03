import 'react-i18next';

import type {en} from './locales/en';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: typeof en;
    defaultNS: 'common';
  }
}
