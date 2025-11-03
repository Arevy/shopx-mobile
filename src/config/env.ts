import Config from 'react-native-config';
import {z} from 'zod';

const DEFAULT_GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';
const DEFAULT_SITE_NAME = 'ShopX';
const DEFAULT_SERVER_SERVICES_BASE_PATH = '/api/serverSideServices';

const parseBoolean = (value?: string): boolean => {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return false;
};

const envSchema = z.object({
  GRAPHQL_ENDPOINT: z.string().url(),
  IMAGE_CDN_URL: z.string().url().optional(),
  SITE_NAME: z.string().min(1),
  SERVER_SERVICES_BASE_PATH: z.string().min(1),
  USE_SERVER_SERVICES: z.boolean().default(false),
  SERVER_SERVICES_TOKEN: z.string().optional(),
});

const rawConfig = {
  GRAPHQL_ENDPOINT: Config.GRAPHQL_ENDPOINT ?? DEFAULT_GRAPHQL_ENDPOINT,
  IMAGE_CDN_URL: Config.IMAGE_CDN_URL,
  SITE_NAME: Config.SITE_NAME ?? DEFAULT_SITE_NAME,
  SERVER_SERVICES_BASE_PATH:
    Config.SERVER_SERVICES_BASE_PATH ?? DEFAULT_SERVER_SERVICES_BASE_PATH,
  USE_SERVER_SERVICES: parseBoolean(Config.USE_SERVER_SERVICES),
  SERVER_SERVICES_TOKEN: Config.SERVER_SERVICES_TOKEN,
};

const parsed = envSchema.parse(rawConfig);

const buildServerServicesGraphqlEndpoint = (
  config: typeof parsed,
): string => {
  const baseUrl = new URL(config.GRAPHQL_ENDPOINT);
  const cleanedBasePath = config.SERVER_SERVICES_BASE_PATH.replace(/\/+$/, '');
  return `${baseUrl.origin}${cleanedBasePath}/graphql`;
};

const graphqlEndpoint = parsed.USE_SERVER_SERVICES
  ? buildServerServicesGraphqlEndpoint(parsed)
  : parsed.GRAPHQL_ENDPOINT;

export const env = {
  ...parsed,
  ORIGINAL_GRAPHQL_ENDPOINT: parsed.GRAPHQL_ENDPOINT,
  GRAPHQL_ENDPOINT: graphqlEndpoint,
};
