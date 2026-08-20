# Plan 02 — Frontend: Shop UI on top of `../online-shop-next`

Status: Phases 1–4 and Final Phase all done (2026-08-21).
Scope: convert the sibling Next.js repo `../online-shop-next` (currently still a referendum/polling
frontend, same as the backend was before its shop conversion — see its `CLAUDE.md`) into the online-shop
frontend that consumes the backend built in `01-shop-domain-plan.md`. This plan assumes Phases 1–4 of that
backend plan are done (or done far enough that `swagger.json` already reflects `products`/`cart`/`orders`/
`payments`), since the frontend's API client is generated straight from that file.

Each phase is self-contained enough to run in a fresh chat context: it restates the relevant conventions,
cites exact files to mirror/replace, and ends with a manual verification checklist (this repo has no
established per-page test convention beyond the odd colocated `*.test.tsx`, mirrored where it already
exists — don't invent a new testing pattern wholesale).

---

## Phase 0 — Documentation discovery (findings, already gathered)

### What exists today in `online-shop-next` (referendum domain, to be repurposed/removed)

- **API client is generated, not hand-written** — `API_Client/client/` regenerates from
  `../online-shop-nest/swagger.json` via `yarn generate:api` (`scripts/generate-api.js`); never hand-edit
  it. `API_Client/index.ts` is the hand-written layer wrapping the generated `*Api` classes into
  `XxxAPI(acceptLanguage, accessToken)` factories (`AuthAPI`, `QuestionAPI`, `AnswerAPI`, `UserAnswerAPI`,
  `CategoriesAPI`, `FavoritesAPI`, `UserAPI`, `StatsAPI`) — each builds one axios instance with
  auth/timeout/size-limit/error interceptors. Once the backend swagger regenerates with the shop schema,
  `QuestionsApi`/`AnswerApi`/`UserAnswerApi`/`FavoritesApi`/`StatsApi` disappear and `ProductsApi`/`CartApi`/
  `OrdersApi`/`PaymentsApi` appear — `API_Client/index.ts` needs matching factories added/removed by hand
  (`generate:api` only regenerates `client/`, not this hand-written layer).
- **Auth** — `pages/api/auth/[...nextauth].ts`, `CredentialsProvider` posting to backend `/auth/login`
  plus Google/Facebook OAuth posting to `/auth/google`/`/auth/facebook`. JWT session strategy threads
  `access_token`/`role`/`id` onto `session.accessToken`/`session.user.role`/`session.user.id`. This layer is
  domain-agnostic (`UserRole` is already `admin`/`user` on the backend, unchanged by the shop conversion) —
  **keep as-is**, no changes needed for the shop domain.
- **Role gating** — `hooks/useAdminGuard.ts` (`isAdmin`, `isDenied`, `isLoading`) centralizes the admin
  check; reuse it for the admin product/order dashboard rather than re-deriving role checks per page.
- **i18n** — `next-translate` + `next-translate-routes`, locales `ka`/`en`/`ru` under `locales/{en,ka,ru}`,
  `middleware.ts` redirects `default` → `ka`. Domain-agnostic, keep as-is; only the translation *content*
  needs new keys for shop pages (see per-phase notes below).
- **Component layout convention** — `components/pages/<feature>/` (one folder per page, typically
  `index.tsx` + `style.ts` + optionally `schemas.ts` for yup/zod + colocated `*.test.tsx`),
  `components/shared/` (cross-page building blocks), `components/ui/` (atomic design-system pieces).
  Follow this exactly for every new shop page/feature.
- **Referendum-specific pages to remove once shop pages replace them**: `components/pages/askQuestion/`,
  `components/pages/questionDetail/`, and the `dashboard`/`home` pages' referendum-specific content (they
  likely need a full content swap, not deletion — `dashboard` is probably the shell that becomes the shop
  home/catalog page; confirm actual content before deciding delete-vs-repurpose, don't delete blind).
  `components/shared/QuestionCard/` → repurpose into a `ProductCard/` (or add alongside if the shapes are
  too different to share cleanly — decide once building Phase 1, don't force a premature abstraction).
- **`real-estate-application/` page** — unrelated leftover (like the backend's old `tasks` module was);
  confirm with the user whether it's still wanted before touching/removing it — out of scope for this plan
  either way, don't delete it as a side effect of shop work.
- **Path alias** `@/*` → repo root (`@/constants`, `@/API_Client`, `@/components/ui/Button`, etc.) — use it
  for all new imports, matching existing code.
- **Environments** — `Dev`/`Test`/`Preprod`/`Production` via `ENVIRONMENT`, exposed as `NEXT_PUBLIC_ENV`;
  `constants.ts` derives `API_URL`/`AUTH_URL`/`BASEPATH`/`CDN_URL` from `NEXT_PUBLIC_*` env vars — no
  changes needed here for the shop domain, just confirm `API_URL` still points at the same backend (it does,
  same repo/port, only the routes served change).

### Anti-patterns to avoid

- Don't hand-edit `API_Client/client/` — always regenerate via `yarn generate:api` against a running/built
  backend, then hand-adjust only `API_Client/index.ts`'s wrapper factories.
- Don't invent a new state-management library for cart/checkout — this codebase has no Redux/Zustand
  dependency in `package.json`; use React Context (there's already a `context/` directory — check its
  existing pattern before adding a new one) or SWR's cache (already a dependency) for cart state, matching
  what's already idiomatic here rather than introducing a new dependency.
- Don't build a payment form yourself for BOG — Phase 0 of the backend plan already established BOG has no
  server-side SDK but the actual checkout flow is a **redirect**: `PaymentsService.initiate` returns a
  `redirectUrl` (`https://payment.bog.ge/?order_id=...`), so the frontend's job is just to `POST
  /payments/:orderId/initiate` and `window.location.href = redirectUrl` (or `router.push` for an external
  URL) — then handle the `success`/`fail` redirect-back pages. Don't try to embed BOG's frontend widget
  package (`@bankofgeorgia/bog-payments-web-sdk`) unless a later iteration specifically wants an embedded
  flow instead of full-page redirect.
- Don't gate public catalog browsing behind NextAuth session checks — mirror the backend's anti-pattern
  guidance (Phase 0 of the backend plan): product listing/detail pages are public, only cart/checkout/
  order-history/admin pages require a session.
- Don't reintroduce a `matcher` export on `middleware.ts` — documented as breaking API auth callbacks
  (next-translate-routes + Next.js matcher bug). Leave that file's structure alone unless the shop work
  specifically requires touching it (it shouldn't).

---

## Phase 1 — API client regeneration + catalog browsing (products, categories) — ✅ DONE

> **Completion notes:** Backend had already dropped the referendum domain entirely (no incremental
> rollout), so the referendum-only pages/components (`askQuestion`, `questionDetail`, `QuestionCard`,
> referendum profile/admin tabs, `pages/questions/*`) were deleted as part of this phase instead of waiting
> for the Final Phase — confirmed with the user first. `home/index.tsx` was replaced outright by the new
> `components/pages/catalog/`, which now renders at `/`. Item 8 (translation keys) was skipped: this
> codebase's dashboard/home pages hardcode Georgian strings directly rather than using `next-translate`
> keys, so new pages matched that dominant convention instead. `yarn build:prod`, `tsc --noEmit`, and
> `yarn jest` all pass clean.

**What to implement**

1. Run the backend (`yarn start:dev` in `online-shop-nest`, or at least a build) far enough that
   `swagger.json` includes `products`/`category` paths from backend Phase 1, then `yarn generate:api` in
   `online-shop-next`. Confirm `API_Client/client/` gained `ProductsApi` and lost `QuestionsApi`/
   `AnswerApi`/`UserAnswerApi`/`FavoritesApi`/`StatsApi` (only if the backend plan's later phases are also
   done — otherwise those disappear incrementally per phase).
2. `API_Client/index.ts`: add `ProductsAPI(acceptLanguage, accessToken)` and `CategoriesAPI(...)` factories
   (rename backend's `CategoriesApi` if the generated class name changed — check the actual generated
   client), following the exact `createAxiosInstance` wrapping pattern already used for `AuthAPI`/etc.
   Remove the now-dead `QuestionAPI`/`AnswerAPI`/`UserAnswerAPI`/`FavoritesAPI`/`StatsAPI` factories once
   their backend modules are actually gone (don't remove speculatively before confirming via the
   regenerated client — a factory referencing a deleted class is a build break, not a graceful no-op).
3. New `components/pages/catalog/` (replaces referendum `dashboard`'s question-feed content): `index.tsx`
   fetching paginated products via `ProductsAPI`, rendering a grid; `style.ts`; reuse `components/shared/
   Pagination/` (already domain-agnostic) for the `PaginatedResponseDto` envelope's `meta`.
4. New `components/pages/productDetail/` (parallels the old `questionDetail/`'s file shape): shows a single
   product (`GET /products/:id`), price, stock, an "add to cart" action (wired to Phase 2's cart context).
5. New `components/shared/ProductCard/` (successor to `QuestionCard/`) — decide during implementation
   whether `QuestionCard` shares enough shape to repurpose in place or should be a fresh component; if
   repurposed, rename the directory and update every import site.
6. New `components/pages/adminProducts/` (mirrors `useAdminGuard`-gated dashboard patterns elsewhere in the
   app) with a simple table + create/edit form for admin CRUD (`POST`/`PUT`/`DELETE /products/:id`), gated
   by `useAdminGuard`'s `isAdmin`/`isDenied`.
7. Category filter: a simple dropdown/select (reuse `components/ui/customComponentSelect/` or
   `Dropdown/`, whichever this codebase already uses for similar filters — check current `dashboard` filter
   UI before picking) driving the catalog page's `categoryId` query param.
8. Add/replace translation keys under `locales/{en,ka,ru}` for catalog/product-detail strings; leave
   referendum-only keys (`question.*`, `answer.*`, etc.) in place until their pages are actually deleted, to
   avoid a half-broken intermediate state.

**Verification checklist**

- `yarn generate:api` completes without errors against the regenerated `swagger.json`; `yarn build` (or
  `yarn dev`) doesn't fail on a missing/renamed API class.
- `/[locale]/catalog` (or wherever routed) renders products from a real backend call, paginates correctly,
  and the category filter narrows results.
- Product detail page 404s gracefully (not a Next.js crash page) for an unknown id, matching how the
  backend 404s.
- Admin product create/edit/delete works end-to-end for a user with `role: admin`; a non-admin session
  sees `isDenied` from `useAdminGuard` instead of the form.
- No import anywhere in the app still references a deleted `QuestionsApi`/`AnswerApi`/etc. factory
  (`grep -rn "QuestionAPI\|AnswerAPI\|UserAnswerAPI\|FavoritesAPI\|StatsAPI" components pages` empty, once
  those backend modules are confirmed gone).

---

## Phase 2 — Cart — ✅ DONE

> **Completion notes:** Backend's `swagger.json` already had `cart` paths by the time this phase ran (the
> backend plan's later phases had already landed), so `API_Client/client/` already contained a generated
> `CartApi` — no `yarn generate:api` re-run was needed for this phase, only the hand-written `CartAPI`
> factory in `API_Client/index.ts`. Same as `Product`/`User`, the backend's `CartController` methods have no
> explicit `@ApiResponse({ type })`, so the generated client types them `void` — `Cart`/`CartItem` were
> hand-written in `API_Client/types.ts` (mirroring `src/cart/entities/{cart,cart-item}.entity.ts` in the
> backend repo) the same way `PaginationMetaDto`/`User` already were. `context/` had only `ThemeMode/` (a
> plain Context + hook, no reducer/library) — `CartContext` follows that exact shape. Point 5's "surface the
> 400 as an inline error via `components/ui/Alert/`" was **not** followed as written: `Alert` in this
> codebase is a full modal dialog (backed by `framer-motion`/`createPortal`), not an inline banner, and every
> existing API-error path in this codebase (catalog fetch, profile save, etc.) surfaces errors via
> `react-toastify`'s `toast.error` instead — `CartContext` matches that dominant convention rather than
> forcing `Alert` into a shape it isn't built for. `components/shared/CartIcon/` from the plan was renamed to
> `components/shared/CartButton/` to avoid colliding with the already-existing `CartIcon` in
> `components/ui/RefIcons` (used by `productDetail`'s add-to-cart button already, from Phase 1). Added a new
> `MinusIcon` to `RefIcons` (mirroring the existing `PlusIcon`) for the quantity stepper — no minus icon
> existed yet. `yarn build:prod`, `tsc --noEmit`, `yarn jest`, and `yarn lint` all pass clean (only
> pre-existing warnings in unrelated files remain).

**What to implement**

1. Cart state: check `context/`'s existing pattern first (what's already there, if anything, for
   cross-page shared state) and follow it — likely a `CartContext` exposing `cart`, `addItem`,
   `updateItemQuantity`, `removeItem`, `clear`, backed by calls to the new `CartAPI` (`GET /cart`,
   `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart`) — the cart itself
   is server-side per Phase 2 of the backend plan (one cart per authenticated user), so this context is a
   thin client cache over those calls, not the source of truth.
2. `API_Client/index.ts`: add `CartAPI(acceptLanguage, accessToken)` factory.
3. New `components/shared/CartIcon/` (or similar, in the Header) — a small badge showing item count, reused
   in `components/shared/Header/`.
4. New `components/pages/cart/`: line items (product name/image/price/quantity/subtotal), quantity
   steppers calling `updateItemQuantity`, remove buttons, a running total, and a "checkout" CTA that routes
   to Phase 3's order-creation flow. Needs an authenticated session (backend's `CartController` is
   `JwtAuthGuard`-only, no public cart) — redirect unauthenticated visitors through the existing
   `AuthModal`/login flow rather than building a new one.
5. "Add to cart" action wired into `productDetail`'s and `ProductCard`'s UI from Phase 1, calling the new
   context's `addItem`; surface the backend's 400 (`stock < quantity`) as an inline error via the existing
   `components/ui/Alert/`, not a raw thrown exception.

**Verification checklist**

- Adding a product to the cart from both the catalog grid and the detail page updates the Header badge
  count without a full page reload.
- Attempting to add more than available stock shows the backend's 400 as a user-facing message, not a
  console error / blank crash.
- Cart persists across a page refresh (it's server-backed, so a re-fetch on mount is enough — confirm the
  context actually re-fetches rather than only relying on stale client state).
- Unauthenticated visit to `/cart` prompts login rather than 401-crashing.

---

## Phase 3 — Checkout / Orders — ✅ DONE

> **Completion notes:** By the time this phase ran, the backend's `swagger.json` already had both
> `orders` *and* `payments` paths (later backend phases had already landed), so `API_Client/client/`
> already contained generated `OrdersApi`/`PaymentsApi` — no `yarn generate:api` re-run needed, only the
> hand-written `OrdersAPI`/`PaymentsAPI` factories in `API_Client/index.ts`. Same as `Cart`/`User`,
> `OrdersController`'s methods have no explicit `@ApiResponse({ type })`, so the generated client types
> them `void` — `Order`/`OrderItem`/`OrderUserSummary`/`PaymentInitiateResponse` were hand-written in
> `API_Client/types.ts` (mirroring `src/orders/entities/{order,order-item}.entity.ts` and
> `PaymentsService.initiate`'s return shape in the backend repo), following the same pattern as
> `Cart`/`CartItem`. Since the backend already had `PaymentsApi` generated too, item 2's "route straight
> into Phase 4's payment-initiation call" was implemented for real here (not stubbed) — checkout's
> submit handler creates the order then immediately calls `PaymentsAPI.paymentsControllerInitiate` and
> does a real `window.location.href` redirect, so there's no dead-end page; the `PaymentsAPI` factory
> itself was added now rather than deferred to Phase 4 (Phase 4 will still need to add the BOG
> success/fail landing pages that this phase doesn't build). Point 5's status-badge component was built
> as `components/shared/OrderStatusBadge/` (shared between the order history list, order detail, and the
> admin orders page) rather than reusing `HighlightedIcon` — no existing status-badge component matched
> the shape needed closely enough to reuse without forcing it. The admin orders page
> (`components/pages/dashboard/OrdersPage.tsx`) reuses the existing `dashboard/style.ts` building blocks
> (`QuestionsList`/`QuestionCard`/`FilterBar`/etc., the same ones `ProductsPage`/`CategoriesPage` already
> reuse under their original referendum-era names) rather than introducing a new style file, matching the
> established convention of that directory. Order history (`/orders`) and order detail (`/orders/[id]`)
> fetch client-side via `session.accessToken` (matching the `cart`/`profile` pages' convention) rather
> than `getServerSideProps`, since the backend endpoints are `JwtAuthGuard`-only and there's no public SSR
> case to optimize for. A "ჩემი შეკვეთები" (My orders) link was added to the `Header` dropdown menu so the
> new pages are actually reachable from the UI. `yarn build:prod`, `tsc --noEmit`, and `yarn jest` all pass
> clean (only pre-existing warnings in unrelated files remain).

**What to implement**

1. `API_Client/index.ts`: add `OrdersAPI(acceptLanguage, accessToken)` factory.
2. New `components/pages/checkout/`: a shipping-address form (`schemas.ts` with yup/zod validation, matching
   this codebase's existing form-validation convention — check an existing page's `schemas.ts`, e.g. under
   `register/` or `profile/`, before picking yup vs zod so both aren't used inconsistently), submitting to
   `POST /orders` (`createFromCart`). On success, route straight into Phase 4's payment-initiation call
   (checkout's "place order" and "pay now" are effectively one user action, per the backend's
   `createFromCart` → immediately-payable `PENDING` order design) — don't leave a dead intermediate page
   where an order exists but nothing prompts payment.
3. New `components/pages/orders/` (order history list, paginated via `GET /orders`) and
   `components/pages/orderDetail/` (`GET /orders/:id`) showing status, items, total, and — for a `PENDING`
   order — a "pay now" button re-entering the Phase 4 flow (covers the case where a user abandoned payment
   and returns later).
4. New `components/pages/adminOrders/` (admin-only via `useAdminGuard`): paginated list of all orders
   (`?all=true` or whatever the backend Phase 3 admin route ends up being — confirm exact route once
   backend Phase 3 lands), filter by status, and a status-update action (`PATCH /orders/:id/status`).
5. Surface `OrderStatus` values (`pending`/`paid`/`processing`/`shipped`/`delivered`/`cancelled`/`expired`)
   as translated, styled badges (reuse `components/ui/HighlightedIcon/` or similar existing status-badge
   pattern if one exists; otherwise a small new `OrderStatusBadge` under `components/shared/`).

**Verification checklist**

- Checking out with an empty cart is prevented client-side (button disabled/hidden) *and* handled
  gracefully if the backend still rejects it (400 shown, not a crash) — don't rely on the client-side guard
  alone.
- A successful checkout empties the cart (Header badge returns to 0) and lands the user on the payment
  flow, not a dead-end confirmation page with no next action.
- Order history shows correct status badges and paginates; a non-owner can't reach another user's order
  detail via a guessed URL (mirror whatever 403/404 the backend actually returns — confirm it's handled,
  not left as an unstyled error page).
- Admin order list + status update works for an admin session; hidden/blocked for a non-admin session.

---

## Phase 4 — Payments (BOG redirect flow) — ✅ DONE

> **Completion notes:** Items 1–2 (`PaymentsAPI` factory, checkout's "place order" → immediate
> `PaymentsAPI.initiate` → `window.location.href` redirect, and `orderDetail`'s "pay now" button) were
> already implemented during Phase 3 (its completion notes call this out explicitly), since the backend's
> `swagger.json` already had `payments` paths by then — no new work needed here for those two items. Item
> 3 turned out not to need brand-new pages: the backend's `BogPaymentProvider` (`src/payments/providers/
> bog-payment.provider.ts`) sets `redirect_urls.success`/`fail` to `${FRONTEND_URL}/orders/:id?payment=success`
> and `.../orders/:id?payment=fail` — i.e. BOG redirects straight back to the *existing* order-detail page
> (`pages/orders/[id].tsx` → `components/pages/orderDetail`) with a `payment` query param, not a dedicated
> success/fail route. So this phase extended `orderDetail` instead of adding new pages: on `?payment=success`
> it polls `GET /orders/:id` on a backoff schedule (1.5s/3s/5s/8s) while the order is still `pending` (the
> BOG webhook to `POST /payments/callback/bog` is async and may not have landed by the time the browser
> redirect completes), showing a "confirming payment…" banner, then either a success banner once the status
> flips off `pending`, or a "still confirming, check back" fallback if all poll attempts are exhausted without
> a status change (never a false "success" claim). On `?payment=fail` it shows a banner with a "try again"
> button (re-calls the existing `handlePayNow`, which re-initiates payment for the *same* order id — no
> duplicate order) and a "back to cart" link. New `PaymentBanner`/`PaymentBannerActions`/`PaymentBannerButton`/
> `PaymentBannerLinkButton` styled components were added to `orderDetail/style.ts`, following the existing
> `OrderStatusBadge` convention of a plain (non-transient, e.g. no `$`-prefix) `variant` prop switched in the
> template literal and existing `--ref-success-soft`/`--ref-danger-soft`/`--ref-warning-soft` CSS vars, rather
> than introducing new colors or the `$prop` transient-prop pattern this codebase doesn't otherwise use.
> `tsc --noEmit`, `yarn build:prod`, `yarn lint`, and `yarn jest` all pass clean (only pre-existing warnings
> in unrelated files remain).

**What to implement**

1. `API_Client/index.ts`: add `PaymentsAPI(acceptLanguage, accessToken)` factory.
2. Checkout success (Phase 3) or an order-detail "pay now" button calls
   `POST /payments/:orderId/initiate`, receives `{ redirectUrl }`, and full-page-redirects
   (`window.location.href = redirectUrl`) to BOG's hosted payment page — this is an external redirect, not
   client-side routing, so use a real navigation, not `next/router`'s `push`.
3. New pages for BOG's `redirect_urls.success`/`fail` (whatever `FRONTEND_URL` paths the backend Phase 4
   env vars are configured to point at — coordinate the exact path with backend Phase 4's
   `BOG_CALLBACK_URL`/redirect config before hardcoding one here): a success page that re-fetches the order
   (`GET /orders/:id`) to confirm it actually flipped to `PAID` (the redirect itself doesn't guarantee the
   backend's async callback has landed yet — poll a few times with backoff or show a "confirming payment…"
   state rather than trusting the redirect alone) and a fail page offering "try again" (re-initiates
   payment) or "back to cart".
4. No frontend work needed for the actual BOG callback (`POST /payments/callback/bog`) — that's
   server-to-server between BOG and the NestJS backend, invisible to this repo.

**Verification checklist**

- "Pay now" navigates the browser to BOG's real hosted page (`https://payment.bog.ge/?order_id=...`) for a
  sandbox order — confirm with a sandbox test card from the backend plan's Phase 0 facts.
- The success page doesn't declare success prematurely — it actually reflects the order's true status
  (test by deliberately using a declined sandbox card and confirming the "success" page doesn't falsely
  show `PAID`).
- Fail/decline path offers a working retry that re-initiates payment for the same order (not a duplicate
  order).

---

## Final Phase — Cleanup + verification pass — ✅ DONE

> **Completion notes:** Referendum-only pages/components (`askQuestion`, `questionDetail`, `home`,
> `QuestionCard`, the referendum profile/dashboard tabs, `pages/questions/*`, `pages/user/{activities,
> favorites,my-questions}.tsx`, `types/demographics.ts`, `utils/{demographicsLabels,parseQuestionResults}.ts`)
> had already been deleted during Phase 1 (confirmed with the user at the time, per that phase's completion
> notes) rather than deferred to this pass — so this pass focused on the remaining, less obvious dead
> referendum content instead of a second deletion round:
> - `components/pages/dashboard/schemas.ts`'s `questionFormSchema`/`QuestionFormValues` (the old
>   ask-a-question form's validation) were unreferenced by any page — nothing in `dashboard/` still renders
>   a question form — so they were deleted along with their dedicated test block in `schemas.test.ts`
>   (`categoryFormSchema`'s tests were kept as-is).
> - `components/pages/dashboard/style.ts`'s `PopularQuestionsList`/`PopularQuestionRow`/`PopularRank`/
>   `PopularQuestionInfo`/`PopularQuestionText`/`PopularQuestionMeta`/`PopularQuestionVotes` (leftovers from
>   the deleted `AnalyticsPage`) had zero remaining references anywhere in the app — deleted.
> - The styled-component names `QuestionsList`/`QuestionCard`/`QuestionText` in `dashboard/style.ts` and
>   `profile/style.ts` are **kept** — per Phase 3's completion notes, `ProductsPage`/`OrdersPage`/etc.
>   already deliberately reuse these names for unrelated shop content, an established convention in this
>   codebase, not a leftover bug. Same for `RefIcons`' generic `QuestionMarkIcon` (an unused but
>   domain-agnostic "?" icon, not referendum-specific).
> - `locales/{en,ka,ru}/common.json`'s `default-page-title`/`page-description` (the site's `<title>`/meta
>   description) still read "Public Referendum" / "საზოგადოებრივი აზრის პლატფორმა" / "Народный референдум" —
>   genuinely dead referendum copy still shown to every visitor via `_app.tsx`'s default SEO tags. Replaced
>   with shop-appropriate copy in all three locales.
> - `components/shared/ReferendumFooter/` was still fully referendum-branded (Georgian copy about
>   "expressing your opinion on current issues" and "your vote matters", a `BallotIcon`, and a top.ge
>   visitor-counter script tied to the old referendum site's `data-site-id`) despite being rendered on every
>   shop page (`catalog`, `productDetail`, `cart`, `checkout`, `orders`, `orderDetail`, `terms`) — this was
>   flagged as a known gap after Phase 1 (dead links removed then, but the component's content deferred to
>   this pass). Renamed to `components/shared/Footer/` (8 import sites updated), copy rewritten to
>   shop-domain Georgian, `BallotIcon` swapped for the existing `CartIcon`, added a "ჩემი შეკვეთები" (my
>   orders) link, and dropped the referendum-site analytics counter script entirely (tied to a site id that
>   isn't this app). `style.tsx` carried over unchanged — it was already domain-agnostic (CSS variables, no
>   referendum copy) aside from the now-unused `CounterWrapper` export, which was dropped with it.
> - `real-estate-application/` was left untouched, per Phase 0's explicit "out of scope, don't delete as a
>   side effect" guidance — still needs a direct decision from the user, independent of this plan.
>
> `tsc --noEmit`, `yarn lint`, `yarn jest` (3 suites / 12 tests), and `yarn build:prod` all pass clean (only
> the same pre-existing warnings in unrelated files as before this pass — none touch code changed here). Item
> 3's full manual BOG-sandbox walkthrough was **not** run in this pass (no live backend/BOG-sandbox session
> available in this environment) — still recommended as a real manual check before shipping.

1. ~~Delete fully-superseded referendum pages/components~~ — done (see above; most of it landed in Phase 1,
   the remainder in this pass).
2. `yarn lint` and `yarn build:prod` clean — confirmed.
3. Full manual walkthrough: browse catalog → view product → add to cart → checkout → BOG sandbox payment
   → land on success page reflecting real `PAID` status → see the order in order history — **still
   outstanding**, requires a live backend + BOG sandbox session; do this before shipping to production.
4. Confirmed `API_Client/index.ts` has no leftover factory referencing a class the generated client no
   longer exports (`grep` for `QuestionAPI`/`AnswerAPI`/`UserAnswerAPI`/`FavoritesAPI`/`StatsAPI` across
   `components`/`pages`/`API_Client` is empty). Admin-gating wasn't re-audited page-by-page in this pass
   beyond what Phases 1–3 already put in place (`useAdminGuard` on the admin product/order/category/user
   pages, none on catalog/cart/checkout/orders) — worth a final explicit skim before shipping too.
