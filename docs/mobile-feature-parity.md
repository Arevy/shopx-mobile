# ShopX mobile feature parity plan

Reviewed against current source on October 11, 2026. This plan compares `shopx-mobile` with `shopx-frontend`, retains the original UX/data direction, and separates implemented behavior from proposals. Complete parity is not yet verified. See the [RN README](../README.md) for setup and the [workspace record](../../docs/development-status.md) for test evidence.

## Goals

- Cover customer flows available in the storefront: browsing, search/filtering, authentication, CMS, wishlist, cart, checkout, orders, and profile management.
- Maintain a consistent visual language across native, web, and desktop: iconography, typography, surfaces, and spacing.
- Use real backend GraphQL data and business rules. Runtime mock/offline commerce fallbacks were removed at the user's request; do not reintroduce them.
- Test failure and recovery paths. Isolated test doubles/fixtures are acceptable in tests, but are not application data or proof of backend integration.

## Feature matrix

| Flow | Storefront reference | Current RN implementation | Remaining work or verification |
| --- | --- | --- | --- |
| Authentication | Login, registration, persisted identity, session refresh | Account login/register/logout and Bearer sessions | Broader expired-session/error UX tests; consistent cross-platform feedback |
| Catalog/search | Categories, search, product details, reviews | Debounced search, category filtering, detail screen, and review list | Audit filter parity, pagination expectations, responsive layouts, and review actions supported by the storefront |
| Wishlist | Guest/server data and synchronization | Backend operations, loading/error/empty states, retry, persisted-shape migration | Compare guest behavior and refresh UX; test switching accounts |
| Cart | Guest cart, quantity changes, remove/clear, summary | Authenticated RTK Query operations and Redux state; negative deltas supported by backend | Guest-cart parity, rapid repeated taps, refresh feedback, and concurrency tests |
| Checkout | Profile address selection/creation, method selection, order/payment | Integrated backend calls, validation/error state, persisted known order for payment retry | Order address snapshot, lost order-creation response, full device flow, and order-detail navigation |
| Orders | History and totals/status | Account order list and Redux orders slice | Richer status presentation, order detail, and pagination when customer API supports it |
| Profile | Profile/password changes and address book | Profile/password updates with inline feedback, address creation/list | Compare address edit/delete, refresh behavior, and all validation/error paths |
| CMS | Published content routes/navigation | CMS list/detail and drawer entry | Verify external deep links, optional sharing, loading polish, and contextual shipping/returns links in checkout |
| Settings | Language and presentation preferences | Persisted language/theme; six language packs with commerce strings | Human translation review, complete RTL behavior, accessibility |
| Server services | Optional Next.js proxy | Configuration via `USE_SERVER_SERVICES`; development webpack proxy | Keep endpoint ownership clear; a developer UI toggle is only a proposal |
| Impersonation | Storefront `/impersonate` redeems a SUPPORT-issued ticket | No RN impersonation flow is exposed | Decide whether RN needs it; validate ticket/session behavior and authorization before adding navigation |

## Data and Redux decisions

- [shopxGraphqlApi.ts](../src/services/graphql/shopxGraphqlApi.ts) handles real backend operations and session headers. Mutations must invalidate/refetch their associated data or update the matching slices; keep the backend authoritative.
- `getWishlist` returns `{userId, products}`. API normalization and the version-1 persistence migration restore an array, including old/corrupt persisted shapes.
- Session, cart, wishlist, and UI preferences are persisted. Only `orders.pendingCheckout` is persisted; order history and RTK Query cache are not. This supersedes the earlier open question about persisting the entire orders slice.
- `addToCart` accepts negative deltas. The SQL test suite exercises the real `MERGE`, including removal at zero. The earlier uncertainty about decrement support is resolved.
- RN checkout retains a known order after payment failure. Matching PENDING payment retries reuse that record. A lost order-creation response remains a separate idempotency gap.
- Consider splitting account context from session state only if actual complexity warrants it. Global toasts/loading overlays/feature flags remain design options, not implemented requirements.
- Keep contract tests separate from runtime bundles. Never silently replace a backend error with mock success.

## Navigation and UI direction

[Navigation types](../src/navigation/types.ts) define `HomeTabs > Cart > Checkout`, with `CartHome` and `Checkout` in the cart stack. Verify drawer entry and return paths against those names. There is no completed external-link mapping to treat as verified; add linking configuration and tests if that flow is introduced. A login/impersonation modal is a proposal, not an existing route.

Use the existing [theme](../src/theme) and shared forms/components for spacing, typography, and surfaces. Keep Feather/MaterialCommunityIcons aligned with the font integration in native projects and `web/index.tsx`.

[AddressFormFields](../src/components/forms/AddressFormFields.tsx) and account inputs already provide reusable form foundations. Extend locale-based validation and feedback; consider shared summary/status components where they remove duplication. Account/profile errors are surfaced today, so remaining work is consistency and coverage rather than adding error handling from scratch.

Accessibility work should cover meaningful labels/roles, text scaling, keyboard focus on web, contrast, and RTL. Optional skeletons, CMS illustrations/sharing, subtle navigation animations, and checkout success transitions should follow functional correctness and measured performance. Do not treat those proposals as existing UI features.

## Testing and QA

Current automated coverage uses `node --test`: nine checks for wishlist persistence, translation keys, and icon names. Workspace browser checks previously exercised account/checkout on a real `SHOPX_LOCAL` backend with temporary QA records. Recovered `AREVY` and Compose checks used public read-only queries; they do not prove all customer flows.

Remaining coverage:

1. Meaningful account/checkout component tests, including server errors and payment retry. Select a React Native Testing Library version compatible with the installed React/RN setup; the existing package dependency is not an operational test suite.
2. Navigation tests for cart/checkout and any newly added deep links; targeted visual checks for drawer/summary layouts rather than snapshots that only mirror markup.
3. Real-device flows: login → browse → cart → checkout → order history, against a dedicated test backend. A device automation tool such as Detox is a proposal, not a configured runner.
4. Rapid cart taps, session revocation, account switching, malformed persisted data, responsive web/Electron layouts, and complete RTL/accessibility review.

## Documentation and open decisions

The README now covers Ruby manager conflicts, CocoaPods/CLI compatibility, font duplication, web fonts, GraphQL proxy ownership, and Android reverse ports. It is the onboarding entrypoint; a separate `docs/onboarding.md` has not been created. Keep links to it out of setup instructions until it exists.

Decide whether support impersonation belongs in RN and how to expose it without weakening authorization. Customer-facing order pagination and stronger offline behavior depend on backend/product decisions. Apple Pay/Google Pay and other payment methods require provider/native integration and remain enhancements beyond current `CARD`/`TRANSFER`/`CASH` registration.

## Next milestones

1. Complete the remaining feature comparison and prioritize guest flows, address management, and checkout contract gaps.
2. Improve responsive UI, status/loading feedback, translations, and accessibility using existing components.
3. Add meaningful component/navigation/device coverage and update the verification record with the actual environment and scope tested.
