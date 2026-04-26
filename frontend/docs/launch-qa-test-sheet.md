# Restaurant App Launch QA Test Sheet

Use this checklist for final pre-production validation.

Legend: mark each item with ✅ Pass / ❌ Fail / ⚠️ Blocked and record notes.

---

## A) Customer-side QA

| Area | Test | Expected Result | Status | Notes |
|---|---|---|---|---|
| Auth | Register | Account created successfully |  |  |
| Auth | Login | User lands on customer flow |  |  |
| Auth | Logout | Session cleared and protected routes blocked |  |  |
| Auth | Refresh session | Auth state persists after reload |  |  |
| Auth | Logged-out access | Protected customer pages redirect to login |  |  |
| Auth | Wrong-role access | Non-customer cannot access customer-only pages incorrectly |  |  |
| Discovery | Customer home | Home renders with no layout issues |  |  |
| Discovery | Restaurant list | List loads and cards render |  |  |
| Discovery | Restaurant detail | Detail page loads with expected content |  |  |
| Discovery | Mobile layout | No card/image overflow at ~375px width |  |  |
| Reservations | Create reservation | Reservation submission succeeds |  |  |
| Reservations | Success banner | Success confirmation is visible after action |  |  |
| Reservations | Reservations list | Reservations page loads current entries |  |  |
| Reservations | Empty state | Friendly empty state shown when no reservations |  |  |
| Reservations | Error state | API failure shows readable error UI |  |  |
| Orders | Create/view order | Order appears in customer order list |  |  |
| Orders | Orders list | Orders page loads and renders cards clearly |  |  |
| Checkout | Checkout page | Checkout page loads and usable |  |  |
| Checkout | Totals | Pricing totals are formatted correctly |  |  |
| Checkout | Payment status | Payment statuses shown without leaking sensitive payloads |  |  |
| Notifications | Load notifications | Notifications page renders correctly |  |  |
| Notifications | Mark all read | Action succeeds and UI updates |  |  |
| Profile | Load profile | Profile page is reachable and renders |  |  |
| Navigation | Customer links | All customer nav links route to real pages |  |  |

---

## B) Restaurant/admin QA

| Area | Test | Expected Result | Status | Notes |
|---|---|---|---|---|
| Access | Restaurant layout | Admin layout renders with topbar/sidebar |  |  |
| Access | Role guard | Unauthenticated users redirected to login |  |  |
| Access | Wrong-role block | Customer role blocked from admin pages |  |  |
| Dashboard | Load dashboard | Dashboard page renders with metric cards |  |  |
| Dashboard | States | Loading, empty, error states all render properly |  |  |
| Dashboard | Desktop UX | No desktop layout breaks or overlaps |  |  |
| Dashboard | Live badge | Live/Offline badge behavior is correct |  |  |
| Reservations | Load reservations | Reservations admin page loads |  |  |
| Reservations | Calendar widget | Reservation calendar widget renders cleanly |  |  |
| Reservations | List readability | Rows/cards are readable and aligned |  |  |
| Reservations | Refresh behavior | Reservation list refreshes when expected |  |  |
| Orders | Load orders | Orders page loads and queue is readable |  |  |
| Orders | Open/closed split | Orders grouped correctly by status |  |  |
| Kitchen | Load kitchen | Kitchen page loads and ticket cards render |  |  |
| Kitchen | Queue updates | Queue transitions correctly between in-progress/ready |  |  |
| Kitchen | Stale/dupes | No duplicate stale entries after refreshes |  |  |
| Payments | Load payments | Payments page loads with summary cards |  |  |
| Payments | Status badge | Badge colors/labels match status semantics |  |  |
| Payments | States | Loading/empty/error UX present and readable |  |  |
| Accounting | Load accounting | Accounting route/page loads if wired |  |  |
| Security | Payment fields | No provider secrets or sensitive payment payload leaks |  |  |
| Menu | Load menu | Menu page reachable and visually stable |  |  |
| Menu | Editor | Menu editor renders correctly |  |  |
| Customers | Load customers | Customers page reachable |  |  |
| Settings | Load settings | Settings page reachable |  |  |
| Navigation | Sidebar links | All admin sidebar links point to real pages |  |  |

---

## C) Realtime QA

| Area | Test | Expected Result | Status | Notes |
|---|---|---|---|---|
| Connectivity | Websocket offline fallback | App remains usable without websocket |  |  |
| Connectivity | Badge transitions | Badge shows Offline/Connecting/Live accurately |  |  |
| Connectivity | Reconnect stability | Reconnect attempts do not crash pages |  |  |
| Connectivity | Backoff UX | Reconnect backoff does not spam UI |  |  |
| Toasts | Toast rendering | Toast stack appears and auto-dismisses correctly |  |  |
| Customer events | Reservation/waitlist events | Customer reservations refresh correctly |  |  |
| Customer events | Order/payment events | Customer orders refresh correctly |  |  |
| Customer events | Notification events | Notifications list updates correctly |  |  |
| Restaurant events | Dashboard events | Dashboard refreshes on reservation/order/payment/table events |  |  |
| Restaurant events | Order events | Orders refreshes on created/status_changed |  |  |
| Restaurant events | Kitchen events | Kitchen refreshes on ticket_created/ticket_ready |  |  |
| Restaurant events | Reservation events | Admin reservations refreshes on reservation updates |  |  |
| Restaurant events | Payment events | Payments refreshes on payment success events |  |  |
| Tenant isolation | Cross-tenant leakage | No cross-customer/cross-restaurant events displayed |  |  |
| Error handling | Parse/socket errors | Realtime errors fail gracefully without breaking pages |  |  |

---

## D) Onboarding QA

| Area | Test | Expected Result | Status | Notes |
|---|---|---|---|---|
| Flow | Start | Onboarding start page loads |  |  |
| Flow | Restaurant step | Page loads and content is stable |  |  |
| Flow | Location step | Page loads and content is stable |  |  |
| Flow | Menu step | Page loads and content is stable |  |  |
| Flow | Staff step | Page loads and content is stable |  |  |
| Flow | Tables step | Page loads and content is stable |  |  |
| Flow | Billing step | Page loads and content is stable |  |  |
| Flow | Complete step | Completion page loads |  |  |
| UX | Progress widget | Onboarding progress UI is correct |  |  |
| UX | Navigation | Back/next actions are clear |  |  |
| Access | Route protection | Onboarding layout guard works as expected |  |  |

---

## E) Runtime + deployment QA

| Area | Test | Expected Result | Status | Notes |
|---|---|---|---|---|
| Env | API base URL | `NUXT_PUBLIC_API_BASE_URL` set to prod API URL (not localhost) |  |  |
| Env | HTTPS | Production URL/API use HTTPS |  |  |
| Build | Install | `npm install` succeeds |  |  |
| Build | Nuxt resolution | `npm ls nuxt` resolves Nuxt package |  |  |
| Build | Typecheck | `npm run typecheck` passes |  |  |
| Build | Build | `npm run build` passes |  |  |
| Build | Dev sanity | `npm run dev` starts locally |  |  |
| Deploy | Vercel root dir | Root directory set to `frontend` |  |  |
| Deploy | Framework preset | Nuxt.js preset selected |  |  |
| Deploy | Build cmd | Correct build command configured |  |  |
| Deploy | Env vars | Required env vars configured in deploy target |  |  |
| Deploy | Deployment | At least one successful deployment |  |  |
| Deploy | Production URL | App loads (no 404) |  |  |

---

## F) Final smoke flow (execute in order)

| Step | Action | Expected Result | Status | Notes |
|---|---|---|---|---|
| 1 | Register customer | Account is created |  |  |
| 2 | Login customer | Customer lands in customer flow |  |  |
| 3 | Browse restaurants | List/detail load correctly |  |  |
| 4 | Create reservation | Reservation succeeds |  |  |
| 5 | Open customer reservations | New reservation appears |  |  |
| 6 | Create/view order | Order appears in customer orders |  |  |
| 7 | Open checkout | Checkout renders and totals are correct |  |  |
| 8 | Login restaurant/admin | Admin layout opens |  |  |
| 9 | Open dashboard | Metrics and states render |  |  |
| 10 | Open reservations/orders/kitchen/payments | Pages load and are readable |  |  |
| 11 | Verify realtime/fallback | Live updates or graceful offline behavior |  |  |
| 12 | Verify onboarding pages | All onboarding pages load and navigate |  |  |

---

## G) Go / no-go

### Go live if all are true

- install + build checks pass
- customer core flow passes
- restaurant core flow passes
- realtime works or degrades gracefully
- no payment/provider secret leakage
- production deployment URL works

### No-go if any are true

- build/typecheck fails
- auth/session behavior unstable
- wrong-role access guard broken
- core reservation/order/checkout/admin flow broken
- production URL broken (404/500)
