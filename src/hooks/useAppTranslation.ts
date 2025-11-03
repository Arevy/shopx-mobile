import {useCallback} from 'react';
import type {Namespace} from 'i18next';
import {useTranslation, type UseTranslationOptions} from 'react-i18next';

import {namespaces as appNamespaces} from '@/i18n';

const namespaceSet = new Set<string>(Array.from(appNamespaces));

type Options = UseTranslationOptions<Namespace | Namespace[]>;

export const useAppTranslation = (
  ns?: Namespace | Namespace[],
  options?: Options,
) => {
  const translation = useTranslation(ns as any, options as any);

  const translate = useCallback(
    (key: string, opts?: Record<string, unknown>) => {
      const hasNamespaceInOptions =
        opts && Object.prototype.hasOwnProperty.call(opts, 'ns');

      if (!hasNamespaceInOptions) {
        const dotIndex = key.indexOf('.');
        if (dotIndex > 0) {
          const maybeNamespace = key.slice(0, dotIndex);
          if (namespaceSet.has(maybeNamespace)) {
            const nestedKey = key.slice(dotIndex + 1);
            return translation.t(nestedKey, {
              ...(opts ?? {}),
              ns: maybeNamespace,
            });
          }
        }
      }

      return translation.t(key, opts as any);
    },
    [translation],
  );

  return {
    ...translation,
    t: translate as typeof translation.t,
  };
};
