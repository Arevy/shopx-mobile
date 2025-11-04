import {createApi} from '@reduxjs/toolkit/query/react';
import {graphqlRequestBaseQuery} from '@rtk-query/graphql-request-base-query';

import {
  ADD_ADDRESS,
  ADD_TO_CART,
  ADD_TO_WISHLIST,
  CLEAR_CART,
  CREATE_ORDER,
  CREATE_PAYMENT,
  GET_ADDRESSES,
  GET_CART,
  GET_CATEGORIES,
  GET_CMS_PAGE,
  GET_CMS_PAGES,
  GET_PRODUCT_DETAIL,
  GET_PRODUCTS,
  GET_USER_CONTEXT,
  GET_WISHLIST,
  LOGIN,
  LOGOUT,
  REDEEM_IMPERSONATION,
  REGISTER,
  REMOVE_FROM_CART,
  REMOVE_FROM_WISHLIST,
} from '@/graphql';
import {env} from '@/config/env';
import {
  cloneAddresses,
  cloneCategories,
  cloneCmsPages,
  cloneProducts,
  cloneReviews,
  createCart,
  createUserContext,
  createWishlist,
  findCmsPage,
  findProduct,
} from '@/services/graphql/mockData';
import type {RootState} from '@/store';
import type {
  AddAddressMutation,
  AddAddressVariables,
  AddToCartMutation,
  AddToCartVariables,
  AddToWishlistMutation,
  AddToWishlistVariables,
  ClearCartMutation,
  ClearCartVariables,
  CreateOrderMutation,
  CreateOrderVariables,
  CreatePaymentMutation,
  CreatePaymentVariables,
  GetAddressesQuery,
  GetAddressesVariables,
  GetCartQuery,
  GetCartVariables,
  GetCategoriesQuery,
  GetCmsPageQuery,
  GetCmsPageVariables,
  GetCmsPagesQuery,
  GetProductDetailQuery,
  GetProductDetailVariables,
  GetProductsQuery,
  GetProductsVariables,
  GetUserContextQuery,
  GetUserContextVariables,
  GetWishlistQuery,
  GetWishlistVariables,
  LoginMutation,
  LoginVariables,
  LogoutMutation,
  RedeemImpersonationMutation,
  RedeemImpersonationVariables,
  RegisterMutation,
  RegisterVariables,
  RemoveFromCartMutation,
  RemoveFromCartVariables,
  RemoveFromWishlistMutation,
  RemoveFromWishlistVariables,
} from '@/services/graphql/types';
import {setCart, clearCart} from '@/store/slices/cartSlice';
import {setSession, clearSession, updateUser} from '@/store/slices/sessionSlice';
import {setWishlist, clearWishlist} from '@/store/slices/wishlistSlice';

const graphqlBaseQuery = graphqlRequestBaseQuery({
  url: env.GRAPHQL_ENDPOINT,
  prepareHeaders: (headers, {getState}) => {
    const state = getState() as RootState;
    if (state.session?.token) {
      headers.set('authorization', `Bearer ${state.session.token}`);
    }
    if (env.USE_SERVER_SERVICES && env.SERVER_SERVICES_TOKEN) {
      headers.set('x-shopx-services-token', env.SERVER_SERVICES_TOKEN);
    }
    return headers;
  },
});

type GraphqlBaseQueryFn = typeof graphqlBaseQuery;
type GraphqlBaseQueryArgs = Parameters<GraphqlBaseQueryFn>[0];

const OPERATION_NAME_REGEX = /\b(query|mutation)\s+([A-Za-z0-9_]+)/;

const extractOperationName = (document: unknown): string | null => {
  if (typeof document === 'string') {
    const match = document.match(OPERATION_NAME_REGEX);
    return match?.[2] ?? null;
  }
  if (
    document &&
    typeof document === 'object' &&
    'definitions' in document &&
    Array.isArray((document as {definitions?: unknown[]}).definitions)
  ) {
    const definitions = (document as {
      definitions?: Array<{name?: {value?: string}}>;
    }).definitions;
    for (const definition of definitions ?? []) {
      const nameValue = definition?.name?.value;
      if (typeof nameValue === 'string') {
        return nameValue;
      }
    }
  }
  return null;
};

const getOperationNameFromArgs = (
  args: GraphqlBaseQueryArgs,
): string | null => {
  if (!args || typeof args !== 'object') {
    return null;
  }
  const document = (args as {document?: unknown}).document;
  return document ? extractOperationName(document) : null;
};

const getVariables = (args: GraphqlBaseQueryArgs): Record<string, unknown> => {
  if (!args || typeof args !== 'object') {
    return {};
  }
  const variables = (args as {variables?: Record<string, unknown>}).variables;
  return variables ?? {};
};

const mockOperationHandlers: Record<
  string,
  (args: GraphqlBaseQueryArgs) => unknown
> = {
  GetProducts: args => {
    const variables = getVariables(args) as Partial<GetProductsVariables>;
    const source = cloneProducts();
    let filtered = source;

    if (variables?.categoryId) {
      filtered = filtered.filter(
        product => product.categoryId === variables.categoryId,
      );
    }

    if (variables?.name && variables.name.trim().length > 0) {
      const normalized = variables.name.trim().toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(normalized),
      );
    }

    const offset = variables?.offset ?? 0;
    const limit =
      typeof variables?.limit === 'number' && variables.limit > 0
        ? variables.limit
        : filtered.length;
    const paged = filtered.slice(offset, offset + limit);

    return {
      getProducts: paged,
    };
  },
  GetProductDetail: args => {
    const variables = getVariables(args) as Partial<GetProductDetailVariables>;
    const productId = variables?.id ?? null;
    return {
      product: findProduct(productId),
      reviews: cloneReviews().filter(
        review => review.productId === productId,
      ),
    };
  },
  GetCategories: () => ({
    getCategories: cloneCategories(),
  }),
  GetCmsPages: () => ({
    getCmsPages: cloneCmsPages(),
  }),
  GetCmsPage: args => {
    const variables = getVariables(args) as Partial<GetCmsPageVariables>;
    return {
      getCmsPage: findCmsPage(variables?.slug ?? null),
    };
  },
  GetCart: args => {
    const variables = getVariables(args) as Partial<GetCartVariables>;
    return {
      getCart: createCart(variables?.userId),
    };
  },
  GetWishlist: () => ({
    getWishlist: createWishlist(),
  }),
  GetUserContext: args => {
    const variables = getVariables(args) as Partial<GetUserContextVariables>;
    return {
      getUserContext: createUserContext(variables?.userId),
    };
  },
  GetAddresses: () => ({
    getAddresses: cloneAddresses(),
  }),
};

const notifiedMockOperations = new Set<string>();

const baseQueryWithMockFallback: GraphqlBaseQueryFn = async (
  args,
  api,
  extraOptions,
) => {
  const operationNameFromArgs = getOperationNameFromArgs(args);
  let result: Awaited<ReturnType<GraphqlBaseQueryFn>>;

  try {
    result = await graphqlBaseQuery(args, api, extraOptions);
  } catch (caughtError) {
    if (!env.USE_GRAPHQL_MOCKS) {
      throw caughtError;
    }

    if (__DEV__) {
      console.warn(
        '[shopxGraphqlApi] Network exception encountered',
        caughtError,
      );
    }

    if (!operationNameFromArgs) {
      throw caughtError;
    }

    const handler = mockOperationHandlers[operationNameFromArgs];
    if (!handler) {
      throw caughtError;
    }

    if (!notifiedMockOperations.has(operationNameFromArgs)) {
      console.warn(
        `[shopxGraphqlApi] Falling back to mock data for ${operationNameFromArgs} because the GraphQL service is unavailable.`,
      );
      notifiedMockOperations.add(operationNameFromArgs);
    }

    const data = handler(args);
    return {data};
  }

  if (env.USE_GRAPHQL_MOCKS && result.error) {
    console.warn('[shopxGraphqlApi] Network error encountered', result.error);
  }
  if (!env.USE_GRAPHQL_MOCKS || !result.error) {
    return result;
  }

  if (!operationNameFromArgs) {
    return result;
  }

  const handler = mockOperationHandlers[operationNameFromArgs];
  if (!handler) {
    return result;
  }

  if (!notifiedMockOperations.has(operationNameFromArgs)) {
    console.warn(
      `[shopxGraphqlApi] Falling back to mock data for ${operationNameFromArgs} because the GraphQL service is unavailable.`,
    );
    notifiedMockOperations.add(operationNameFromArgs);
  }

  try {
    const data = handler(args);
    return {data};
  } catch (mockError) {
    console.warn(
      `[shopxGraphqlApi] Mock handler for ${operationNameFromArgs} failed.`,
      mockError,
    );
    return result;
  }
};

export const shopxGraphqlApi = createApi({
  reducerPath: 'shopxGraphqlApi',
  baseQuery: baseQueryWithMockFallback,
  tagTypes: [
    'Product',
    'Category',
    'Cart',
    'Wishlist',
    'Session',
    'Order',
    'Address',
    'Cms',
  ],
  endpoints: builder => ({
    getProducts: builder.query<GetProductsQuery['getProducts'], GetProductsVariables>({
      query: variables => ({
        document: GET_PRODUCTS,
        variables,
      }),
      providesTags: result =>
        result
          ? [
              ...result.map(({id}) => ({type: 'Product' as const, id})),
              {type: 'Product' as const, id: 'LIST'},
            ]
          : [{type: 'Product' as const, id: 'LIST'}],
      transformResponse: (response: GetProductsQuery) => response.getProducts,
    }),
    getProductDetail: builder.query<
      GetProductDetailQuery,
      GetProductDetailVariables
    >({
      query: variables => ({
        document: GET_PRODUCT_DETAIL,
        variables,
      }),
      providesTags: result =>
        result?.product
          ? [{type: 'Product', id: result.product.id}]
          : [{type: 'Product', id: 'UNKNOWN'}],
    }),
    getCategories: builder.query<GetCategoriesQuery['getCategories'], void>({
      query: () => ({
        document: GET_CATEGORIES,
      }),
      transformResponse: (response: GetCategoriesQuery) => response.getCategories,
      providesTags: [{type: 'Category', id: 'LIST'}],
    }),
    getCart: builder.query<GetCartQuery['getCart'], GetCartVariables>({
      query: variables => ({
        document: GET_CART,
        variables,
      }),
      providesTags: [{type: 'Cart', id: 'CURRENT'}],
      transformResponse: (response: GetCartQuery) => response.getCart,
      async onQueryStarted(_arg, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          dispatch(setCart(data));
        } catch (error) {
          console.warn('Failed to hydrate cart', error);
        }
      },
    }),
    addToCart: builder.mutation<AddToCartMutation['addToCart'], AddToCartVariables>({
      query: variables => ({
        document: ADD_TO_CART,
        variables,
      }),
      invalidatesTags: [{type: 'Cart', id: 'CURRENT'}],
    }),
    removeFromCart: builder.mutation<
      RemoveFromCartMutation['removeFromCart'],
      RemoveFromCartVariables
    >({
      query: variables => ({
        document: REMOVE_FROM_CART,
        variables,
      }),
      invalidatesTags: [{type: 'Cart', id: 'CURRENT'}],
    }),
    clearCart: builder.mutation<
      ClearCartMutation['clearCart'],
      ClearCartVariables
    >({
      query: variables => ({
        document: CLEAR_CART,
        variables,
      }),
      invalidatesTags: [{type: 'Cart', id: 'CURRENT'}],
    }),
    getWishlist: builder.query<
      GetWishlistQuery['getWishlist'],
      GetWishlistVariables
    >({
      query: variables => ({
        document: GET_WISHLIST,
        variables,
      }),
      providesTags: [{type: 'Wishlist', id: 'CURRENT'}],
      transformResponse: (response: GetWishlistQuery) => response.getWishlist,
      async onQueryStarted(_arg, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          dispatch(setWishlist(data));
        } catch (error) {
          console.warn('Failed to hydrate wishlist', error);
        }
      },
    }),
    addToWishlist: builder.mutation<
      AddToWishlistMutation['addToWishlist'],
      AddToWishlistVariables
    >({
      query: variables => ({
        document: ADD_TO_WISHLIST,
        variables,
      }),
      invalidatesTags: [{type: 'Wishlist', id: 'CURRENT'}],
    }),
    removeFromWishlist: builder.mutation<
      RemoveFromWishlistMutation['removeFromWishlist'],
      RemoveFromWishlistVariables
    >({
      query: variables => ({
        document: REMOVE_FROM_WISHLIST,
        variables,
      }),
      invalidatesTags: [{type: 'Wishlist', id: 'CURRENT'}],
    }),
    register: builder.mutation<
      RegisterMutation['register'],
      RegisterVariables
    >({
      query: variables => ({
        document: REGISTER,
        variables,
      }),
      invalidatesTags: [{type: 'Session', id: 'CURRENT'}],
      transformResponse: (response: RegisterMutation) => response.register,
      async onQueryStarted(_arg, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          dispatch(setSession(data));
        } catch (error) {
          console.warn('register mutation failed', error);
        }
      },
    }),
    login: builder.mutation<LoginMutation['login'], LoginVariables>({
      query: variables => ({
        document: LOGIN,
        variables,
      }),
      invalidatesTags: [
        {type: 'Session', id: 'CURRENT'},
        {type: 'Cart', id: 'CURRENT'},
        {type: 'Wishlist', id: 'CURRENT'},
      ],
      transformResponse: (response: LoginMutation) => response.login,
      async onQueryStarted(_arg, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          dispatch(setSession(data));
        } catch (error) {
          console.warn('login mutation failed', error);
        }
      },
    }),
    logout: builder.mutation<LogoutMutation['logout'], void>({
      query: () => ({
        document: LOGOUT,
      }),
      invalidatesTags: [
        {type: 'Session', id: 'CURRENT'},
        {type: 'Cart', id: 'CURRENT'},
        {type: 'Wishlist', id: 'CURRENT'},
      ],
      transformResponse: (response: LogoutMutation) => response.logout,
      onQueryStarted: async (_arg, {dispatch, queryFulfilled}) => {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearSession());
          dispatch(clearCart());
          dispatch(clearWishlist());
        }
      },
    }),
    redeemImpersonation: builder.mutation<
      RedeemImpersonationMutation['redeemImpersonation'],
      RedeemImpersonationVariables
    >({
      query: variables => ({
        document: REDEEM_IMPERSONATION,
        variables,
      }),
      invalidatesTags: [{type: 'Session', id: 'CURRENT'}],
      transformResponse: (response: RedeemImpersonationMutation) =>
        response.redeemImpersonation,
      async onQueryStarted(_arg, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          dispatch(setSession(data));
        } catch (error) {
          console.warn('redeem impersonation failed', error);
        }
      },
    }),
    getUserContext: builder.query<
      GetUserContextQuery['getUserContext'],
      GetUserContextVariables
    >({
      query: variables => ({
        document: GET_USER_CONTEXT,
        variables,
      }),
      providesTags: [
        {type: 'Session', id: 'CURRENT'},
        {type: 'Cart', id: 'CURRENT'},
        {type: 'Wishlist', id: 'CURRENT'},
      ],
      transformResponse: (response: GetUserContextQuery) => response.getUserContext,
      async onQueryStarted(_arg, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          dispatch(setCart(data.cart));
          dispatch(setWishlist(data.wishlist.products));
          dispatch(updateUser(data.user));
        } catch (error) {
          console.warn('Failed to hydrate user context', error);
        }
      },
    }),
    createOrder: builder.mutation<
      CreateOrderMutation['createOrder'],
      CreateOrderVariables
    >({
      query: variables => ({
        document: CREATE_ORDER,
        variables,
      }),
      invalidatesTags: [
        {type: 'Cart', id: 'CURRENT'},
        {type: 'Order', id: 'LIST'},
      ],
      transformResponse: (response: CreateOrderMutation) => response.createOrder,
    }),
    addAddress: builder.mutation<
      AddAddressMutation['addAddress'],
      AddAddressVariables
    >({
      query: variables => ({
        document: ADD_ADDRESS,
        variables,
      }),
      invalidatesTags: [
        {type: 'Address', id: 'LIST'},
        {type: 'Session', id: 'CURRENT'},
      ],
      transformResponse: (response: AddAddressMutation) => response.addAddress,
    }),
    getAddresses: builder.query<
      GetAddressesQuery['getAddresses'],
      GetAddressesVariables
    >({
      query: variables => ({
        document: GET_ADDRESSES,
        variables,
      }),
      providesTags: [{type: 'Address', id: 'LIST'}],
      transformResponse: (response: GetAddressesQuery) => response.getAddresses,
    }),
    createPayment: builder.mutation<
      CreatePaymentMutation['createPayment'],
      CreatePaymentVariables
    >({
      query: variables => ({
        document: CREATE_PAYMENT,
        variables,
      }),
      invalidatesTags: [{type: 'Order', id: 'CURRENT'}],
      transformResponse: (response: CreatePaymentMutation) =>
        response.createPayment,
    }),
    getCmsPage: builder.query<GetCmsPageQuery['getCmsPage'], GetCmsPageVariables>(
      {
        query: variables => ({
          document: GET_CMS_PAGE,
          variables,
        }),
        providesTags: result =>
          result
            ? [{type: 'Cms', id: result?.id ?? 'PAGE'}]
            : [{type: 'Cms', id: 'PAGE'}],
        transformResponse: (response: GetCmsPageQuery) => response.getCmsPage,
      },
    ),
    getCmsPages: builder.query<GetCmsPagesQuery['getCmsPages'], void>({
      query: () => ({
        document: GET_CMS_PAGES,
      }),
      providesTags: [{type: 'Cms', id: 'LIST'}],
      transformResponse: (response: GetCmsPagesQuery) => response.getCmsPages,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailQuery,
  useGetCategoriesQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRedeemImpersonationMutation,
  useGetUserContextQuery,
  useCreateOrderMutation,
  useAddAddressMutation,
  useGetAddressesQuery,
  useCreatePaymentMutation,
  useGetCmsPageQuery,
  useGetCmsPagesQuery,
} = shopxGraphqlApi;
