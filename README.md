# ShopX React Native, web, and desktop

The shared iOS, Android, browser, and Electron app, built with **React Native 0.82.1, React 19.1.1, and TypeScript**. Application data is read and changed through the ShopX GraphQL backend; runtime flows do not use GraphQL mocks.

State: **Redux Toolkit, RTK Query, and redux-persist/AsyncStorage**. Navigation: React Navigation 7. UI: React Native Paper, themes, and Feather/MaterialCommunityIcons. Languages: **en, ro, fr, de, ar, he**. Native builds use Hermes and the new Fabric/TurboModules architecture.

## Run this repository independently

This repository owns its source, lockfile, Dockerfile, tests, and [standalone Compose configuration](compose.yaml). It does not require the parent ShopX directory or sibling checkouts. Other services are accessed through configurable network endpoints and must implement the expected GraphQL/API contract; a different API schema requires a client adapter.

From this repository, create the private container configuration only if it does not already exist:

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` for your external services, then run:

```bash
docker compose --env-file .env.docker up -d --build --wait
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs --tail 80
docker compose --env-file .env.docker down
```

The standalone project has its own Compose name. Change `APP_PORT` if the workspace stack already occupies the default host port. `host.docker.internal` reaches services published on the host; `localhost` inside a container refers to that container. Use a reachable hostname for remote APIs/databases. Do not copy private environment files into images.

By default this starts only RN web. Add `--profile native` before `up` to start Metro as well, or start only Metro with `docker compose --env-file .env.docker --profile native up -d --build metro`. Native builds and the Electron window still run on the host. Set `GRAPHQL_ENDPOINT` to a compatible backend; no sibling source checkout is needed.

In the full local workspace, use the parent `docker-compose.yml` / `node scripts/compose.mjs up` instead. It orchestrates shared dependencies and configures service DNS centrally; it does not merge these Git repositories or require their standalone Compose projects to run alongside it.

## Start in the workspace

Use **Node 22.x** to align with the backend. This repository has both `yarn.lock` and `package-lock.json`; workspace instructions use Yarn Classic. Do not update both lockfiles incidentally during installation.

From this repository:

```bash
cd ..
node scripts/compose.mjs up
```

The [workspace README](../README.md) explains services and containers. `../scripts/` contains local workspace tools and is not included in a standalone clone. This command also starts storefront/admin. RN web runs at `http://localhost:8083` or `http://mobile.shopx.localhost`, with Metro on 8081. Do not start a second Metro with `npm start`.

The backend uses **`oracle19 / ORCLCDB / AREVY`** and persistent Compose Redis database 1. The previous `clever_wilson` Redis is separate. RN does not connect directly to either service. Accounts belong to the active database; sign in again after database recovery or switching Redis instances.

The [backend SQL guide](../e-commerce-backend/README.md#schema-and-sql-script) distinguishes the demo reset from normal startup. SQL corrections and cart quantity operations were tested in a temporary Oracle schema; `AREVY` was neither reset nor migrated. Diagnose app connectivity through the endpoints/proxies and ports below.

### Starter data and local accounts

The backend's [general-store pack](../e-commerce-backend/docs/data-seeding.md) adds persisted tech, home and lifestyle products, CMS pages and customer scenarios without changing the recovered records. Redux/RTK Query continues to consume real GraphQL responses on every platform; the pack is not a runtime mock fallback. Data installation belongs to the backend and is separate from client startup.

Use the two new `CUSTOMER` profiles listed in the workspace's private `../docs/local-accounts.private.md` to explore saved addresses, cart, wishlist and order history. The same accounts work across clients configured for the same backend. `SUPPORT` accounts are for the admin portal; naming one a general administrator does not create a global platform role. Standalone clones configure their own backend and credentials and do not require this private workspace file.

Compose builds one Linux image shared by webpack and Metro. Both mount `src/`; the web server also mounts `web/`. Webpack proxies GraphQL to `http://backend:4000/graphql`, while browsers use `/graphql` on their own origin.

**iOS/Android builds and Electron run on the Mac**. Install local dependencies with `yarn install --frozen-lockfile`, then use the native commands below. Docker does not replace Xcode, CocoaPods, Android SDK, or Electron.

During Compose verification on October 11, 2026, RN web loaded the catalog through `mobile.shopx.localhost` without uncaught JavaScript exceptions. Metro generated the iOS bundle with HTTP 200; a new native build was not needed for that server check. Metro runs non-interactively with two workers; automatic DevTools opening from the container was not verified.

## Catalog and visual identity

The app shares the graphite/lime identity with the storefront and admin. [Theme tokens](src/theme/index.ts) provide coordinated Paper/navigation colors; a new profile starts in dark mode, while existing saved light/system preferences remain intact. Theme-aware text, forms and surfaces also cover account, checkout, CMS, wishlist and product details.

The catalog renders one to four columns according to available width, with complete product photos on a white stage, accessible wishlist actions, translated VAT labels and locale-aware EUR prices. Search retains focus while results update. **Load more** retrieves additional real backend products beyond the initial 24; there is no replacement mock catalog. The same components serve native, web and Electron.

The backend owns product imagery, descriptions and dated VAT-inclusive retail reference prices. Its explicit catalog importer preserves commerce history. Existing order/payment amounts have not been converted from another currency. Theme and client code remain local to this repository so it can run independently.

## Configuration

For a new checkout, copy `.env.example` to `.env` only if `.env` does not already exist. Basic local settings:

```dotenv
GRAPHQL_ENDPOINT=http://localhost:4000/graphql
SITE_NAME=ShopX
USE_SERVER_SERVICES=false
SERVER_SERVICES_BASE_PATH=/api/serverSideServices
```

- `GRAPHQL_ENDPOINT` is the native backend destination and the webpack proxy target during development.
- `IMAGE_CDN_URL` is optional. Product images use URLs returned by GraphQL; the current backend serves Oracle images at `/products/:id/image`.
- `USE_SERVER_SERVICES=true` replaces the endpoint path with `SERVER_SERVICES_BASE_PATH/graphql`. `/api/serverSideServices/graphql` belongs to the Next.js storefront, not Express. Keep this `false` when targeting port 4000 directly.
- `SERVER_SERVICES_TOKEN`, if set here, is included in the client/bundle. Do not place a private administrative credential in RN/web configuration.
- Native values are compiled through `react-native-config`; rebuild after changing them. Restart webpack after changing web/desktop development configuration.
- On a physical iPhone, `localhost` means the phone. Use the Mac's LAN address for API/Metro and allow network access. The iOS simulator can reach the Mac's local services. Compose requires LAN binding as described in the workspace README when connecting over Wi-Fi.

## Platforms and commands

Run these from `shopx-mobile` with the backend available. While Compose is running, `npm start` and `npm run web` are alternatives for host debugging, not additional setup steps: stop the corresponding Compose service first. `npm run desktop` uses the separate port 8082.

| Command | Purpose |
| --- | --- |
| `npm start` | Metro on 8081; keep it running separately or use Compose |
| `npm run ios` | Build and launch iOS; the script disables automatic Metro startup |
| `npm run android` | Build/install Android through React Native CLI |
| `npm run web` | Webpack development at `http://localhost:8083` |
| `npm run desktop` | Start webpack on 8082, then Electron |
| `npm run web:build` | Production bundle in `web/dist/` |
| `npm run desktop:build` | Web build plus electron-builder; artifacts in `dist-desktop/` |

`WEB_PORT` and `WEB_HOST` override the development port/interface; the host default is `127.0.0.1`. Avoid starting duplicate Metro or web servers.

### iOS

Install Xcode, the selected simulator runtime, Ruby/Bundler, and CocoaPods. Ruby dependencies are recorded in `Gemfile` and `Gemfile.lock`.

```bash
bundle install
cd ios
bundle exec pod install --no-repo-update
cd ..
npm run ios
```

Metro must already be running. To select a simulator explicitly:

```bash
xcrun simctl list devices available
npm run ios -- --udid <UDID>
```

The current configuration uses Hermes/Fabric and a minimum iOS version of 15.1. The Podfile also raises resource-bundle deployment targets to React Native's minimum.

On this Mac, the existing Bundler installation uses Ruby 3.1.2 from rbenv. If the shell reports `chruby: unknown Ruby: ruby-3.1.2`, check the active Ruby manager: chruby does not automatically discover rbenv installations. For this existing installation, from `ios/`:

```bash
PATH="$HOME/.rbenv/versions/3.1.2/bin:$PATH" bundle exec pod install --no-repo-update
```

Local Xcode 27 compatibility is implemented through:

- [fmt_compatibility.rb](ios/fmt_compatibility.rb): a targeted fmt 11.0.2 fix applied during `pod install`.
- [AppDelegate.mm](ios/shopxMobile/AppDelegate.mm) and [Info.plist](ios/shopxMobile/Info.plist): `ShopxSceneDelegate` and the scene manifest.
- [CLI 20 patch](patches/@react-native-community+cli-platform-apple+20.0.0.patch): detects `Simulator.app` or `DeviceHub.app`; `postinstall` runs `patch-package`.

Reevaluate these compatibility changes when upgrading RN/fmt/CLI. Keep the default Xcode build directory for `run-ios`: the verified CLI 20 configuration looked there for installation even when `--buildFolder` pointed elsewhere.

### Android and local ports

[android/build.gradle](android/build.gradle) requires compile/target SDK 36, Build Tools **36.0.0**, NDK **27.1.12297006**, and minimum API 24. Use a JDK/Android Studio setup compatible with the project's Gradle version. `npx react-native doctor` checks tools, not app-to-API connectivity.

With an emulator or USB device connected, keep each command on **one line**:

```bash
adb devices
adb reverse tcp:8081 tcp:8081
adb reverse tcp:4000 tcp:4000
adb reverse --list
npm run android
```

8081 is Metro; 4000 is the backend. Forwarding one does not forward the other. The current directory (`ios/`, `android/`, or repository root) does not change ADB's behavior. Reapply rules after device restarts; with multiple devices, use `adb -s <serial> reverse ...` for the intended device.

If doctor reports SDK `N/A`, check `ANDROID_HOME` and Build Tools 36.0.0 in SDK Manager. A successful build or Metro connection does not establish GraphQL reachability; check port 4000 separately. Routine ADB forwarding does not require adding `sudo` to these commands.

### Web and Electron

During development, the browser sends GraphQL to the window origin (`localhost:8083` or `127.0.0.1:8083`). Webpack forwards it to `GRAPHQL_ENDPOINT` from `.env` or the process environment. Seeing port 8083 in the client console is expected; the Node/webpack process must reach the backend on 4000. webpack-dev-server 5 requires `devServer.proxy` to be an array, as in the current [webpack configuration](web/webpack.config.js).

Electron development uses the same mechanism on 8082. Its launcher reads `WEB_PORT`, `WEB_HOST`, `WEB_PROTOCOL`, and `ELECTRON_START_URL` from the process environment. Export overrides in the shell; the desktop launcher does not read `.env` itself.

Electron enables `contextIsolation`, disables `nodeIntegration`, and sandboxes the renderer. New windows are denied and their URLs are passed to the system browser. These settings do not constitute a complete security audit.

Production embeds `GRAPHQL_ENDPOINT` into the build. The development proxy is not included: configure a reachable endpoint and CORS for the deployment. Packaged Electron loads `web/dist/index.html` through `file://`; installer behavior and asset loading in that mode have not been verified.

### Reload and developer tools

Host Metro prints the shortcuts supported by the installed CLI: `r` reloads connected apps, `d` opens the developer menu, and `j` opens DevTools when a supported browser is available. This interactive workflow does not apply to Compose's non-interactive Metro terminal.

Use the simulator/device developer menu to reload a native app; on an attached Android device, `adb shell input keyevent 82` requests that menu. Webpack provides HMR for web and desktop. Browser/Electron reload remains available when a full refresh is needed. Do not clean native build folders as a routine JavaScript reload step.

## Features and Redux

- Home/catalog: products, categories, search, and product details with review lists.
- Account: login/registration, profile/password updates, address creation, and order history.
- Cart/wishlist: backend data changed through RTK Query and reflected in Redux slices.
- CMS: published page list and detail screens.
- Checkout: order creation and payment registration; selecting a method does not execute a bank transaction.
- Settings: locally persisted language and theme.

[shopxGraphqlApi.ts](src/services/graphql/shopxGraphqlApi.ts) owns operations and the Bearer token. The [store](src/store/index.ts) persists session, cart, wishlist, UI preferences, and only `pendingCheckout` from the orders slice; RTK Query cache is not persisted.

`getWishlist` returns `{userId, products}`. The API extracts `products`, and persistence migration version 1 normalizes the older AsyncStorage shape. Clearing all storage is not required to apply this migration.

If payment fails after a known order was created, checkout retains its ID and can retry payment registration. A lost order-creation response still requires backend idempotency. Payments remain **PENDING**; addresses are saved in the profile without an order snapshot. Complete storefront parity is not claimed; see the [feature parity plan](docs/mobile-feature-parity.md).

### Translations and UI conventions

[src/i18n/index.ts](src/i18n/index.ts) combines the six locale packs with [commerceResources.ts](src/i18n/commerceResources.ts). Keep new keys available in every supported language and use [useAppTranslation](src/hooks/useAppTranslation.ts) rather than scattering user-visible literals. Redux persists language/theme preferences. Translation-key tests validate coverage, not linguistic quality or RTL layout.

Use the existing [theme](src/theme), reusable components, navigation types, and icons when adding screens. Deep-link configuration and complete accessibility checks remain work to verify; the presence of navigation stacks alone does not establish external-link support.

## Icons and troubleshooting

- Feather and MaterialCommunityIcons are supplied through native integration and [web/index.tsx](web/index.tsx). The Paper provider resolves icon names using the appropriate font.
- For `Multiple commands produce ... Feather.ttf` / `MaterialCommunityIcons.ttf`, check duplicated Xcode resources. Do not add manual Copy Bundle Resources entries on top of CocoaPods' font copies.
- For squares on web, check font requests/loading and the glyph name. A successful build or DOM render alone does not establish that icons display.
- For `Electron ENOENT`, `npm rebuild electron` restores the installed version's binary.
- For a confirmed stale Metro cache, restart with `npm start -- --reset-cache`. Normal startup does not require deleting Pods/build/cache directories.
- If iOS shows product text but blank images in local Compose development, inspect the image URL. `resolveImageUrl` maps backend `/products/:id/image` URLs on `*.localhost` to the configured native GraphQL origin in development, retaining version queries. This avoids ATS rejecting the browser-facing alias. Browser, external CDN and release URLs are unchanged; production needs a reachable HTTPS asset origin.
- For backend failures, first check `http://localhost:4000/health/ready`, then the platform's endpoint and ADB/proxy ports.

## Checks and distribution

| Command | Scope |
| --- | --- |
| `npm run typecheck` | TypeScript without a build |
| `npm test` | 15 tests: wishlist migration/validation, six-language keys, icons, image URLs, platform identity and locale preferences |
| `npm run test:watch` | The same Node tests in watch mode |
| `npm run lint` | ESLint, allowing no warnings |
| `npm run prettier` | Prettier check for `src/` |
| `npm run lint:fix`, `npm run prettier:fix` | Apply code/formatting changes |

On October 12, 2026, the factory milestone passed all 15 tests, TypeScript, `npm run lint` and explicit ESLint checks for the platform/image tests. The earlier catalog milestone also removed the unused `Product` import. Tests run with `node --test`, not Jest/RNTL, even though those packages are dependencies.

Workspace `../scripts/browser-smoke.cjs` checks RN web in Chrome; `../scripts/desktop-smoke.cjs` opens Electron against port 8083 using a temporary profile. Checkout smoke tests require valid SUPPORT credentials and create QA data. API smoke and all four starter-account checks pass against recovered `AREVY`, including the RN web proxy. Chrome also passed login, wishlist/reload, both icon fonts and retry after a lost payment response without creating a second order. The [workspace verification record](../docs/development-status.md) records current Chrome, Electron and iOS simulator checks separately; browser/API results do not establish physical-device behavior.

### Release build commands

These commands describe build paths, not verified releases. Configure signing and production endpoints first.

Android, from `android/`:

```bash
./gradlew :app:assembleDebug
./gradlew :app:bundleRelease
./gradlew :app:assembleRelease
```

Release AAB/APK distribution requires the appropriate keystore and signing configuration.

For iOS, from `ios/`, with signing configured:

```bash
xcodebuild -workspace shopxMobile.xcworkspace -scheme shopxMobile -configuration Release -sdk iphoneos -archivePath build/shopxMobile.xcarchive archive
xcodebuild -exportArchive -archivePath build/shopxMobile.xcarchive -exportOptionsPlist ExportOptions.plist -exportPath build/Release
```

The repository does **not** provide a ready-to-use `ExportOptions.plist`; create it for the intended signing/distribution method before the export command.

Web uses `npm run web:build`. Serve `web/dist/` with suitable SPA routing, HTTPS, and an accessible backend. Desktop uses `npm run desktop:build`, writing to `dist-desktop/`; electron-builder uses `desktop/resources` for build resources. Signing/notarization and packaged installers have not been validated.

The [workspace verification record](../docs/development-status.md) distinguishes builds, browsers, simulators, and remaining limitations.

## Code organization

| Directory | Responsibility |
| --- | --- |
| [src/app](src/app) | Bootstrap and global providers |
| [src/components](src/components) | Shared UI primitives, forms, and feature widgets |
| [src/config](src/config) | Environment validation and runtime configuration |
| [src/hooks](src/hooks) | Reusable app hooks |
| [src/i18n](src/i18n) | Translation setup and locale catalogs |
| [src/navigation](src/navigation) | Navigators and typed route parameters |
| [src/screens](src/screens) | Feature screens |
| [src/graphql](src/graphql), [src/services](src/services) | GraphQL documents and RTK Query transport |
| [src/store](src/store) | Redux slices and persistence |
| [src/theme](src/theme), [src/utils](src/utils) | Theme and formatting/image helpers |
| `web/`, `desktop/`, `ios/`, `android/` | Platform integration |

## Connecting to an independent managed platform

A platform-specific build can set `PLATFORM_ID=sx_<12 hex characters>` together with its own reachable `GRAPHQL_ENDPOINT`. Keep the two values paired; a managed client waits for the backend's matching `/platform-config` before mounting commerce screens. A mismatch or initial outage shows an unavailable state and retries periodically instead of mounting against another business.

The public configuration is stored in a Redux slice and refreshed on foreground entry and a 30-second interval while active. Business names are used in the header/drawer/document title, and dark-theme colors map to React Native Paper/navigation. The configured locale supplies the default while preserving explicit user language choices. Session, cart, wishlist, UI and pending-checkout persistence keys are prefixed with the configured platform ID. A build without `PLATFORM_ID` retains the previous storage keys and behavior.

Managed product URLs such as `/api/products/1/image` resolve against that build's backend, even when an unrelated image CDN is configured. Images, products, orders and accounts continue to come from the backend; there is no mock catalog.

This adapter does not publish native applications or create signing identities. The first factory provider deploys storefront/admin/API/Redis/gateway; RN web, native and Electron distribution remain separate build/deployment tasks. Its generated gateway is bound to host loopback and routes by hostname, so a native device needs an explicitly reachable hostname/gateway setup; changing only the port with `adb reverse` does not supply that virtual host. Do not point a platform ID at the original shared ShopX API as a workaround.
