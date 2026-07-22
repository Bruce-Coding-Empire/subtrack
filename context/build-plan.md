# Build Plan

## Core Principle

For each app: UI built with mock data first, verified visually, then wired to the real API step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases. The API is built just enough ahead of the web client to unblock it — never the whole backend before any UI exists.

---

## Phase 1 — Foundation

### 01 Monorepo + Tooling Setup

**Logic:**

- Initialize `apps/web` (Next.js 16, App Router, Tailwind v4, shadcn/ui)
- Initialize `apps/api` (Nest.js, TypeORM, PostgreSQL connection)
- Initialize `apps/mobile` (Expo, Expo Router, NativeWind)
- Root-level `context/` and `AGENTS.md` in place before any code (already done)
- `.env.local` / `.env` templates for each app matching `code-standards.md`

---

### 02 Database Schema + Migrations

**Logic:**

- Create all entities from `architecture.md`: `users`, `subscriptions`, `payment_history`, `exchange_rates`, `notification_preferences`
- Generate and run initial TypeORM migration — `synchronize: false` from the start
- Seed script (dev only) — one test user, a handful of subscriptions across categories and currencies

---

### 03 Auth — API

**Logic:**

- `AuthModule`: register, login, refresh, logout endpoints per `api-contract.md`
- `JwtStrategy` + `JwtAuthGuard` per `library-docs.md`
- Password hashing with bcrypt
- Refresh token as httpOnly cookie in response (web-compatible); also returned in body for mobile
- Swagger bootstrap set up in `main.ts` at this point per `library-docs.md` — `AuthController` is the first controller decorated, every controller after this follows the same pattern from the start

---

### 04 Auth — Web UI + Wiring

**UI:**

- `/login`, `/register` pages — register form is name + email + password, login form is email + password, matching `ui-rules.md` form patterns

**Logic:**

- `lib/api-client.ts` and `lib/auth.ts` — calls Auth API, stores access token in memory, refresh token via cookie (browser-managed)
- Middleware protecting `/dashboard`, `/subscriptions`, `/settings`
- On login → redirect to `/dashboard`

---

## Phase 2 — Subscriptions Core

### 05 Subscriptions API

**Logic:**

- `SubscriptionsModule`: full CRUD per `api-contract.md`
- `billing-cycle.util.ts` — `calculateNextRenewalDate()`, covers weekly/monthly/yearly/custom, unit-testable in isolation
- Cancel endpoint (soft), delete endpoint (hard, blocked if payment history exists)

---

### 06 Subscriptions Page — Web UI (mock data)

**UI:**

- `/subscriptions` — table (COMPANY... wait, columns: NAME, CATEGORY, COST, CYCLE, NEXT RENEWAL, STATUS), filter (active/cancelled), search input
- Add Subscription modal/form — name, cost, currency, billing cycle (with custom interval reveal), category, start date
- `/subscriptions/[id]` — detail view with edit form and payment history list (mock data)

---

### 07 Subscriptions — Web Wiring

**Logic:**

- List page fetches real data via `api-client.ts`, filter/search/pagination wired
- Add/edit forms call create/update endpoints, `revalidate` or refetch on success
- Cancel action requires confirmation dialog before firing
- Delete blocked with a human-readable message if payment history exists — direct user to cancel instead

---

## Phase 3 — Renewals, History & Currency

### 08 Renewal Scheduled Job

**Logic:**

- `RenewalJob` per `code-standards.md` and `library-docs.md` pattern
- Runs daily, advances due subscriptions, writes `payment_history`
- Manual trigger script for dev testing (never exposed as a public endpoint)
- Logging on start, per-item failure, and completion count

---

### 09 Currency Module + Exchange Rate Job

**Logic:**

- `CurrencyService.fetchLatestRates()` + `getConvertedAmount()` per `library-docs.md`
- `ExchangeRateJob` runs every 6 hours, refreshes only currencies in active use
- Manual trigger script for dev testing

---

## Phase 4 — Dashboard

### 10 Dashboard API

**Logic:**

- `GET /dashboard/summary` — total monthly/yearly spend (converted), category breakdown, upcoming renewals
- `GET /dashboard/spend-trend` — built from `payment_history`, converted, grouped by month

---

### 11 Dashboard Page — Web UI (mock data)

**UI:**

- Four stat cards: Total Monthly Spend, Total Yearly Spend, Active Subscriptions, Upcoming Renewals (7d)
- Category breakdown — pie chart
- Spend trend — line chart, last 6 months
- Upcoming renewals list with urgency pills
- Empty state banner if user has zero subscriptions — "Add your first subscription" CTA

---

### 12 Dashboard — Web Wiring

**Logic:**

- All four sections wired to real `/dashboard/*` endpoints
- Empty states shown correctly when there's no data yet, not a zeroed chart
- Loading states for each card/chart independently — don't block the whole page on one slow section

---

## Phase 5 — Settings

### 13 Settings Page — Web (Full, incl. v2 scaffolding)

**UI:**

- Profile section — name (editable), email (read-only), base currency selector
- Monthly Spend Limit section — disabled input, "Coming in v2" badge
- Notifications section — disabled toggles, "Coming in v2" badge

**Logic:**

- Base currency save wired to `PATCH /users/me`
- Disabled v2 sections render but submit nothing

---

## Phase 6 — Mobile App

### 14 Mobile Auth

**UI + Logic:**

- Login/register screens — register screen includes name field, matching web visual language via `ui-tokens.md`
- Token handling via `expo-secure-store` per `library-docs.md`
- Root layout auth guard redirecting to `(auth)` group if unauthenticated

---

### 15 Mobile Subscriptions

**UI + Logic:**

- Subscriptions list screen — card list per `ui-rules.md` mobile pattern
- Add/edit screen — same fields as web, mobile-native form controls
- Detail screen — payment history, cancel action (native confirm alert)
- All wired to the same `api-contract.md` endpoints as web

---

### 16 Mobile Dashboard

**UI + Logic:**

- Stat cards (2x2 grid), category pie chart (`react-native-chart-kit`), upcoming renewals list
- Spend trend chart
- Same empty/loading state rules as web

---

### 17 Mobile Settings

**UI + Logic:**

- Profile + base currency, same v2-scaffolded sections as web, adapted to mobile form controls

---

## Feature Count

| Phase                              | Features |
| ------------------------------------- | ---------- |
| Phase 1 — Foundation                     | 4          |
| Phase 2 — Subscriptions Core                | 3          |
| Phase 3 — Renewals, History & Currency         | 2          |
| Phase 4 — Dashboard                               | 3          |
| Phase 5 — Settings                                   | 1          |
| Phase 6 — Mobile App                                    | 4          |
| **Total**                                                  | **17**     |

---

## v2 Roadmap

v1 (above) is complete and shipped. Nothing below is started or committed — these are full specs so a future session can pick one up and start building directly, the same level of detail as Phases 1–6, continuing the numbering from 18. Build order across phases matters: Phase 8 (push notifications) depends on Phase 7's spend-limit fields for its spend-limit-alert half; Phase 9 and 10 are independent of everything else and of each other.

---

## Phase 7 — Spend Limits (v2)

`users.monthly_spend_limit` already exists in the v1 schema (scaffolded, unused) — no new table needed.

### 18 Spend Limits API

**Logic:**

- `PATCH /users/me` accepts `monthlySpendLimit` (nullable numeric) alongside the existing name/base-currency fields
- `GET /dashboard/summary` gains `spendLimit`, `currentMonthSpend`, `percentageUsed`, `isOverLimit` — computed from existing `payment_history` for the current calendar month, converted to base currency via the existing `CurrencyService`

---

### 19 Spend Limits — Web UI (mock data)

**UI:**

- Settings → "Monthly Spend Limit" section (scaffolded disabled in feature 13) becomes a real numeric input, "Coming in v2" badge removed
- Dashboard gains a progress bar under the stat cards: under-limit (accent), ≥90% (warning), over-limit (destructive) — built against mock data first; no-limit-set state shows a "Set a monthly limit" CTA, not a zeroed bar

---

### 20 Spend Limits — Web Wiring

**Logic:**

- Settings save wired to `PATCH /users/me`
- Dashboard progress bar wired to `GET /dashboard/summary`'s new fields, including the no-limit-set CTA state

---

### 21 Spend Limits — Mobile (UI + Wiring)

**UI + Logic:**

- Same un-scaffolding on mobile Settings (feature 17) and the same progress bar under the mobile dashboard's 2×2 stat grid (feature 16)
- Wired directly to the same two endpoints as web — no separate mock-data step, matching how Phase 6 mobile features were built once the API already existed

---

## Phase 8 — Push Notifications (v2)

`notification_preferences` table already exists (scaffolded in v1, currently unread/unwritten by any feature).

### 22 Notification Preferences API

**Logic:**

- New `NotificationsModule` — `GET`/`PATCH /notifications/preferences` for `renewalRemindersEnabled` / `spendLimitAlertsEnabled`, `POST /notifications/push-token` to store the Expo push token
- Reuses the existing `notification_preferences` table (currently modeled under `modules/users/entities/`, per the feature-02 decision recorded in `progress-tracker.md` — move it into this new module when built)
- `architecture.md`'s monorepo tree doesn't list a `notifications` module yet — add it there when this is actually built, not before

---

### 23 Push Token Registration — Mobile

**UI + Logic:**

- New dependency: `expo-notifications` (not yet installed — add to `code-standards.md`'s approved list when built)
- Permission prompt on first Settings/Alerts visit or app load; registers the device token via `POST /notifications/push-token`, skips re-registering if the stored token hasn't changed

---

### 24 Notification Preferences + Alerts Tab — Web + Mobile (UI + Wiring)

**UI:**

- Web: Settings → "Notifications" section (scaffolded disabled in feature 13) becomes live toggles
- Mobile: notification toggles move off Settings into a new 5th tab bar item — `Dashboard`, `Subscriptions`, `Add`, `Alerts`, `Settings`. This is also what resolves the tab-bar centering issue noted during feature 15's testing (with 4 tabs, `Add` sat at the 3rd-of-4 slot — 62.5% across — not visual center; with 5 tabs it becomes the true 3rd-of-5 center item, so no special-cased layout fix is needed)

**Logic:**

- Both wired to `GET`/`PATCH /notifications/preferences`

---

### 25 Renewal + Spend-Limit Push Dispatch Job — API

**Logic:**

- New `NotificationDispatchJob` (`@nestjs/schedule`), runs daily after `renewal.job.ts`
- Renewal reminders: subscriptions renewing within the next 3 days, for users with `renewalRemindersEnabled` and a stored push token
- Spend-limit alerts: for users with `spendLimitAlertsEnabled`, checks whether an upcoming renewal would push `currentMonthSpend` over `monthlySpendLimit` (Phase 7)
- Sends via `expo-server-sdk` (new dependency — add to `code-standards.md`'s approved list when built)
- Manual trigger script for dev testing, same pattern as `renewal.job.ts` and `exchange-rate.job.ts`

---

## Phase 9 — Email Auto-Detection (v2)

Gmail OAuth (read-only), decided when this was specced — bank auto-detection is excluded outright, not just deferred (see "Dropped From v2" below).

### 26 Gmail Connection API

**Logic:**

- New `EmailIntegrationModule`. Google OAuth2, readonly Gmail scope — `GET /integrations/gmail/connect` (returns the consent URL), `GET /integrations/gmail/callback` (exchanges the code, stores encrypted tokens), `DELETE /integrations/gmail/disconnect`
- New table: `email_connections` (`user_id`, `provider`, `access_token_encrypted`, `refresh_token_encrypted`, `connected_at`) — add to `architecture.md`'s schema and generate a migration when built
- Requires a Google Cloud OAuth client (client ID/secret) — new env vars, not yet in `code-standards.md`'s env table

---

### 27 Email Scan + Parsing Job — API

**Logic:**

- `EmailScanJob` (daily) — for each connected user, fetches recent Gmail messages via the Gmail API, filters for subscription receipt/confirmation emails by sender/subject heuristics, parses vendor name / amount / currency / cycle where it can
- Writes to a new staging table, `detected_subscriptions` (`status`: pending / approved / dismissed) — never creates a real `subscriptions` row directly; the user must confirm (feature 29)

---

### 28 Detected Subscriptions Review — Web UI (mock data)

**UI:**

- New section on `/subscriptions` (or a dedicated `/subscriptions/detected`) listing pending detected items with Approve/Dismiss actions — mock data first
- Settings gains a "Connect Gmail" / "Disconnect" control

---

### 29 Detected Subscriptions Review — Web Wiring

**Logic:**

- Wired to `GET /integrations/detected`, `POST /integrations/detected/:id/approve` (creates a real subscription through the existing `subscriptions.service` create path), `POST /integrations/detected/:id/dismiss`
- Settings' Gmail connect/disconnect control wired to the OAuth endpoints from feature 26
- Mobile: not scoped here — OAuth consent is a web-browser-native flow; revisit only if mobile support is explicitly wanted later

---

## Phase 10 — Data Export (v2)

### 30 Export API

**Logic:**

- `GET /export/subscriptions?format=csv|pdf`, `GET /export/payment-history?format=csv|pdf`
- CSV: manual serialization, no new dependency
- PDF: new dependency needed (e.g. `pdfkit`) — add to `code-standards.md`'s approved list when built

---

### 31 Export — Web UI + Wiring

**UI:**

- Export menu/button on `/subscriptions` — CSV or PDF, triggers a browser download

**Logic:**

- Wired to `GET /export/*`, streams the response as a file download
- Mobile: not scoped here — file-download UX differs (share sheet, not a browser download); revisit separately if wanted

---

## v2 Feature Count

| Phase                              | Features |
| ------------------------------------- | ---------- |
| Phase 7 — Spend Limits                   | 4          |
| Phase 8 — Push Notifications                | 4          |
| Phase 9 — Email Auto-Detection                 | 4          |
| Phase 10 — Data Export                            | 2          |
| **Total**                                                  | **14**     |

---

## Dropped From v2

- **Multi-currency base (per-portfolio)** — considered, then dropped. No clear use case was identified, and "portfolio" wasn't a concept defined anywhere else in this project's docs.
- **Bank auto-detection of subscriptions** — excluded outright, not deferred. See Phase 9's Gmail-only approach above; brokering or storing bank credentials/access tokens carries security and liability weight disproportionate to this project.
- **Mobile tab bar true centering** — no longer a standalone concern; resolved as a side effect of feature 24's new 5th "Alerts" tab.