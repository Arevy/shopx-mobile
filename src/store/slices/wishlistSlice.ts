import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

import type {Product} from '@/types/product';

export type WishlistState = {
  items: Product[];
};

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
    },
    addToWishlist(state, action: PayloadAction<Product>) {
      const alreadyInWishlist = state.items.some(
        product => product.id === action.payload.id,
      );
      if (!alreadyInWishlist) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter(product => product.id !== action.payload);
    },
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const {setWishlist, addToWishlist, removeFromWishlist, clearWishlist} =
  wishlistSlice.actions;
export const wishlistReducer = wishlistSlice.reducer;
