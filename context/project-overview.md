# Project Overview

## About the Project

SubTrack is a full stack subscription and recurring-expense tracker. The user logs every subscription they pay for — streaming, software, gym, hosting, whatever — once. SubTrack automatically calculates when each one renews, tracks payment history over time via a scheduled job, converts everything into the user's base currency, and shows a clean dashboard of total spend, category breakdown, spend trend, and upcoming renewals.

Available on web (Next.js) and mobile (Expo React Native), both talking to one Nest.js API.

---

## The Problem It Solves

Subscriptions are invisible once set up. They renew silently, spend creeps up over months, and there's no single place to see what you're actually paying for — especially when subscriptions are billed in different currencies (a Netflix sub in USD, a local gym membership in RWF).

SubTrack gives a single source of truth: what you're subscribed to, what it costs you in one currency, when it renews next, and how your spend is trending.

---

## Apps

```
apps/web       → Next.js 16 — frontend only, consumes the API, no business logic
apps/api        → Nest.js — owns all business logic, auth, DB, scheduled jobs
apps/mobile     → Expo React Native — consumes the same API as web
```

Web and mobile are two independent clients of one API. Neither talks to the database directly. See `api-contract.md` for the single source of truth both clients are built against.

---

## Pages / Screens

**Web**

```
/                     → Landing page
/login, /register     → Auth
/dashboard            → Total spend, category breakdown, trend, upcoming renewals, spend limit status
/subscriptions        → List, filter (active/cancelled), search
/subscriptions/[id]   → Detail, edit, payment history
/settings             → Profile, base currency, notification preferences (v2)
```

**Mobile**

```
Login / Register
Dashboard (summary + mini charts + upcoming renewals)
Subscriptions list
Add / Edit subscription
Settings
```

---

## Navigation

**Web:** top navbar, full width, no sidebar. Nav items: `Dashboard`, `Subscriptions`, `Settings`.
**Mobile:** bottom tab bar. Tabs: `Dashboard`, `Subscriptions`, `Add` (center, prominent), `Settings`.

---

## Core User Flow

### Onboarding

- User registers with name, email + password — name is required, used as the display name throughout the app (navbar, mobile dashboard greeting, settings)
- JWT access + refresh token issued
- On login → redirect to `/dashboard`
- Dashboard shows an empty state with "Add your first subscription" CTA if none exist

### Adding a Subscription

- User fills: name, cost, currency, billing cycle (weekly / monthly / yearly / custom interval in days), category, start date
- API calculates `next_renewal_date` from `start_date` + `billing_cycle`
- Subscription appears immediately in the list and counts toward dashboard totals

### Renewal Tracking (Scheduled Job)

- A daily cron job (`@nestjs/schedule`) runs against the API
- Finds every active subscription where `next_renewal_date <= today`
- For each one: writes a row to `payment_history` (amount, currency, date), then advances `next_renewal_date` by one billing cycle
- This is what powers the spend trend chart — it reflects actual logged payments over time, not projections

### Currency Conversion

- User sets a base currency in settings (default: RWF)
- Every dashboard total is converted to base currency using cached exchange rates
- Exchange rates fetched from a free FX API, cached in DB, refreshed on a schedule (not on every request — see `library-docs.md`)
- Individual subscription list items still show their original currency; only aggregated totals are converted

### Dashboard

- Total monthly-equivalent spend (all cycles normalized to a monthly figure) and total yearly spend, both in base currency
- Category breakdown — pie chart
- Spend trend — line chart, built from `payment_history`, last 6 months
- Upcoming renewals — list, next 7 and next 30 days
- Spend limit status (v2 feature, UI placeholder built in v1 — see below)

### Spend Limits & Alerts (v2, scaffolded in v1)

- Out of functional scope for v1, but the data model and a disabled/"Coming soon" UI section are included in v1 so the pattern is visible and the feature is a clean drop-in later
- v2: user sets a monthly spend limit; dashboard shows progress bar; push notification fires when a renewal is about to push spend over the limit

### Push Notifications (v2, scaffolded in v1)

- Out of functional scope for v1
- v1 includes the `notification_preferences` table/columns and a disabled settings UI section, but no actual push delivery
- v2: Expo push notifications for upcoming renewals and spend limit warnings

---

## Data Architecture

### Subscriptions

- Lives in `subscriptions` table, owned by `user_id`
- Only changes when user creates, edits, or cancels a subscription
- `next_renewal_date` is recalculated by the app on create/edit and advanced by the cron job on renewal

### Payment History

- Lives in `payment_history` table
- Append-only — written exclusively by the renewal cron job, never edited by the user
- Powers the spend trend chart

### Exchange Rates

- Lives in `exchange_rates` table, cached
- Refreshed on a schedule, never fetched live on a per-request basis

---

## Features In Scope (v1)

- Email/password auth — self-rolled JWT (access + refresh)
- Subscription CRUD (name, cost, currency, billing cycle, category, start date, status)
- Automatic `next_renewal_date` calculation on create/edit
- Daily scheduled job — advances due renewals, logs payment history
- Payment history log per subscription
- Currency conversion to user's base currency, cached exchange rates
- Dashboard: total spend (monthly + yearly), category breakdown, spend trend, upcoming renewals
- Subscriptions list — filter (active/cancelled), search
- Mobile companion app (Expo) — full CRUD + dashboard, same API
- Scaffolded (UI + data model only, not functional) spend limits and notification preferences

## Features Out of Scope (v1 — planned v2)

- Functional spend limits and over-limit warnings
- Push notifications (renewal reminders, spend limit alerts)
- Email auto-detection of subscriptions (bank auto-detection is excluded outright — see `build-plan.md`'s v2 Roadmap)
- Shared or team subscriptions
- Subscription pause (vs cancel)
- Data export (CSV/PDF)
- Social/sharing features

---

## Target User

Anyone paying for multiple recurring subscriptions across different services and currencies who wants one place to see total spend and stay ahead of renewals — a relatable, universal problem, useful as a demo to any interviewer.

---

## Success Criteria

- User can register, add a subscription, and see it reflected correctly on the dashboard in under 2 minutes
- `next_renewal_date` calculates correctly for weekly, monthly, yearly, and custom-interval cycles
- Scheduled job correctly advances renewals and logs payment history without manual intervention
- Currency conversion totals are accurate against cached exchange rates
- Dashboard charts render correctly with real data and show a sensible empty state with none
- Web and mobile both consume the same API contract without drift
- UI is visually consistent across web and mobile using shared tokens