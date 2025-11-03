import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import {env} from '@/config/env';

import {en} from './locales/en';
import {ro} from './locales/ro';
import {fr} from './locales/fr';
import {de} from './locales/de';
import {ar} from './locales/ar';
import {he} from './locales/he';

const resources = {
  en,
  ro,
  fr,
  de,
  ar,
  he,
};

export type SupportedLanguage = keyof typeof resources;

const FALLBACK_LANGUAGE: SupportedLanguage = 'en';
export const namespaces = [
  'common',
  'navigation',
  'home',
  'cart',
  'wishlist',
  'product',
  'account',
  'auth',
  'cms',
  'settings',
  'Common',
  'Page_Account',
  'Page_Checkout',
  'Page_Home',
] as const;

const findBestLanguage = (): SupportedLanguage => {
  const supported = Object.keys(resources);
  const match = RNLocalize.findBestLanguageTag(supported);
  if (match?.languageTag && supported.includes(match.languageTag)) {
    return match.languageTag as SupportedLanguage;
  }
  return FALLBACK_LANGUAGE;
};

if (!i18n.isInitialized) {
  const initialLanguage = findBestLanguage();

  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    lng: initialLanguage,
    fallbackLng: FALLBACK_LANGUAGE,
    resources,
    defaultNS: 'common',
    ns: namespaces,
    interpolation: {
      escapeValue: false,
      defaultVariables: {
        siteName: env.SITE_NAME,
      },
    },
  });
}

export {i18n};
