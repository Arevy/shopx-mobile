import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

import type {Order} from '@/types/order';

export type OrdersState = {
  list: Order[];
  lastUpdatedAt?: string;
  pendingCheckout?: Order;
};

const initialState: OrdersState = {
  list: [],
  lastUpdatedAt: undefined,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<Order[]>) {
      state.list = action.payload;
      state.lastUpdatedAt = new Date().toISOString();
    },
    clearOrders(state) {
      state.list = [];
      state.lastUpdatedAt = undefined;
      state.pendingCheckout = undefined;
    },
    setPendingCheckout(state, action: PayloadAction<Order | undefined>) {
      state.pendingCheckout = action.payload;
    },
  },
});

export const {setOrders, clearOrders, setPendingCheckout} = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
