import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

import type {AuthPayload, User} from '@/types/user';

export type SessionState = {
  token?: string;
  user?: User;
  hydrated: boolean;
};

const initialState: SessionState = {
  token: undefined,
  user: undefined,
  hydrated: false,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthPayload>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    updateUser(state, action: PayloadAction<User>) {
      if (!state.token) {
        return;
      }
      state.user = action.payload;
    },
    clearSession(state) {
      state.token = undefined;
      state.user = undefined;
    },
    setHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
  },
});

export const {setSession, updateUser, clearSession, setHydrated} =
  sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
