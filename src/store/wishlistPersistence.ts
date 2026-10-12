import type {Product} from '@/types/product';

// Older versions persisted the GraphQL Wishlist envelope as `items`.
export function restoreWishlistItems(value: unknown): Product[] {
  const candidate = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && 'products' in value
      ? value.products
      : undefined;
  if (!Array.isArray(candidate)) return [];
  return candidate.filter((item): item is Product =>
    !!item && typeof item === 'object' && typeof item.id === 'string' &&
    typeof item.name === 'string' && typeof item.price === 'number',
  );
}
