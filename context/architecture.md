# Architecture

## Stack

| Layer              | Tool                        | Purpose                                          |
| ------------------ | ---------------------------- | ------------------------------------------------- |
| Web frontend        | Next.js 16 (App Router)     | Frontend only — no server actions/route handlers with business logic |
| Backend API         | Nest.js                     | Owns all business logic, auth, DB, scheduled jobs |
| Mobile              | Expo (React Native)         | Consumes the same API as web                      |
| Database            | PostgreSQL                  | Single source of truth                            |
| ORM                 | TypeORM                     | Entities, migrations, repositories                |
| Auth                | Nest Passport + JWT         | Self-rolled — access + refresh tokens             |
| Scheduled jobs      | `@nestjs/schedule`           | Renewal advancement, exchange rate refresh        |
| Currency data       | open.er-api.com               | Free, keyless FX rates (full ISO 4217 incl. RWF), cached in DB |
| Web charts          | Recharts                    | Dashboard visualizations                          |
| Mobile charts       | react-native-chart-kit      | Dashboard visualizations                           |
| Web styling         | Tailwind CSS v4 + shadcn/ui | UI components                                      |
| Mobile styling      | NativeWind                  | Tailwind classes in React Native                   |
| Language            | TypeScript strict            | Throughout all three apps                          |

---

## Monorepo Structure

```
/
├── AGENTS.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── api-contract.md
│   ├── code-standards.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── apps/
│   ├── web/                                 → Next.js app
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    → Landing
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── subscriptions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── components/
│   │   │   ├── ui/                         → shadcn/ui components only
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsBar.tsx
│   │   │   │   ├── CategoryBreakdown.tsx
│   │   │   │   ├── SpendTrend.tsx
│   │   │   │   └── UpcomingRenewals.tsx
│   │   │   ├── subscriptions/
│   │   │   │   ├── SubscriptionsTable.tsx
│   │   │   │   ├── SubscriptionForm.tsx
│   │   │   │   └── SubscriptionFilters.tsx
│   │   │   └── auth/
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx
│   │   ├── lib/
│   │   │   ├── api-client.ts               → Typed fetch wrapper hitting the Nest API
│   │   │   ├── auth.ts                     → Token storage + refresh logic
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── index.ts                    → Mirrors api-contract.md shapes
│   │
│   ├── api/                                 → Nest.js app
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── modules/                    → LOGIC FOLDER 1 — one module per domain
│   │       │   ├── auth/
│   │       │   │   ├── auth.module.ts
│   │       │   │   ├── auth.controller.ts
│   │       │   │   ├── auth.service.ts
│   │       │   │   ├── jwt.strategy.ts
│   │       │   │   └── dto/
│   │       │   ├── users/
│   │       │   │   ├── users.module.ts
│   │       │   │   ├── users.service.ts
│   │       │   │   └── entities/user.entity.ts
│   │       │   ├── subscriptions/
│   │       │   │   ├── subscriptions.module.ts
│   │       │   │   ├── subscriptions.controller.ts
│   │       │   │   ├── subscriptions.service.ts
│   │       │   │   ├── entities/subscription.entity.ts
│   │       │   │   ├── entities/payment-history.entity.ts
│   │       │   │   └── dto/
│   │       │   ├── dashboard/
│   │       │   │   ├── dashboard.module.ts
│   │       │   │   ├── dashboard.controller.ts
│   │       │   │   └── dashboard.service.ts
│   │       │   ├── currency/
│   │       │   │   ├── currency.module.ts
│   │       │   │   ├── currency.service.ts
│   │       │   │   └── entities/exchange-rate.entity.ts
│   │       │   ├── scheduler/
│   │       │   │   ├── scheduler.module.ts
│   │       │   │   ├── renewal.job.ts
│   │       │   │   ├── exchange-rate.job.ts
│   │       │   │   ├── notification-dispatch.job.ts
│   │       │   │   └── email-scan.job.ts
│   │       │   ├── notifications/
│   │       │   │   ├── notifications.module.ts
│   │       │   │   ├── notifications.controller.ts
│   │       │   │   ├── notifications.service.ts
│   │       │   │   └── entities/notification-preference.entity.ts
│   │       │   ├── integrations/
│   │       │   │   ├── integrations.module.ts
│   │       │   │   ├── gmail-integration.controller.ts
│   │       │   │   ├── gmail-integration.service.ts
│   │       │   │   ├── gmail-api.service.ts    → token refresh + Gmail REST fetch, used by email-scan.job.ts
│   │       │   │   ├── detected-subscriptions.controller.ts   → GET/approve/dismiss for the review UI, feature 30
│   │       │   │   ├── detected-subscriptions.service.ts
│   │       │   │   ├── dto/
│   │       │   │   ├── entities/email-connection.entity.ts
│   │       │   │   └── entities/detected-subscription.entity.ts
│   │       │   └── export/                 → feature 31, file-download exports (no entities — reads subscriptions/payment_history)
│   │       │       ├── export.module.ts
│   │       │       ├── export.controller.ts   → GET /export/subscriptions, GET /export/payment-history
│   │       │       ├── export.service.ts
│   │       │       └── dto/export-query.dto.ts
│   │       └── common/                     → LOGIC FOLDER 2 — cross-cutting concerns
│   │           ├── guards/
│   │           │   └── jwt-auth.guard.ts
│   │           ├── interceptors/
│   │           │   └── response.interceptor.ts
│   │           ├── filters/
│   │           │   └── http-exception.filter.ts
│   │           ├── decorators/
│   │           │   └── current-user.decorator.ts
│   │           └── utils/
│   │               ├── billing-cycle.util.ts   → next_renewal_date calculation
│   │               ├── email-parser.util.ts    → vendor/amount/currency/cycle heuristics for email-scan.job.ts
│   │               ├── csv.util.ts             → manual CSV serialization, feature 31
│   │               └── pdf-table.util.ts       → shared PDFKit table renderer, feature 31
│   │
│   └── mobile/                              → Expo app
│       ├── app/                            → Expo Router
│       │   ├── (auth)/
│       │   │   ├── login.tsx
│       │   │   └── register.tsx
│       │   ├── (tabs)/
│       │   │   ├── dashboard.tsx
│       │   │   ├── subscriptions.tsx
│       │   │   ├── alerts.tsx
│       │   │   └── settings.tsx
│       │   └── subscription/
│       │       ├── [id].tsx
│       │       └── add.tsx
│       ├── components/
│       │   ├── dashboard/
│       │   ├── subscriptions/
│       │   └── ui/
│       └── lib/
│           ├── api-client.ts               → Same contract as web, adapted for RN
│           └── auth.ts                     → SecureStore-based token storage
```

---

## System Boundaries

| Location            | Owns                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------- |
| `apps/web`           | UI rendering and API calls only. No business logic, no DB access.                       |
| `apps/mobile`        | UI rendering and API calls only. No business logic, no DB access.                       |
| `apps/api/modules`   | All business logic, one module per domain. This is the only place that touches the DB.  |
| `apps/api/common`    | Cross-cutting concerns shared across modules — guards, interceptors, filters, decorators, pure utility functions. |
| `context/`           | Documentation only. Never imported by code.                                             |

Neither client ever queries the database directly or holds a DB credential. All state changes go through the API.

---

## Data Flow

### Web / Mobile → API (all mutations and reads)

```
User interaction in component
        ↓
lib/api-client.ts — typed fetch call, attaches JWT
        ↓
Nest.js controller (apps/api/modules/*)
        ↓
Service layer — business logic, DB access via TypeORM
        ↓
JSON response matching api-contract.md
        ↓
Client updates local state / revalidates
```

### Scheduled Renewal Job

```
Triggered by EITHER @nestjs/schedule cron (00:05 server time, fires only while the
process is awake) OR POST /jobs/renewals/run (GitHub Actions daily, wakes the host)
        ↓
scheduler/renewal.job.ts queries subscriptions where next_renewal_date <= today AND status = 'active'
        ↓
For each: CATCH-UP LOOP — while next_renewal_date <= today: write one payment_history
row dated at that due date (paidAt = due date, never run date), advance
next_renewal_date one cycle via billing-cycle.util.ts, repeat (capped, feature 34)
        ↓
Job completion logged (processed / paymentsLogged / failures — returned to the
external trigger as its response body)
```

Why the loop: production hosting sleeps, so runs are irregular; a subscription can be
several cycles overdue when the job finally fires. Single-advance would leave it
permanently overdue and permanently missing history rows. The loop makes the job's
output independent of its schedule — and idempotent, which is what makes it safe for
the in-process cron and the external trigger to both fire on the same day.

### External Job Triggers (feature 35)

```
GitHub Actions schedule (daily, UTC) — .github/workflows/scheduled-jobs.yml
        ↓
Sequential POSTs, x-job-key header (JOB_TRIGGER_SECRET, timing-safe compare in JobTriggerGuard):
  /jobs/renewals/run → /jobs/notifications/run → /jobs/email-scan/run → /jobs/exchange-rates/run
  (→ /jobs/demo/reset nightly, feature 36)
        ↓
First request wakes a sleeping Render instance (cold start absorbed by the request);
sequencing in one workflow replaces the old cron-offset ordering (00:05/00:15/01:00),
which silently assumed the process stayed awake across the whole window — the
notification job reads state the renewal job produces, so order is a dependency
        ↓
GET /health (public, DB-free) serves Render's healthCheckPath and an external uptime
pinger (~10 min) that keeps the instance warm for human visitors — UX, not correctness
```

Only the renewal job needs catch-up logic. Notification reminders are forward-looking
(a missed day is just a missed reminder), the email scan's newer_than:2d Gmail window
covers a one-day gap once triggering is daily, and FX conversion reads the latest
cached rate, so staleness degrades gracefully. Renewals is the only job where a missed
run leaves permanently wrong state rather than a transient gap.

### Exchange Rate Refresh Job

```
@nestjs/schedule cron fires every 6 hours
        ↓
scheduler/exchange-rate.job.ts calls exchangerate.host
        ↓
Upserts rates into exchange_rates table, keyed by currency pair + date
        ↓
Dashboard reads always hit the cached table — never the live API
```

### Push Notification Dispatch Job

```
@nestjs/schedule cron fires daily (00:15 server time, after renewal.job.ts's 00:05 run)
        ↓
scheduler/notification-dispatch.job.ts queries notification_preferences for renewalRemindersEnabled /
spendLimitAlertsEnabled users with a stored push token
        ↓
For each: finds subscriptions renewing in the next 3 days; renewal reminders are queued directly,
spend-limit alerts are queued only if projected current-month spend (via dashboard.service.ts's
getCurrentMonthSpend + currency.service.ts conversion) would exceed the user's monthlySpendLimit
        ↓
Queued messages sent via expo-server-sdk in chunks
        ↓
Job completion logged (queued counts, sent count, failure count)
```

### Email Scan Job

```
@nestjs/schedule cron fires daily (01:00 server time — independent of the other jobs, just spaced out)
        ↓
scheduler/email-scan.job.ts queries email_connections for every stored Gmail connection
        ↓
For each: gmail-api.service.ts refreshes an access token (via the stored refresh_token), then searches
Gmail (subject/sender heuristics, last ~2 days) and fetches candidate message metadata + snippets
        ↓
Skips any gmail_message_id already present for that user; new ones parsed via email-parser.util.ts
(vendor name from the From header, amount/currency/cycle from subject+snippet, best-effort)
        ↓
Inserted into detected_subscriptions as status: 'pending' — never written directly to subscriptions
        ↓
Job completion logged (detected count, already-seen count, failed-connection count)
```

---

## Database Schema

### `users`

| Column          | Type        | Notes                        |
| ---------------- | ----------- | ----------------------------- |
| id                | uuid        | Primary key                   |
| email             | text        | Unique                        |
| name              | text        | Display name, set at registration, editable in settings |
| password_hash     | text        | bcrypt                        |
| base_currency     | text        | ISO 4217 code, default 'RWF'  |
| monthly_spend_limit | numeric   | Nullable — v2 field, present in v1 schema |
| created_at        | timestamptz |                               |

### `subscriptions`

| Column              | Type        | Notes                                             |
| -------------------- | ----------- | --------------------------------------------------- |
| id                    | uuid        | Primary key                                         |
| user_id               | uuid        | References users                                    |
| name                  | text        |                                                      |
| cost                  | numeric     | Amount in original currency                         |
| currency              | text        | ISO 4217 code                                       |
| billing_cycle         | text        | weekly / monthly / yearly / custom                  |
| custom_interval_days  | integer     | Only used when billing_cycle = 'custom'             |
| category              | text        | entertainment / software / fitness / utilities / other |
| status                | text        | active / cancelled                                  |
| start_date            | date        |                                                      |
| next_renewal_date     | date        | Calculated, advanced by scheduled job               |
| created_at            | timestamptz |                                                      |

### `payment_history`

| Column          | Type        | Notes                              |
| ---------------- | ----------- | ------------------------------------ |
| id                | uuid        | Primary key                         |
| subscription_id   | uuid        | References subscriptions            |
| user_id           | uuid        | References users — denormalized for fast dashboard queries |
| amount            | numeric     | Amount charged, original currency   |
| currency          | text        |                                      |
| paid_at           | date        | Date the renewal job logged this    |
| created_at        | timestamptz |                                      |

Append-only. Never updated or deleted by user actions.

### `exchange_rates`

| Column        | Type        | Notes                          |
| -------------- | ----------- | -------------------------------- |
| id              | uuid        | Primary key                     |
| base_currency   | text        |                                 |
| target_currency | text        |                                 |
| rate            | numeric     |                                 |
| fetched_at      | timestamptz |                                 |

Unique constraint on `(base_currency, target_currency, fetched_at::date)`. Reads always take the most recent row for a pair.

### `notification_preferences` (v2 — table exists in v1 schema, not read/written by any v1 feature)

| Column                  | Type    | Notes                     |
| ------------------------ | ------- | --------------------------- |
| id                        | uuid    | Primary key                |
| user_id                   | uuid    | References users           |
| renewal_reminders_enabled | boolean | Default false               |
| spend_limit_alerts_enabled | boolean | Default false               |
| push_token                | text    | Nullable                    |

### `email_connections` (v2 — Phase 11, Gmail read-only OAuth connection)

| Column                    | Type        | Notes                     |
| -------------------------- | ----------- | --------------------------- |
| id                          | uuid        | Primary key                |
| user_id                     | uuid        | References users           |
| provider                    | text        | Default `'gmail'`           |
| access_token_encrypted      | text        | AES-256-GCM, see `common/utils/encryption.util.ts` |
| refresh_token_encrypted     | text        | Nullable — Google only returns a refresh token when `prompt=consent` forces it |
| connected_at                | timestamptz |                             |

Unique constraint on `(user_id, provider)` — one connection per provider per user. Written only by `GmailIntegrationService` (`modules/integrations/`); read by `EmailScanJob` (`modules/scheduler/email-scan.job.ts`, feature 28).

### `detected_subscriptions` (v2 — Phase 11, staging table for Gmail-detected subscriptions)

| Column            | Type        | Notes                     |
| ------------------ | ----------- | --------------------------- |
| id                  | uuid        | Primary key                |
| user_id             | uuid        | References users           |
| gmail_message_id    | text        | Gmail's message id — dedupe key so a re-scan never re-detects the same email |
| vendor_name         | text        | Nullable — parsed from the email's `From` header display name |
| amount              | numeric     | Nullable — parsed from subject/snippet text, best-effort |
| currency            | text        | Nullable — parsed alongside amount |
| billing_cycle       | text (enum) | Nullable — `weekly`/`monthly`/`yearly`/`custom`, keyword-matched, often unresolvable from a single receipt email |
| raw_subject         | text        | Original email subject — review-UI context for feature 29/30 |
| received_at         | timestamptz | Nullable — Gmail's `internalDate` |
| status              | text (enum) | `pending` / `approved` / `dismissed`, default `pending` |
| detected_at         | timestamptz |                             |

Unique constraint on `(user_id, gmail_message_id)`. Written only by `EmailScanJob` (always as `status: 'pending'`) — status transitions to `approved`/`dismissed` happen only via feature 30's review endpoints, never a direct insert/update elsewhere.

---

## Auth

- Self-rolled JWT via Nest Passport — no third-party auth vendor
- Access token: 15 minute expiry, short-lived
- Refresh token: 7 day expiry, stored httpOnly + secure cookie on web, Expo SecureStore on mobile
- `POST /auth/refresh` issues a new access token from a valid refresh token
- `JwtAuthGuard` (in `common/guards/`) protects every route except `/auth/*` and health checks
- Password hashing: bcrypt, 10 salt rounds

---

## Invariants

Rules the AI agent must never violate:

- `apps/web` and `apps/mobile` never contain business logic — only UI and API calls.
- `apps/api/modules` is the only place TypeORM repositories are used.
- Every module owns its own entities, controller, service, and DTOs — never share a controller across domains.
- `common/` contains no domain logic — only cross-cutting, reusable concerns.
- Every API response matches the shape documented in `api-contract.md` — update the contract file first if a shape must change, then update both clients.
- `payment_history` is written only by `renewal.job.ts` — never by a user-facing endpoint.
- `next_renewal_date` is only ever calculated via `common/utils/billing-cycle.util.ts` — never inlined elsewhere.
- Dashboard currency totals always read from the cached `exchange_rates` table — never call the FX API directly from a request path.
- Every endpoint validates its DTO with `class-validator` before touching the service layer.
- JWT access tokens are never stored in localStorage on web — httpOnly cookie only.
- Scheduled jobs always wrap their work in try/catch and log failures — one failed subscription must never stop the whole run.
- Gmail OAuth tokens are never stored in plaintext — always through `common/utils/encryption.util.ts` before hitting `email_connections`, and never logged.
- `detected_subscriptions` is only ever inserted by `EmailScanJob` — no user-facing endpoint creates a row directly. Approving one (feature 30) creates a real `subscriptions` row through the existing `subscriptions.service` create path, it never mutates `detected_subscriptions` into a live subscription in place.