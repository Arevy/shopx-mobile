const DEFAULT_GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';
const DEFAULT_SITE_NAME = 'ShopX';
const DEFAULT_SERVER_SERVICES_BASE_PATH = '/api/serverSideServices';

// Web fallback for react-native-config. Values can be overridden by process.env.
const Config = {
  GRAPHQL_ENDPOINT:
    process.env.GRAPHQL_ENDPOINT ?? DEFAULT_GRAPHQL_ENDPOINT,
  IMAGE_CDN_URL: process.env.IMAGE_CDN_URL,
  SITE_NAME: process.env.SITE_NAME ?? DEFAULT_SITE_NAME,
  SERVER_SERVICES_BASE_PATH:
    process.env.SERVER_SERVICES_BASE_PATH ?? DEFAULT_SERVER_SERVICES_BASE_PATH,
  USE_SERVER_SERVICES: process.env.USE_SERVER_SERVICES,
  SERVER_SERVICES_TOKEN: process.env.SERVER_SERVICES_TOKEN,
} as const;

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('[shopx-web] react-native-config shim', Config);
}

export default Config;
