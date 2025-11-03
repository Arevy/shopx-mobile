import {env} from '@/config/env';

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

export const resolveImageUrl = (url?: string | null): string | undefined => {
  if (!url) {
    return undefined;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (!env.IMAGE_CDN_URL) {
    return url;
  }

  const base = trimSlashes(env.IMAGE_CDN_URL);
  const path = trimSlashes(url);
  return `${base}/${path}`;
};
