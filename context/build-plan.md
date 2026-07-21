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

## v2 Roadmap (explicitly out of this build plan)

- Functional monthly spend limits with dashboard progress bar and over-limit state
- Push notifications — renewal reminders and spend limit alerts, using the `notification_preferences` table already scaffolded in v1
- Bank/email auto-detection of subscriptions
- CSV/PDF export
- Multi-currency base (per-portfolio rather than per-user)