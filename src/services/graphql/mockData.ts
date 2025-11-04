import type {Address} from '@/types/address';
import type {Cart} from '@/types/cart';
import type {CmsPage} from '@/types/cms';
import type {Product, Category, Review} from '@/types/product';
import type {User} from '@/types/user';
import type {UserContext} from '@/types/userContext';

const baseUpdatedAt = '2024-04-18T10:00:00.000Z';

export const mockCategories: Category[] = [
  {
    id: 'cat-electronics',
    name: 'Electronice',
    description: 'Gadgeturi premium pentru un stil de viata conectat.',
  },
  {
    id: 'cat-fashion',
    name: 'Fashion',
    description: 'Imbracaminte si accesorii minimaliste.',
  },
  {
    id: 'cat-home',
    name: 'Smart Home',
    description: 'Dispozitive inteligente pentru confort zilnic.',
  },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-aurora-watch',
    name: 'Ceas inteligent Aurora X',
    price: 349.99,
    description: 'Monitorizare avansata a sanatatii cu autonomie de 3 zile.',
    categoryId: 'cat-electronics',
    image: {
      url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80',
      filename: 'aurora-watch.jpg',
      mimeType: 'image/jpeg',
      updatedAt: baseUpdatedAt,
    },
  },
  {
    id: 'prod-lumen-headphones',
    name: 'Castile wireless Lumen Air',
    price: 179.99,
    description: 'Sunet imersiv si anulare activa a zgomotului.',
    categoryId: 'cat-electronics',
    image: {
      url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80',
      filename: 'lumen-headphones.jpg',
      mimeType: 'image/jpeg',
      updatedAt: baseUpdatedAt,
    },
  },
  {
    id: 'prod-nexa-lamp',
    name: 'Veioza inteligenta Nexa Glow',
    price: 129.99,
    description: 'Iluminare adaptiva cu control vocal si scenarii presetate.',
    categoryId: 'cat-home',
    image: {
      url: 'https://images.unsplash.com/photo-1481278403982-f2d9f387cdcc?auto=format&fit=crop&w=800&q=80',
      filename: 'nexa-lamp.jpg',
      mimeType: 'image/jpeg',
      updatedAt: baseUpdatedAt,
    },
  },
  {
    id: 'prod-atelier-jacket',
    name: 'Jacheta Atelier CloudShell',
    price: 249.0,
    description: 'Haina impermeabila cu finisaj mat si captuseala termica.',
    categoryId: 'cat-fashion',
    image: {
      url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
      filename: 'atelier-jacket.jpg',
      mimeType: 'image/jpeg',
      updatedAt: baseUpdatedAt,
    },
  },
];

export const mockReviews: Review[] = [
  {
    id: 'rev-aurora-1',
    productId: 'prod-aurora-watch',
    userId: 'demo-user',
    rating: 5,
    reviewText: 'Autonomie excelenta si aplicatie intuitiva.',
    createdAt: '2024-03-22T09:00:00.000Z',
  },
  {
    id: 'rev-lumen-1',
    productId: 'prod-lumen-headphones',
    userId: 'demo-user',
    rating: 4,
    reviewText: 'Sunet de calitate, dar as fi vrut o baterie mai incapatoare.',
    createdAt: '2024-02-14T12:30:00.000Z',
  },
];

export const mockAddresses: Address[] = [
  {
    id: 'addr-demo-1',
    userId: 'demo-user',
    street: 'Strada Academiei 10',
    city: 'Bucuresti',
    postalCode: '010011',
    country: 'Romania',
  },
  {
    id: 'addr-demo-2',
    userId: 'demo-user',
    street: 'Strada Bratei 5',
    city: 'Cluj-Napoca',
    postalCode: '400129',
    country: 'Romania',
  },
];

export const mockUser: User = {
  id: 'demo-user',
  email: 'demo@shopx.app',
  name: 'Demo User',
  role: 'CUSTOMER',
};

export const mockCmsPages: CmsPage[] = [
  {
    id: 'cms-shipping',
    slug: 'politica-de-livrare',
    title: 'Politica de livrare',
    excerpt: 'Afla cum livram produsele ShopX in toata tara.',
    body: 'Livram produsele in 1-3 zile lucratoare prin curier rapid. Toate comenzile peste 400 RON beneficiaza de transport gratuit.',
    status: 'PUBLISHED',
    publishedAt: '2024-01-11T08:00:00.000Z',
    updatedAt: baseUpdatedAt,
  },
  {
    id: 'cms-returns',
    slug: 'politica-de-retur',
    title: 'Politica de retur',
    excerpt: 'Retur facil in 30 de zile, fara batai de cap.',
    body: 'Acceptam retururi in 30 de zile pentru produse in stare impecabila. Solicita returul din contul tau sau scrie-ne pe support@shopx.app.',
    status: 'PUBLISHED',
    publishedAt: '2024-01-15T08:30:00.000Z',
    updatedAt: '2024-04-02T16:45:00.000Z',
  },
  {
    id: 'cms-about',
    slug: 'despre-shopx',
    title: 'Despre ShopX',
    excerpt: 'ShopX combina designul atent cu tehnologia moderna.',
    body: 'Suntem o echipa din Bucuresti pasionata de ecommerce. Selectam produse curate, cu utilitate reala, de la branduri independente europene.',
    status: 'PUBLISHED',
    publishedAt: '2024-01-05T07:15:00.000Z',
    updatedAt: '2024-03-01T12:20:00.000Z',
  },
];

export const mockWishlistProducts: Product[] = [
  mockProducts[1],
  mockProducts[3],
];

export const mockCart: Cart = {
  userId: mockUser.id,
  total: Number(
    (mockProducts[0].price + mockProducts[2].price * 2).toFixed(2),
  ),
  items: [
    {
      product: mockProducts[0],
      quantity: 1,
    },
    {
      product: mockProducts[2],
      quantity: 2,
    },
  ],
};

const cloneValue = <T>(value: T): T => {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

export const cloneProducts = (): Product[] => cloneValue(mockProducts);
export const cloneCategories = (): Category[] => cloneValue(mockCategories);
export const cloneCmsPages = (): CmsPage[] => cloneValue(mockCmsPages);
export const cloneReviews = (): Review[] => cloneValue(mockReviews);
export const cloneAddresses = (): Address[] => cloneValue(mockAddresses);

export const createCart = (userId?: string): Cart => {
  const targetUserId = userId ?? mockCart.userId;
  return {
    userId: targetUserId,
    total: mockCart.total,
    items: mockCart.items.map(item => ({
      quantity: item.quantity,
      product: cloneValue(item.product),
    })),
  };
};

export const createWishlist = (): Product[] =>
  mockWishlistProducts.map(product => cloneValue(product));

export const createUserContext = (userId?: string): UserContext => {
  const finalUserId = userId ?? mockUser.id;
  return {
    user: {...mockUser, id: finalUserId},
    cart: createCart(finalUserId),
    wishlist: {
      userId: finalUserId,
      products: createWishlist(),
    },
    addresses: mockAddresses.map(address => ({
      ...address,
      userId: finalUserId,
    })),
  };
};

export const findCmsPage = (slug?: string | null): CmsPage | null => {
  if (!slug) {
    return null;
  }
  const page = mockCmsPages.find(candidate => candidate.slug === slug);
  return page ? cloneValue(page) : null;
};

export const findProduct = (id?: string | null): Product | null => {
  if (!id) {
    return null;
  }
  const product = mockProducts.find(candidate => candidate.id === id);
  return product ? cloneValue(product) : null;
};
