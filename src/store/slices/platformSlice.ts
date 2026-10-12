import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {env} from '@/config/env';

export interface PlatformConfiguration {
  platformId: string;
  revision: number;
  displayName: string;
  locale: string;
  currency: 'EUR';
  priceDisplay: 'gross';
  branding: {accent: string; background: string; surface: string};
}
export const refreshPlatform = createAsyncThunk(
  'platform/refresh',
  async () => {
    if (!env.PLATFORM_ID) {
      return null;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    let c: PlatformConfiguration;
    try {
      const response = await fetch(
        new URL('/platform-config', env.ORIGINAL_GRAPHQL_ENDPOINT).toString(),
        {signal: controller.signal},
      );
      if (!response.ok) {
        throw new Error('Platform configuration unavailable');
      }
      c = (await response.json()).configuration;
    } finally {
      clearTimeout(timer);
    }
    if (
      c?.platformId !== env.PLATFORM_ID ||
      !Number.isSafeInteger(c.revision) ||
      c.revision < 1 ||
      c.currency !== 'EUR' ||
      !['en', 'ro', 'de', 'fr', 'ar', 'he'].includes(c.locale) ||
      typeof c.displayName !== 'string' ||
      !['accent', 'background', 'surface'].every(key =>
        /^#[a-f0-9]{6}$/i.test(
          c.branding?.[key as keyof PlatformConfiguration['branding']],
        ),
      )
    ) {
      throw new Error('Platform configuration mismatch');
    }
    return c as PlatformConfiguration;
  },
);
const slice = createSlice({
  name: 'platform',
  initialState: {
    configuration: null as PlatformConfiguration | null,
    unavailable: false,
  },
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(refreshPlatform.fulfilled, (state, action) => {
        state.configuration = action.payload;
        state.unavailable = false;
      })
      .addCase(refreshPlatform.rejected, (state, action) => {
        state.unavailable = true;
        if (action.error.message === 'Platform configuration mismatch') {
          state.configuration = null;
        }
      }),
});
export const platformReducer = slice.reducer;
