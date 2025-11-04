import type {Address} from '@/types/address';
import type {Cart} from '@/types/cart';
import type {CmsPage} from '@/types/cms';
import type {Order} from '@/types/order';
import type {Payment} from '@/types/order';
import type {Category, Product, Review} from '@/types/product';
import type {UserContext} from '@/types/userContext';
import type {AuthPayload, User} from '@/types/user';

export type GetProductsQuery = {
  getProducts: Product[];
};

export type GetProductsVariables = {
  limit?: number;
  offset?: number;
  name?: string;
  categoryId?: string;
};

export type GetProductDetailQuery = {
  product: Product | null;
  reviews: Review[];
};

export type GetProductDetailVariables = {
  id: string;
};

export type GetCategoriesQuery = {
  getCategories: Category[];
};

export type GetCartQuery = {
  getCart: Cart;
};

export type GetCartVariables = {
  userId: string;
};

export type AddToCartMutation = {
  addToCart: Cart;
};

export type AddToCartVariables = {
  userId: string;
  productId: string;
  quantity: number;
};

export type RemoveFromCartMutation = {
  removeFromCart: Cart;
};

export type RemoveFromCartVariables = {
  userId: string;
  productId: string;
};

export type ClearCartMutation = {
  clearCart: Cart;
};

export type ClearCartVariables = {
  userId: string;
};

export type GetWishlistQuery = {
  getWishlist: Product[];
};

export type GetWishlistVariables = {
  userId: string;
};

export type AddToWishlistMutation = {
  addToWishlist: Product[];
};

export type AddToWishlistVariables = {
  userId: string;
  productId: string;
};

export type RemoveFromWishlistMutation = {
  removeFromWishlist: Product[];
};

export type RemoveFromWishlistVariables = {
  userId: string;
  productId: string;
};

export type RegisterMutation = {
  register: User;
};

export type RegisterVariables = {
  email: string;
  password: string;
  name?: string;
};

export type LoginMutation = {
  login: AuthPayload;
};

export type LoginVariables = {
  email: string;
  password: string;
};

export type LogoutMutation = {
  logout: boolean;
};

export type RedeemImpersonationMutation = {
  redeemImpersonation: AuthPayload;
};

export type RedeemImpersonationVariables = {
  token: string;
};

export type GetUserContextQuery = {
  getUserContext: UserContext;
};

export type GetUserContextVariables = {
  userId: string;
};

export type CreateOrderMutation = {
  createOrder: Order;
};

export type CreateOrderVariables = {
  userId: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
};

export type AddAddressMutation = {
  addAddress: Address;
};

export type AddAddressVariables = {
  userId: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

export type GetAddressesQuery = {
  getAddresses: Address[];
};

export type GetAddressesVariables = {
  userId: string;
};

export type CreatePaymentMutation = {
  createPayment: Payment;
};

export type CreatePaymentVariables = {
  orderId: string;
  amount: number;
  method: string;
};

export type GetOrdersQuery = {
  getOrders: Order[];
};

export type GetOrdersVariables = {
  userId: string;
};

export type UpdateUserProfileMutation = {
  updateUserProfile: {
    user: User;
    message?: string | null;
  };
};

export type UpdateUserProfileVariables = {
  input: {
    name?: string | null;
    email?: string;
    currentPassword: string;
  };
};

export type ChangeUserPasswordMutation = {
  changeUserPassword: boolean;
};

export type ChangeUserPasswordVariables = {
  currentPassword: string;
  newPassword: string;
};

export type GetCmsPageQuery = {
  getCmsPage: CmsPage | null;
};

export type GetCmsPageVariables = {
  slug: string;
};

export type GetCmsPagesQuery = {
  getCmsPages: CmsPage[];
};

export type EmptyObject = Record<string, never>;
