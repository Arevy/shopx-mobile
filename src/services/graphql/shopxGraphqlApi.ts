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
  GET_ORDERS,
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
  UPDATE_USER_PROFILE,
  CHANGE_USER_PASSWORD,
} from '@/graphql';
import {env} from '@/config/env';
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
  GetOrdersQuery,
  GetOrdersVariables,
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
  UpdateUserProfileMutation,
  UpdateUserProfileVariables,
  ChangeUserPasswordMutation,
  ChangeUserPasswordVariables,
} from '@/services/graphql/types';
import {setCart, clearCart} from '@/store/slices/cartSlice';
import {setSession, clearSession, updateUser} from '@/store/slices/sessionSlice';
import {setWishlist, clearWishlist} from '@/store/slices/wishlistSlice';
import {setOrders, clearOrders} from '@/store/slices/ordersSlice';

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

export const shopxGraphqlApi = createApi({
  reducerPath: 'shopxGraphqlApi',
  baseQuery: graphqlBaseQuery,
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
          dispatch(clearOrders());
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
    getOrders: builder.query<GetOrdersQuery['getOrders'], GetOrdersVariables>({
      query: variables => ({
        document: GET_ORDERS,
        variables,
      }),
      providesTags: [{type: 'Order', id: 'LIST'}],
      transformResponse: (response: GetOrdersQuery) => response.getOrders,
      async onQueryStarted(_arg, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          dispatch(setOrders(data));
        } catch (error) {
          console.warn('Failed to hydrate orders', error);
        }
      },
    }),
    updateUserProfile: builder.mutation<
      UpdateUserProfileMutation['updateUserProfile'],
      UpdateUserProfileVariables
    >({
      query: variables => ({
        document: UPDATE_USER_PROFILE,
        variables,
      }),
      invalidatesTags: [{type: 'Session', id: 'CURRENT'}],
      transformResponse: (response: UpdateUserProfileMutation) =>
        response.updateUserProfile,
      async onQueryStarted(_arg, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          if (data?.user) {
            dispatch(updateUser(data.user));
          }
        } catch (error) {
          console.warn('updateUserProfile failed', error);
        }
      },
    }),
    changeUserPassword: builder.mutation<
      ChangeUserPasswordMutation['changeUserPassword'],
      ChangeUserPasswordVariables
    >({
      query: variables => ({
        document: CHANGE_USER_PASSWORD,
        variables,
      }),
      transformResponse: (response: ChangeUserPasswordMutation) =>
        response.changeUserPassword,
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
  useGetOrdersQuery,
  useUpdateUserProfileMutation,
  useChangeUserPasswordMutation,
  useCreateOrderMutation,
  useAddAddressMutation,
  useGetAddressesQuery,
  useCreatePaymentMutation,
  useGetCmsPageQuery,
  useGetCmsPagesQuery,
} = shopxGraphqlApi;
