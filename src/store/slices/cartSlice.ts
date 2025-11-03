import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

import type {Cart, CartItem} from '@/types/cart';

export type CartState = {
  items: CartItem[];
  total: number;
  lastSyncedAt?: string;
};

const initialState: CartState = {
  items: [],
  total: 0,
  lastSyncedAt: undefined,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart(state, action: PayloadAction<Cart>) {
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.lastSyncedAt = new Date().toISOString();
    },
    upsertItem(state, action: PayloadAction<CartItem>) {
      const existingIndex = state.items.findIndex(
        item => item.product.id === action.payload.product.id,
      );

      if (existingIndex >= 0) {
        state.items[existingIndex] = action.payload;
      } else {
        state.items.push(action.payload);
      }

      state.total = state.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        item => item.product.id !== action.payload,
      );
      state.total = state.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );
    },
    clearCart(state) {
      state.items = [];
      state.total = 0;
      state.lastSyncedAt = undefined;
    },
  },
});

export const {setCart, upsertItem, removeItem, clearCart} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
