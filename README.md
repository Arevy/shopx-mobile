# ShopX Mobile

ShopX Mobile delivers the ShopX commerce experience on iOS, Android, the browser, and desktop. The app runs on **React Native 0.82 / React 19**, ships with the new Fabric + TurboModules architecture, and consumes the ShopX GraphQL API through Redux Toolkit Query. All code is written in TypeScript.

## Supported platforms
- **iOS / Android** · native builds via Xcode and Gradle (Hermes enabled by default).
- **Web** · single-page bundle powered by React Native Web + webpack (port 8082 by default).
- **Desktop** · hardened Electron shell that wraps the web bundle with context isolation and no Node integration in the renderer.

## Tech stack quick view
- State & data: Redux Toolkit, RTK Query, redux-persist (AsyncStorage).
- UI: React Navigation 7 (stack, bottom tabs, drawer) + React Native Paper 5.
- Native modules: AsyncStorage, react-native-config, device-info, gesture-handler, reanimated, safe-area-context, screens, vector-icons.
- Internationalisation: i18next with the shared ShopX locale packs.

## Project layout
```
src/
  app/        bootstrap & global providers
  components/ shared UI primitives & feature widgets
  config/     runtime configuration schema (Zod + env bridge)
  hooks/      reusable hooks (theme, bootstrap, debounced helpers)
  i18n/       i18next setup and locale catalogues
  navigation/ navigators, typed params, drawer/bottom tab wiring
  screens/    feature screens (Home, Cart, Wishlist, Account, CMS, Settings)
  services/   RTK Query API client
  store/      Redux slices, persistence wiring
  theme/      Material Design 3 theme tokens
  utils/      formatting helpers, image resolvers, etc.
```

## Getting started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment variables**
   ```bash
   cp .env.example .env
   # update GRAPHQL_ENDPOINT, IMAGE_CDN_URL, SITE_NAME, etc.
   ```
   For Android emulators, keep the host as `localhost` and run `adb reverse tcp:4000 tcp:4000` (and any extra ports) to reach locally running services.
   - `USE_GRAPHQL_MOCKS=1` enables the curated offline dataset when the GraphQL API is not available. Leave it unset (default) to talk to the real backend.
3. **iOS prerequisites**
   ```bash
   cd ios
   bundle install
   RCT_NEW_ARCH_ENABLED=1 bundle exec pod install
   cd ..
   ```

## Running the app
| Command | Description |
| --- | --- |
| `npm run ios` | Build and launch on the selected iOS simulator / device. |
| `npm run android` | Build and launch on the active Android emulator / device. |
| `npm start` | Standalone Metro bundler (auto-starts with platform commands). |
| `npm run web` | Start the web dev server on `http://localhost:8082` (override with `WEB_PORT`). |
| `npm run desktop` | Run the Electron shell against the web dev server. |

## Live reload & developer shortcuts
- **iOS Simulator** · Press `⌘ + R` to reload JS, `⌘ + ⇧ + K` in Xcode to clean builds, or hit `i` in the Metro terminal to boot the last-used simulator.
- **Android Emulator** · Tap `R` twice to reload, `⌘ + M` / `Ctrl + M` to open the dev menu, or hit `a` in the Metro terminal to launch the default emulator.
- **Physical devices** · Shake the device (or run `adb shell input keyevent 82` on Android) to surface the dev menu, then choose *Reload*. Keep Metro running via `npm start`.
- **Web & Desktop** · Webpack dev server supports HMR; reload with `⌘ + R` in the browser, Electron reloads automatically when the web bundle recompiles.

## Building for production
- **Android**
  ```bash
  cd android
  ./gradlew bundleRelease   # Google Play AAB
  ./gradlew assembleRelease # stand-alone APK
  ```
  Configure your keystore + signing config before distributing.

- **iOS**
  ```bash
  cd ios
  xcodebuild -workspace shopxMobile.xcworkspace \
             -scheme shopxMobile \
             -configuration Release \
             -sdk iphoneos \
             -archivePath build/shopxMobile.xcarchive archive
  xcodebuild -exportArchive \
             -archivePath build/shopxMobile.xcarchive \
             -exportOptionsPlist ExportOptions.plist \
             -exportPath build/Release
  ```

- **Web**
  ```bash
  npm run web:build
  ```
  Bundles are emitted to `web/dist`. Deploy the contents behind HTTPS and configure the same GraphQL endpoint the mobile app uses.

- **Desktop**
  ```bash
  npm run desktop:build
  ```
  The packaged apps land in `dist-desktop/`. Supply platform icons under `desktop/resources` before notarising/signing.

## Additional scripts
| Command | Description |
| --- | --- |
| `npm run lint` / `npm run lint:fix` | ESLint checks with optional autofix. |
| `npm run typecheck` | TypeScript validation (`--noEmit`). |
| `npm run prettier` / `npm run prettier:fix` | Format verification / write. |
| `npm test` | Currently stubbed while Jest support is updated for React 19. |

## Platform tips
- Hermes is enabled by default. Toggle it per platform (`android/gradle.properties` and `ios/Podfile`) if you need JSC for debugging native modules.
- To clear caches between runs, use `npm start -- --reset-cache` and wipe `watchman`, `$TMPDIR/metro-*`, and platform-specific build folders (`./gradlew clean`, `xcodebuild clean`).
- The desktop shell enforces context isolation, denies `window.open`, and opens external URLs in the system browser to keep the renderer sandboxed.
- Enable `USE_GRAPHQL_MOCKS=1` in your `.env` while the backend is offline; the app will serve the bundled demo catalogue, CMS pages, cart, and wishlist data across all platforms.
