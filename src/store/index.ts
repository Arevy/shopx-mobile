import {combineReducers, configureStore} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
  createMigrate,
} from 'redux-persist';

import {shopxGraphqlApi} from '@/services/graphql/shopxGraphqlApi';
import {cartReducer} from '@/store/slices/cartSlice';
import {sessionReducer} from '@/store/slices/sessionSlice';
import {uiReducer} from '@/store/slices/uiSlice';
import {wishlistReducer} from '@/store/slices/wishlistSlice';
import {restoreWishlistItems} from '@/store/wishlistPersistence';
import {ordersReducer} from '@/store/slices/ordersSlice';
import {platformReducer} from '@/store/slices/platformSlice';
import {env} from '@/config/env';
const persistenceKey = (key: string) =>
  env.PLATFORM_ID ? `${env.PLATFORM_ID}:${key}` : key;

const sessionPersistConfig = {
  key: persistenceKey('session'),
  storage: AsyncStorage,
};

const cartPersistConfig = {
  key: persistenceKey('cart'),
  storage: AsyncStorage,
};

const wishlistPersistConfig = {
  key: persistenceKey('wishlist'),
  storage: AsyncStorage,
  version: 1,
  migrate: createMigrate({
    1: state =>
      state
        ? {
            ...state,
            items: restoreWishlistItems(
              (state as unknown as {items?: unknown}).items,
            ),
          }
        : state,
  }),
};

const uiPersistConfig = {
  key: persistenceKey('ui'),
  storage: AsyncStorage,
  whitelist: ['theme', 'language', 'languageExplicit'],
};

const rootReducer = combineReducers({
  platform: platformReducer,
  session: persistReducer(sessionPersistConfig, sessionReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  wishlist: persistReducer(wishlistPersistConfig, wishlistReducer),
  ui: persistReducer(uiPersistConfig, uiReducer),
  orders: persistReducer(
    {
      key: persistenceKey('orders'),
      storage: AsyncStorage,
      whitelist: ['pendingCheckout'],
    },
    ordersReducer,
  ),
  [shopxGraphqlApi.reducerPath]: shopxGraphqlApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(shopxGraphqlApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
