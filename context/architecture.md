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
│   │       │   │   └── exchange-rate.job.ts
│   │       │   └── notifications/
│   │       │       ├── notifications.module.ts
│   │       │       ├── notifications.controller.ts
│   │       │       ├── notifications.service.ts
│   │       │       └── entities/notification-preference.entity.ts
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
│   │               └── billing-cycle.util.ts   → next_renewal_date calculation
│   │
│   └── mobile/                              → Expo app
│       ├── app/                            → Expo Router
│       │   ├── (auth)/
│       │   │   ├── login.tsx
│       │   │   └── register.tsx
│       │   ├── (tabs)/
│       │   │   ├── dashboard.tsx
│       │   │   ├── subscriptions.tsx
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
@nestjs/schedule cron fires daily (00:05 server time)
        ↓
scheduler/renewal.job.ts queries subscriptions where next_renewal_date <= today AND status = 'active'
        ↓
For each: write payment_history row, advance next_renewal_date via billing-cycle.util.ts
        ↓
Job completion logged
```

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