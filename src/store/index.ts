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
} from 'redux-persist';

import {shopxGraphqlApi} from '@/services/graphql/shopxGraphqlApi';
import {cartReducer} from '@/store/slices/cartSlice';
import {sessionReducer} from '@/store/slices/sessionSlice';
import {uiReducer} from '@/store/slices/uiSlice';
import {wishlistReducer} from '@/store/slices/wishlistSlice';
import {ordersReducer} from '@/store/slices/ordersSlice';

const sessionPersistConfig = {
  key: 'session',
  storage: AsyncStorage,
};

const cartPersistConfig = {
  key: 'cart',
  storage: AsyncStorage,
};

const wishlistPersistConfig = {
  key: 'wishlist',
  storage: AsyncStorage,
};

const uiPersistConfig = {
  key: 'ui',
  storage: AsyncStorage,
  whitelist: ['theme', 'language'],
};

const rootReducer = combineReducers({
  session: persistReducer(sessionPersistConfig, sessionReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  wishlist: persistReducer(wishlistPersistConfig, wishlistReducer),
  ui: persistReducer(uiPersistConfig, uiReducer),
  orders: ordersReducer,
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
