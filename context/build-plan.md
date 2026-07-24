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

v1 (above) is complete and shipped. Nothing below is started or committed — these are full specs so a future session can pick one up and start building directly, the same level of detail as Phases 1–6, continuing the numbering from 18. Build order across phases matters: Phase 10 (push notifications) depends on Phase 7's spend-limit fields for its spend-limit-alert half; Phase 11 and 12 are independent of everything else and of each other. Phase 8 (landing page) is fully static and independent of every other v2 phase; Phase 9 (mobile spend limits) depends only on Phase 7's API (18), not on Phase 8. Phase 13 (mobile branding + welcome screen) is likewise fully static and independent of every other v2 phase — mobile's counterpart to Phase 8, not a dependency of anything.

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

## Phase 8 — Landing Page (v2)

`architecture.md` has always listed `/ → Landing page` in its Pages/Screens table, but no numbered feature ever claimed it — `/` is still the unmodified `create-next-app` boilerplate (confirmed in `progress-tracker.md`'s feature-04 notes). This feature closes that gap. Content below is locked (decided in a design pass before implementation) — build to this spec, using `ui-tokens.md`/`ui-rules.md` and the existing component set (`Button`, `Card`, Lucide icons) rather than introducing new ones without sign-off.

### 21 Landing Page — Web UI + Wiring

**Content spec (locked):**

- **Header** — logo ("SubTrack") + `Log in` (text link) + `Get Started` (Primary button). Separate from the authenticated `Navbar` (`components/layout/Navbar.tsx`), which stays behind auth in `(app)/layout.tsx`.
- **Hero** — problem-first headline: "Your subscriptions are quietly draining you." Subhead: "Track every subscription, every currency, every renewal — in one place. See exactly what you're paying for, before it adds up." Primary CTA `Get Started` → `/register`, secondary `Log in` → `/login`. Below the copy: a scaled-down, non-interactive preview of the real dashboard (the 4 stat cards, category pie chart, spend trend line) populated with believable mock numbers — same spirit as `lib/mock-data.ts`, not live data.
- **Problem strip** — thin band between hero and features: "Subscriptions renew silently. Spend creeps up over months. And when they're billed in different currencies, it's even harder to see the full picture."
- **Feature highlights** — 3 `Card`s, each with an accent-colored Lucide icon:
  1. **Track everything** — "Log every subscription once — streaming, software, gym, hosting. Any currency, any billing cycle: weekly, monthly, yearly, or custom."
  2. **Never miss a renewal** — "SubTrack calculates when each subscription renews and keeps a running history of every payment, automatically."
  3. **See where your money goes** — "One dashboard: total spend in your currency, category breakdown, and how your spend is trending over time."
- **Closing CTA band** — `bg-accent`, white text (the one place besides the logo a strong accent fill is used): "Ready to see where your money's going?" + `Get Started — it's free` button → `/register`.

**UI + Logic:**

- Replaces the stock boilerplate at `/` (`apps/web/app/page.tsx`) with the page above
- Fully static — no data fetching, no API wiring, no mock-then-real split needed
- Decide whether `/` stays visible to authenticated visitors too, or gets added to `proxy.ts`'s redirect matcher (→ `/dashboard` if the `subtrack_session` marker cookie is present) — resolve during implementation, not assumed here

---

## Phase 9 — Spend Limits — Mobile (v2)

### 22 Spend Limits — Mobile (UI + Wiring)

**UI + Logic:**

- Same un-scaffolding on mobile Settings (feature 17) and the same progress bar under the mobile dashboard's 2×2 stat grid (feature 16)
- Wired directly to the same two endpoints as web — no separate mock-data step, matching how Phase 6 mobile features were built once the API already existed

---

## Phase 10 — Push Notifications (v2)

`notification_preferences` table already exists (scaffolded in v1, currently unread/unwritten by any feature).

### 23 Notification Preferences API

**Logic:**

- New `NotificationsModule` — `GET`/`PATCH /notifications/preferences` for `renewalRemindersEnabled` / `spendLimitAlertsEnabled`, `POST /notifications/push-token` to store the Expo push token
- Reuses the existing `notification_preferences` table (currently modeled under `modules/users/entities/`, per the feature-02 decision recorded in `progress-tracker.md` — move it into this new module when built)
- `architecture.md`'s monorepo tree doesn't list a `notifications` module yet — add it there when this is actually built, not before

---

### 24 Push Token Registration — Mobile

**UI + Logic:**

- New dependency: `expo-notifications` (not yet installed — add to `code-standards.md`'s approved list when built)
- Permission prompt on first Settings/Alerts visit or app load; registers the device token via `POST /notifications/push-token`, skips re-registering if the stored token hasn't changed

---

### 25 Notification Preferences + Alerts Tab — Web + Mobile (UI + Wiring)

**UI:**

- Web: Settings → "Notifications" section (scaffolded disabled in feature 13) becomes live toggles
- Mobile: notification toggles move off Settings into a new 5th tab bar item — `Dashboard`, `Subscriptions`, `Add`, `Alerts`, `Settings`. This is also what resolves the tab-bar centering issue noted during feature 15's testing (with 4 tabs, `Add` sat at the 3rd-of-4 slot — 62.5% across — not visual center; with 5 tabs it becomes the true 3rd-of-5 center item, so no special-cased layout fix is needed)

**Logic:**

- Both wired to `GET`/`PATCH /notifications/preferences`

---

### 26 Renewal + Spend-Limit Push Dispatch Job — API

**Logic:**

- New `NotificationDispatchJob` (`@nestjs/schedule`), runs daily after `renewal.job.ts`
- Renewal reminders: subscriptions renewing within the next 3 days, for users with `renewalRemindersEnabled` and a stored push token
- Spend-limit alerts: for users with `spendLimitAlertsEnabled`, checks whether an upcoming renewal would push `currentMonthSpend` over `monthlySpendLimit` (Phase 7)
- Sends via `expo-server-sdk` (new dependency — add to `code-standards.md`'s approved list when built)
- Manual trigger script for dev testing, same pattern as `renewal.job.ts` and `exchange-rate.job.ts`

---

## Phase 11 — Email Auto-Detection (v2)

Gmail OAuth (read-only), decided when this was specced — bank auto-detection is excluded outright, not just deferred (see "Dropped From v2" below).

### 27 Gmail Connection API

**Logic:**

- New `EmailIntegrationModule`. Google OAuth2, readonly Gmail scope — `GET /integrations/gmail/connect` (returns the consent URL), `GET /integrations/gmail/callback` (exchanges the code, stores encrypted tokens), `DELETE /integrations/gmail/disconnect`
- New table: `email_connections` (`user_id`, `provider`, `access_token_encrypted`, `refresh_token_encrypted`, `connected_at`) — add to `architecture.md`'s schema and generate a migration when built
- Requires a Google Cloud OAuth client (client ID/secret) — new env vars, not yet in `code-standards.md`'s env table

---

### 28 Email Scan + Parsing Job — API

**Logic:**

- `EmailScanJob` (daily) — for each connected user, fetches recent Gmail messages via the Gmail API, filters for subscription receipt/confirmation emails by sender/subject heuristics, parses vendor name / amount / currency / cycle where it can
- Writes to a new staging table, `detected_subscriptions` (`status`: pending / approved / dismissed) — never creates a real `subscriptions` row directly; the user must confirm (feature 30)

---

### 29 Detected Subscriptions Review — Web UI (mock data)

**UI:**

- New section on `/subscriptions` (or a dedicated `/subscriptions/detected`) listing pending detected items with Approve/Dismiss actions — mock data first
- Settings gains a "Connect Gmail" / "Disconnect" control

---

### 30 Detected Subscriptions Review — Web Wiring

**Logic:**

- Wired to `GET /integrations/detected`, `POST /integrations/detected/:id/approve` (creates a real subscription through the existing `subscriptions.service` create path), `POST /integrations/detected/:id/dismiss`
- Settings' Gmail connect/disconnect control wired to the OAuth endpoints from feature 27
- Mobile: not scoped here — OAuth consent is a web-browser-native flow; revisit only if mobile support is explicitly wanted later

---

## Phase 12 — Data Export (v2)

### 31 Export API

**Logic:**

- `GET /export/subscriptions?format=csv|pdf`, `GET /export/payment-history?format=csv|pdf`
- CSV: manual serialization, no new dependency
- PDF: new dependency needed (e.g. `pdfkit`) — add to `code-standards.md`'s approved list when built

---

### 32 Export — Web UI + Wiring

**UI:**

- Export menu/button on `/subscriptions` — CSV or PDF, triggers a browser download

**Logic:**

- Wired to `GET /export/*`, streams the response as a file download
- Mobile: not scoped here — file-download UX differs (share sheet, not a browser download); revisit separately if wanted

---

## Phase 13 — Mobile Branding & Welcome Screen (v2)

`app.json` still ships the stock Expo icon/splash assets (`icon.png`, `splash-icon.png`, the Android adaptive-icon set, and an `ios.icon` pointing at Expo's own sample Icon Composer glass icon under `assets/expo.icon/`) even though the real logo, `assets/images/subtrack.png`, has been live inline on the login/register screens since feature 14. And unlike web — which has a landing page in front of `/login` (Phase 8) — mobile's root layout (`app/_layout.tsx`) branches straight from the native splash into `(auth)` → `login` with nothing in between. This phase closes both gaps: real branding on every icon/splash surface, and a mobile counterpart to the web landing page. Content below is locked (mirrors the Phase 8 decision to spec content upfront) — build to this spec using `ui-tokens.md`/`ui-rules.md` and the existing component set (`Button`, `Image` from `expo-image`) rather than introducing new ones without sign-off.

### 33 Mobile App Icon, Splash Screen & Welcome Screen

**Branding — App Icon & Splash Screen (Logic):**

- `assets/images/icon.png` (1024×1024, used for Android and as the iOS fallback) — regenerated from `subtrack.png`, flattened onto an opaque background (iOS icons can't have transparency). Use the same background the logo already uses per `ui-tokens.md`'s Logo component spec (`linear-gradient(135deg, #0F9D78 0%, #0B7A5C 100%)`) if contrast against the mark holds up at icon size, otherwise fall back to a flat white/`#F6F8F7` backing — decide by eye during implementation, not assumed here
- `assets/images/android-icon-foreground.png` — replaced with `subtrack.png` at the correct safe-area scale for Android's adaptive-icon mask (transparency is fine here, this is a foreground layer over `android.adaptiveIcon.backgroundColor`)
- `android.adaptiveIcon.backgroundColor` in `app.json` — changed from the current default Expo blue (`#E6F4FE`) to `#F6F8F7` (`--color-background` token) for brand consistency
- `assets/images/android-icon-monochrome.png` — regenerated as a single-color alpha mask derived from `subtrack.png`'s silhouette, for Android 13+ themed icons
- `ios.icon` in `app.json` — drop the `./assets/expo.icon` Icon Composer override (Expo's own sample glass icon, unrelated to this project) so iOS falls back to the top-level `icon` field; a proper Icon Composer (liquid-glass) version of `subtrack.png` is a nice-to-have follow-up, not required here
- `assets/images/splash-icon.png` — replaced with `subtrack.png`; `expo-splash-screen`'s existing plugin config (`backgroundColor: "#F6F8F7"`, already matching `--color-background`) stays as-is, only `imageWidth` is re-tuned if the new mark's proportions need it
- Rebuild the dev client (`expo prebuild` / a new EAS dev build) after these change — icon/splash assets are baked into the native binary and won't show via a plain Metro reload

**Welcome Screen (UI + Logic):**

- New `app/(auth)/welcome.tsx`, becomes the `(auth)` group's `initialRouteName` (currently `login`) in `app/(auth)/_layout.tsx`, with `login` and `register` added as further `Stack.Screen`s reachable from it — so an unauthenticated user always lands here first, same as web guests always landing on `/` before `/login`
- Content — logo (`subtrack.png`, larger than the 36×36 inline usage on login/register) + "SubTrack" logo text per `ui-tokens.md`'s Logo Text row (19px/700), headline echoing the web hero's problem-first framing ("Your subscriptions are quietly draining you.") but condensed for a single non-scrolling mobile screen, 3 compact icon+text rows (not full `Card`s — mobile pattern, per `ui-rules.md`, keeps this to short rows, not the web's 3-card layout) covering the same three points as web's feature highlights (track everything, never miss a renewal, see where your money goes)
- Two CTAs pinned near the bottom: `Get Started` (Primary button) → `/register`, `Log In` (text link, same treatment as the existing "Don't have an account? Register" link pattern on the login screen) → `/login`
- Fully static — no data fetching, no API wiring
- No dashboard-preview mock (unlike the web hero) — mobile screen space doesn't fit it meaningfully at this size; skip rather than force a cramped chart

---

## v2 Feature Count

| Phase                              | Features |
| ------------------------------------- | ---------- |
| Phase 7 — Spend Limits                   | 3          |
| Phase 8 — Landing Page                      | 1          |
| Phase 9 — Spend Limits — Mobile               | 1          |
| Phase 10 — Push Notifications                | 4          |
| Phase 11 — Email Auto-Detection                 | 4          |
| Phase 12 — Data Export                            | 2          |
| Phase 13 — Mobile Branding & Welcome Screen         | 1          |
| **Total**                                                  | **16**     |

---

## Dropped From v2

- **Multi-currency base (per-portfolio)** — considered, then dropped. No clear use case was identified, and "portfolio" wasn't a concept defined anywhere else in this project's docs.
- **Bank auto-detection of subscriptions** — excluded outright, not deferred. See Phase 11's Gmail-only approach above; brokering or storing bank credentials/access tokens carries security and liability weight disproportionate to this project.
- **Mobile tab bar true centering** — no longer a standalone concern; resolved as a side effect of feature 25's new 5th "Alerts" tab.

---

## Phase 14 — Production Reliability & Reviewer Readiness (post-launch hardening)

**Why this phase exists.** Deploying to Render's free tier surfaced a correctness gap that was previously logged in `code-standards.md`'s Hosting section as an accepted tradeoff: Render sleeps the service after 15 minutes idle, and a sleeping process fires no in-process `@Cron` jobs. That tradeoff was acceptable while the app was private; it is not acceptable for a public portfolio deployment, because the renewal job is what produces `payment_history` — the data behind the spend-trend chart and current-month spend. If the job silently stops firing, a reviewer visiting weeks after launch sees overdue renewals (`error`-token pills everywhere) and a flat/stale trend chart — the system *looks* broken precisely because its most interesting feature (automated, append-only payment tracking) stopped running. This phase makes scheduled work correct regardless of host uptime, then makes the deployment reviewable: a hiring manager gives a portfolio link roughly 90 seconds and will not register an account, so without a seeded demo and visible docs, everything past the landing page is invisible.

**Design principle for the whole phase: correctness must not depend on the scheduler.** The fix is layered — (1) make the renewal job *catch-up-safe* so it produces correct results no matter how irregularly it runs, (2) add an external trigger so it actually runs daily even when the host sleeps, (3) keep the in-process `@Cron` as a harmless redundant layer (idempotency from layer 1 makes double-firing safe). Layer 1 is the important one: layers 2–3 reduce *when* the job runs late, layer 1 guarantees the data is right *even when it does*.

All four scheduled jobs are affected by sleep, but only renewals needs catch-up logic: notification reminders are forward-looking (a missed day is a missed reminder — acceptable, nothing to backfill), the email scan's `newer_than:2d` Gmail window already covers a one-day gap once daily triggering is reliable, and FX conversion reads "latest cached rate," so a day-old rate degrades gracefully rather than corrupting anything. Renewals is the only job where a missed run leaves *permanently wrong state* (an overdue `next_renewal_date` and missing history rows) rather than a transient gap — which is why it alone gets feature 34.

### 34 Renewal Job — Catch-Up Correctness (API)

**Logic:**

- Replace the single-advance body of `renewal.job.ts` with a per-subscription catch-up loop: `while (nextRenewalDate <= today)` → write one `payment_history` row for that due date, advance `nextRenewalDate` by one billing cycle via the existing `billing-cycle.util.ts`, repeat. A weekly subscription that went unprocessed for three weeks produces three history rows and lands on a future renewal date in one run — under the current single-advance logic it would advance once, remain overdue, and permanently lose two history rows.
- **`paidAt` = the due date being processed, not `today()`.** This is a deliberate semantic change from the current pattern. Backfilled payments must be dated when they notionally happened, or the spend-trend chart attributes several cycles of spend to the month the job happened to catch up in — historically wrong data presented as history. Same-day runs are unaffected (`due date == today`).
- Defensive iteration cap (e.g. 120 per subscription, logged as an error if hit) — DTO validation already forbids `customIntervalDays < 1`, but an unbounded `while` over persisted data deserves defense in depth per this codebase's failure-tolerance rules; 120 covers a weekly subscription unprocessed for over two years.
- **Idempotency falls out for free** and is required by feature 35: after catch-up, `nextRenewalDate > today`, so a second run the same day (in-process cron *and* external trigger both firing) finds nothing due and writes nothing. No dedupe table, no run-lock needed.
- Unit tests on the catch-up logic (multiple cycles overdue across weekly/monthly/yearly/custom, exactly-today, iteration cap, `paidAt` dating) — extract the loop into a pure util if that keeps the tests dependency-free, matching `email-parser.util.ts`'s precedent.
- Contract note: no `api-contract.md` change — `payment_history` shapes are unchanged, only when rows get created and how they're dated.

### 35 External Job Triggers + Health Endpoint (API + GitHub Actions)

**Logic:**

- `GET /health` — public, unauthenticated, returns `{ success: true, data: { status: "ok" } }`. Exists for three consumers: Render's `healthCheckPath` (update `render.yaml` from `/` to `/health`), the uptime pinger (manual step below), and the GitHub Actions workflow's wake-up call. Deliberately does not touch the DB — it answers "is the process up," not "is every dependency healthy," so the pinger doesn't hammer Postgres every few minutes.
- `POST /jobs/renewals/run`, `POST /jobs/notifications/run`, `POST /jobs/email-scan/run`, `POST /jobs/exchange-rates/run` — each executes the corresponding existing job method and returns its summary counts (e.g. `{ processed, paymentsLogged, failures }` for renewals). One endpoint per job, not one mega-endpoint: each stays independently re-runnable when debugging, matching the one-module-per-domain structure.
- **Auth: a dedicated `JobTriggerGuard` checking an `x-job-key` header against `JOB_TRIGGER_SECRET` (new env var), compared with `crypto.timingSafeEqual`, not JWT.** These endpoints have no user context — jobs iterate across all users deliberately, the one sanctioned exception to per-user scoping already documented in `code-standards.md`. Reusing `JwtAuthGuard` would grant any logged-in user the power to fire global jobs; a machine secret is the correct shape. Timing-safe comparison because this is a bare secret check exposed on the public internet.
- New `.github/workflows/scheduled-jobs.yml` — a `schedule:` workflow (daily, UTC; pick an hour, minute ≠ 0 since GitHub delays on-the-hour crons most) that calls the four endpoints **sequentially, in dependency order: renewals → notifications → email-scan → exchange-rates**. Sequencing in one workflow replaces the fragile cron-offset ordering (00:05/00:15/01:00) that only worked when the process stayed awake across the whole window — the notification job reads state the renewal job produces, so order is a real dependency, not a convention. The HTTP request itself wakes a sleeping Render instance (cold start eats ~30–60s of the request; set a generous `curl --max-time`).
- **Keep the in-process `@Cron` decorators.** Two independent schedulers double-firing is safe (feature 34's idempotency) and each covers the other's failure mode: GitHub's scheduler is best-effort (documented delays under load, and scheduled workflows are auto-disabled after 60 days without repo activity), while the in-process cron dies with the host's sleep. Belt and braces, and the *reason* it's safe is exactly the correctness property feature 34 establishes — worth stating in the README later because it's a good interview answer.
- Manual step (account-linked, per this project's precedent that account actions are never automated): create a free uptime monitor (e.g. UptimeRobot) pinging `GET /health` every ~10 minutes. This is cold-start UX for human reviewers, not correctness — layers 1–2 already guarantee correct data without it. Render's free tier includes 750 instance-hours/month; one always-on service fits.

### 36 Demo Account — Seeded, Resettable (API + Web)

**Why.** Reviewers will not register, and the dashboard's empty state — correct product design for real users — hides every feature from the one audience this deployment exists for. A demo account has to (a) look lived-in: mixed currencies, several months of `payment_history` so the trend chart has a real shape, a spend limit partially consumed, a couple of `pending` `detected_subscriptions` rows so the Gmail-review UI is visible without a real Gmail connection, and (b) survive visitors mutating it.

**Logic:**

- New `npm run seed:demo` (idempotent; creates-or-resets only the demo user, identified by `DEMO_USER_EMAIL`): deletes the demo user's subscriptions, payment history, detected subscriptions, and notification preferences, then reseeds. All dates are **relative to run time** ("paid 3 days ago", "renews in 5 days") so the dashboard always looks current instead of decaying as the seed ages. Amends the standing rule: `npm run seed` (dev fixtures) remains forbidden against production; `seed:demo` is the sanctioned, narrowly-scoped exception — it touches exactly one user's rows and nothing else.
- `POST /jobs/demo/reset` — same `JobTriggerGuard` as feature 35, runs the same reset-and-reseed path. Added to the GitHub Actions workflow (nightly, after the other jobs). **Why reset instead of making the demo user read-only:** a read-only demo defeats its purpose — reviewers should experience add/edit/cancel flows — and a write-blocked demo user would scatter special-case branches through service code that currently has none. A nightly reset keeps the API entirely demo-unaware outside the seed path.
- Web: a "Try the demo" Secondary button in the landing hero next to the existing CTAs, which calls the normal `POST /auth/login` with `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD` and redirects to `/dashboard` on success. **These two values are deliberately non-secret** — the `NEXT_PUBLIC_` rule in `code-standards.md` forbids *secrets* behind that prefix; demo credentials guard nothing and are meant to be public. No special demo-login endpoint: the normal auth path exercising the demo is itself part of the demo.
- Mobile: out of scope — the demo exists for link-clicking reviewers, who are on the web.

### 37 Repo & Reviewer Documentation

**Logic:**

- Root `README.md` written for a reviewer with 90 seconds: what SubTrack is and the live URL + demo button in the first screen of text, an architecture overview (three apps, one API, one contract), stack table, **screenshots of web *and* mobile** (reviewers cannot casually run an Expo app — screenshots or a short screen recording are the only way mobile exists for them; capture from the dev build once feature 33's branding lands so the stock Expo icon isn't in the frame), local run instructions, and a pointer to the `context/` docs as the how-it-was-built story (the AI-governance workflow is itself portfolio material).
- **Expose Swagger in production** at its existing path (currently gated off by `NODE_ENV`) and link it from the README. Rationale: the API contract is not a secret — every endpoint shape is already public in this repo — and browsable live API docs are a differentiator almost no portfolio project has; auth still guards all data. This flips a deliberate earlier decision, so record it in `code-standards.md` when done.
- Fix `progress-tracker.md` drift as part of this feature's session: it currently reads "32/32, Next: None" while feature 33 exists in this plan untracked (this phase's own entries are being added in the same update).
- Not in scope, noted for later: the deployment-lessons writeup ("running a correct daily job on hosting that sleeps") belongs on the portfolio/blog, not in this repo's README.

---

## Phase 14 Feature Count

| Phase | Features |
| --- | --- |
| Phase 14 — Production Reliability & Reviewer Readiness | 4 (34–37) |

Ordering within the phase is strict: 34 before 35 (external triggering without catch-up would still double-fire the old non-idempotent logic), 35 before 36 (demo reset reuses the trigger guard and workflow), 37 last (README screenshots want the finished state).