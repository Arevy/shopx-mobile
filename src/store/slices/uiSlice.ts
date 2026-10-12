import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

import type {SupportedLanguage} from '@/i18n';
import {i18n} from '@/i18n';
import {refreshPlatform} from './platformSlice';

export type ThemePreference = 'light' | 'dark' | 'system';

export type UIState = {
  theme: ThemePreference;
  language: SupportedLanguage;
  languageExplicit?: boolean;
  hasCompletedOnboarding: boolean;
};

const initialState: UIState = {
  theme: 'dark',
  language: i18n.language as SupportedLanguage,
  hasCompletedOnboarding: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<SupportedLanguage>) {
      state.language = action.payload;
      state.languageExplicit = true;
    },
    setHasCompletedOnboarding(state, action: PayloadAction<boolean>) {
      state.hasCompletedOnboarding = action.payload;
    },
  },
  extraReducers: builder =>
    builder.addCase(refreshPlatform.fulfilled, (state, action) => {
      if (action.payload && !state.languageExplicit) {
        state.language = action.payload.locale as SupportedLanguage;
      }
    }),
});

export const {setTheme, setLanguage, setHasCompletedOnboarding} =
  uiSlice.actions;
export const uiReducer = uiSlice.reducer;
