import {Platform} from 'react-native';
import {env} from '@/config/env';

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

export const resolveImageUrl = (url?: string | null): string | undefined => {
  if (!url) {
    return undefined;
  }
  if (/^\/api\/products\/\d+\/image(?:\?|$)/.test(url)) {
    return new URL(url, env.ORIGINAL_GRAPHQL_ENDPOINT).toString();
  }

  if (/^https?:\/\//i.test(url)) {
    // Compose's browser-facing *.localhost alias is not a native transport
    // endpoint (iOS ATS rejects it). In development, fetch backend product
    // images through the same configured origin already used by native GraphQL.
    // External CDN URLs, browser URLs and release builds retain their origin.
    if (typeof __DEV__ !== 'undefined' && __DEV__ && Platform.OS !== 'web') {
      try {
        const image = new URL(url);
        if (
          image.hostname.endsWith('.localhost') &&
          /^\/products\/\d+\/image$/.test(image.pathname)
        ) {
          const api = new URL(env.GRAPHQL_ENDPOINT);
          return `${api.origin}${image.pathname}${image.search}${image.hash}`;
        }
      } catch {
        return url;
      }
    }
    return url;
  }

  if (!env.IMAGE_CDN_URL) {
    return url;
  }

  return `${trimSlashes(env.IMAGE_CDN_URL)}/${trimSlashes(url)}`;
};
