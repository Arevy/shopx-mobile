# ShopX Mobile

ShopX Mobile is the native companion to the ShopX web experience. It is built with **React Native 0.82 (React 19)**, runs on the new Fabric/TurboModules architecture out of the box, and consumes the same GraphQL API exposed by the backend via Redux Toolkit + RTK Query. The codebase is 100 % TypeScript.

## Tech stack at a glance
- React Native 0.82.1 · React 19.1 · Hermes (switchable to JSC per platform).
- Redux Toolkit, RTK Query and `redux-persist` (AsyncStorage) for state/cache.
- React Navigation 7 (stack + bottom tabs + drawer) and React Native Paper 5.14 for UI.
- i18next with the shared `Common/Page_*` locale bundles (EN, RO, FR, DE, AR, HE) plus mobile copy.
- Native modules: AsyncStorage, react-native-config, react-native-device-info, gesture-handler, reanimated, safe-area-context, screens, vector-icons.

## Project layout
```
src/
  app/          # app bootstrap & providers (Redux, Paper, Navigation, persist)
  components/   # shared UI (core/product)
  config/       # environment schema (Zod + react-native-config)
  graphql/      # shared queries/mutations + normalisers used across clients
  hooks/        # theme, auth bootstrap, debounced helpers, i18n bridge
  i18n/         # config + locale resources
  navigation/   # navigators & typed params
  screens/      # feature screens (Home, Cart, Wishlist, Account, CMS, Settings…)
  services/     # RTK Query API client
  store/        # Redux Toolkit slices/persist setup
  theme/        # MD3 theme definitions
  utils/        # helpers (currency, images, etc.)
```

## Prerequisites
- Node.js ≥ 20 (nvm recommended).
- JDK 17–20 (Temurin on macOS works well).
- Android Studio Koala (2024.1.1) or newer with SDK + platform-tools in `PATH`.
- Xcode 15+, Ruby 3.1 + CocoaPods ≥ 1.15 for iOS.
- Watchman (macOS) for fast reloads.
- `npx react-native doctor` should report only adb issues when no device is attached.

## Quick start
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment**
   ```bash
   cp .env.example .env
   # update GRAPHQL_ENDPOINT, IMAGE_CDN_URL, SITE_NAME, optional Redis settings
   ```
   For Android emulators, `10.0.2.2` points to the host (`adb reverse tcp:4000 tcp:4000` is handy for local services).
3. **iOS**
   ```bash
   cd ios
   bundle install
   RCT_NEW_ARCH_ENABLED=1 bundle exec pod install
   cd ..
   npm run ios
   ```
4. **Android**
   ```bash
   npm run android
   ```
   The Gradle wrapper targets 8.13. If you drive the build from the terminal, ensure `JAVA_HOME` points to JDK 17 and `ANDROID_HOME` exposes `platform-tools` & `emulator`.
5. **Metro bundler (if you need it standalone)**
   ```bash
   npm start
   ```

## Useful scripts
| Script | Purpose |
| --- | --- |
| `npm run ios` / `npm run android` | Build & launch on the selected platform |
| `npm start` | Start Metro bundler |
| `npm run lint` / `npm run lint:fix` | ESLint checks & autofix |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm run prettier` / `npm run prettier:fix` | Formatting check / write |
| `npm test` | Currently stubbed while Jest support is updated for React 19 |

## Notes
- Hermes is enabled on both platforms by default. Flip `hermesEnabled=false` in `android/gradle.properties` or `:hermes_enabled => false` in `ios/Podfile` if you need JSC.
- The codebase already contains mocks/config for Jest (`jest.config.js`, `jest.setup.ts`), ready to re-enable once React 19-compatible testing libraries are in place.
- When running on the Android emulator against a local backend, either use `10.0.2.2` in `.env` or keep `localhost` and run `adb reverse` for the relevant ports.

## Build & release tips
- **Android release**
  ```bash
  cd android
  ./gradlew bundleRelease   # generates AAB in android/app/build/outputs/bundle/release
  ./gradlew assembleRelease # generates APK in android/app/build/outputs/apk/release
  ```
  Configure a signing config inside `android/app/build.gradle` (replace the debug keystore) and set your `gradle.properties` secrets before uploading to the Play Console.

- **iOS release**
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
  For App Store builds, manage signing in Xcode or through `fastlane gym`. Make sure the Release scheme has Hermes enabled/disabled as desired, and that the `ExportOptions.plist` matches your provisioning settings.

- **Cleaning between releases**
  ```bash
  cd android && ./gradlew clean && cd ..
  cd ios && xcodebuild -workspace shopxMobile.xcworkspace \
            -scheme shopxMobile \
            -configuration Release \
            clean && cd ..
  watchman watch-del-all && rm -rf $TMPDIR/metro-* && rm -rf $TMPDIR/react-*
  ```
  Clear Metro caches (`npm start -- --reset-cache`) if you see stale bundles during CI builds.
