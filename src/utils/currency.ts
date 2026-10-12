import {i18n} from '@/i18n';

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat(i18n.language || 'en', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
