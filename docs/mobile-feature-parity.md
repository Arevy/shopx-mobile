# ShopX Mobile Feature Parity Plan

This document captures the plan for bringing the React Native app (`shopx-mobile`) to feature parity with the web storefront (`shopx-frontend`). It focuses on UX scope, data requirements, Redux wiring, and platform polish priorities.

## Goals
- Deliver every customer-facing flow that exists on web: browse, search/filter, authentication, CMS, wishlist, cart, checkout, orders, profile management.
- Share a consistent visual language across native, web, and desktop builds (iconography, typography, elevated surfaces, spacing).
- Reuse the GraphQL schema and business rules from the backend while preserving offline/mock support.
- Ensure flows are testable (mock GraphQL) and documented for onboarding.

## Feature Matrix (Web vs Mobile)
| Flow | Web capabilities (`shopx-frontend`) | Current mobile state | Next steps (data & UI) |
| --- | --- | --- | --- |
| **Authentication** | Login, register, impersonation token, persisted session | Login/Register drafted in `AccountScreen`, missing impersonation + error toasts | Wire `redeemImpersonation` modal, add consistent toast feedback, persist auth metrics |
| **Catalog & Search** | Category navigation, keyword search, product detail with reviews | Home screen shows featured products; missing search & review list | Add search bar & filter drawer, hydrate reviews via `GET_PRODUCT_DETAIL` |
| **Wishlist** | Full CRUD with optimistic updates | Present but lacks empty/error states refresh | Align UI with Paper cards, add pull-to-refresh & toast feedback |
| **Cart** | Guest cart, quantity adjust, remove, clear, summary | Implemented with RTK Query; negative quantity mutation unverified | Confirm backend supports negative deltas (otherwise add `updateCartQuantity` mutation) |
| **Checkout** | Address book, payment method choice, order placement | `CheckoutScreen` scaffolded; needs validation, toasts, responsive layout | Finalize GraphQL integrations, handle errors, add placed-order deep link |
| **Orders** | Order history with totals and status badges | Orders slice created; UI shows list without status colors | Add status chips, skeleton states, pagination support when backend adds it |
| **Profile** | Update profile, change password, saved addresses, theme preference | UI in place but missing error surfacing & locale strings | Integrate toast system, add pull-to-refresh, ensure theme preference syncs with persisted UI slice |
| **CMS Pages** | Static pages accessible from nav + deep links | Drawer links to CMS stacks; detail screen present | Add hero illustration, shareable link button, skeleton while loading |
| **Checkout CMS** | Shipping, returns, etc. | Linked through CMS stack but not surfaced in checkout | Add contextual CTA linking to shipping/returns within checkout summary |
| **Server Services** | Optional REST bridge for server-side operations | Config toggles exist via `env.USE_SERVER_SERVICES` | Add toggle in developer settings screen + documentation |
| **Impersonation** | Admin token link to assume user identity | Not surfaced | Add hidden dev-only screen triggered from debug menu |

## Data & Redux Architecture
- **RTK Query endpoints** already cover the core operations. Remaining tasks:
  - Ensure every mutation updates local cache or dispatches matching slice reducers (`orders`, `cart`, `wishlist`, `session`).
  - Remove legacy mock fallbacks; surface backend errors with actionable UI feedback and retry affordances.
  - Define a lightweight contract test suite (recorded GraphQL fixtures) to validate client assumptions without bundling mock state.
- **Redux slices**:
  - `ordersSlice`: decide whether to persist (likely no, treat as server source of truth). Provide selectors for list, lastUpdated.
  - Evaluate splitting authentication into `session` (token/user) and `account` (context, addresses, orders) slices for clearer caching.
  - Add UI slice properties for global toasts, loading overlays, and feature flags (search enabled, checkout experimental, etc.).
- **Navigation**:
  - `Cart` is a stack housing `CartHome` + `Checkout`; ensure linking config maps drawer quick link to `HomeTabs > Cart > Checkout`.
  - Introduce a modal stack for impersonation/login fallback to mirror web route transitions.

## UI / UX Guidelines
- Adopt Material 3 spacing and elevations from the shared theme (`theme/tokens`). Keep primary/secondary colors aligned with web tokens.
- Use `react-native-vector-icons/Feather` + `MaterialCommunityIcons` and rely on the module-provided fonts (pods/Gradle handle mobile; `web/index.tsx` injects them for the web shell).
- Build reusable form building blocks:
  - `AddressFormFields` (present) → add locale-driven labels, validation helper text.
  - Authentication inputs with `TextInput.Icon` for visibility toggle.
  - `SummaryRow`, `StatusChip` components for checkout/orders.
- Accessibility: define `accessibilityLabel`/`accessibilityRole` for interactive elements, respect dynamic font sizes, provide focus outlines on web.
- Animations: leverage `react-native-reanimated` for bottom tab transitions and checkout success states; keep subtle to avoid perf hits.

## Testing & QA Strategy
- Add integration tests (Jest + React Native Testing Library) for checkout and account flows using RTK Query's `setupListeners` with fixture-based responses.
- E2E smoke tests (Detox) covering login -> browse -> add to cart -> checkout -> view orders against a seeded backend or local fixture server.
- Snapshot coverage for navigation drawers and checkout summary to detect layout regressions.

## Documentation Updates
- Extend `README.md` “Running the app” with troubleshooting for Xcode’s Ruby requirement (`chruby` fix) and icon font linking steps (already noted).
- Document backend port expectations (`GRAPHQL_ENDPOINT` vs dev proxy) and how to align Android reverse tunnel commands.
- Provide onboarding checklist in `/docs/onboarding.md` (pending) referencing this parity roadmap.

## Open Questions / Risks
- Backend API contract for cart quantity decrements (negative delta) needs confirmation.
- Do we persist orders locally or always refetch? (Impact on offline experience.)
- Impersonation support on mobile: should it live behind a dev flag or user-accessible?
- Payment methods beyond `CARD`/`TRANSFER`/`CASH` (Apple Pay / Google Pay) require native modules—out of scope for parity but note as enhancement.

## Next Milestones
1. Finalize data flow decisions (cart decrement mutation, orders caching) and extend mocks.
2. Implement remaining UI polish (icons, skeleton loaders, error toasts).
3. Add automated tests & documentation per sections above.
