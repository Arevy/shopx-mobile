const formatter = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

export const formatCurrency = (value: number): string => formatter.format(value);
