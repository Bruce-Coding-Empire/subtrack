<div align="center">

# 📊 SubTrack

**Never get blindsided by a renewal again.**

A full-stack subscription and recurring-expense tracker — log what you pay for once, and let SubTrack calculate renewals, track payment history, convert currencies, and show you exactly where your money goes.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-TypeORM-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 🧐 The Problem

Subscriptions are invisible once set up. They renew silently, spend creeps up month over month, and there's no single place to see what you're actually paying for — especially when your subscriptions are billed in different currencies (a Netflix sub in USD, a local gym membership in RWF).

**SubTrack gives you one source of truth:** what you're subscribed to, what it costs in one currency, when it renews next, and how your spend is trending.

---

## ✨ Features

- 🔐 **Email/password auth** — self-rolled JWT (access + refresh tokens)
- 💳 **Subscription CRUD** — name, cost, currency, billing cycle (weekly / monthly / yearly / custom), category, start date
- 🔁 **Automatic renewal tracking** — a daily scheduled job advances due renewals and logs payment history, so the spend trend reflects real payments, not projections
- 💱 **Multi-currency support** — every subscription keeps its original currency; dashboard totals convert to your base currency using cached exchange rates
- 📈 **Dashboard** — total monthly/yearly spend, category breakdown, 6-month spend trend, upcoming renewals
- 🔎 **Subscriptions list** — filter by active/cancelled, search by name
- 📱 **Mobile companion app** — full CRUD + dashboard on Expo, talking to the same API as web
- 🧩 **v2-ready scaffolding** — spend limits and notification preferences are modeled in the schema and visible (disabled) in the UI, ready to drop in later

---

## 🧱 Tech Stack

| Layer | Technology | Role |
|---|---|---|
| 🌐 **Web** | Next.js 16 (App Router) | Frontend only — no business logic |
| 🚀 **API** | NestJS | Owns all business logic, auth, DB access, scheduled jobs |
| 📱 **Mobile** | Expo (React Native) + Expo Router | Consumes the same API as web |
| 🗄️ **Database** | PostgreSQL | Single source of truth |
| 🧬 **ORM** | TypeORM | Entities, versioned migrations, repositories |
| 🔑 **Auth** | Nest Passport + JWT | Self-rolled, access + refresh tokens |
| ⏰ **Scheduling** | `@nestjs/schedule` | Renewal advancement, exchange rate refresh |
| 💱 **Currency data** | exchangerate.host | Free FX rates, cached in DB |
| 📊 **Charts** | Recharts (web) / `react-native-chart-kit` (mobile) | Dashboard visualizations |
| 🎨 **Styling** | Tailwind CSS v4 + shadcn/ui (web) · NativeWind (mobile) | Shared design tokens across platforms |
| 🛡️ **Language** | TypeScript (strict) | Across all three apps |

---

## 📁 Project Structure

This is an npm-workspaces monorepo with three independent apps sharing one API contract:

```
subtrack/
├── AGENTS.md              → Entry point for any AI agent working on this repo
├── context/                → Living documentation — architecture, API contract, build plan, UI system
├── apps/
│   ├── web/                → Next.js — UI + API calls only, zero business logic
│   ├── api/                → NestJS — all business logic, auth, DB, scheduled jobs
│   └── mobile/              → Expo React Native — same API contract as web
```

Neither client ever talks to the database directly — every read and mutation goes through the NestJS API. See [`context/architecture.md`](context/architecture.md) for the full breakdown.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- npm 10+
- A running PostgreSQL instance

### Install

```bash
git clone https://github.com/Bruce-Coding-Empire/subtrack.git
cd subtrack
npm install
```

### Configure environment variables

Each app has its own `.env.example` — copy it and fill in real values:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env.local
```

### Run in development

```bash
npm run dev          # web + api together
npm run dev:web       # web only        → http://localhost:3000
npm run dev:api        # api only        → http://localhost:8000 (docs at /api/docs)
npm run dev:mobile       # mobile only     → Expo dev server
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs `web` + `api` concurrently |
| `npm run dev:web` | Starts the Next.js dev server |
| `npm run dev:api` | Starts the NestJS dev server in watch mode |
| `npm run dev:mobile` | Starts the Expo dev server |
| `npm run build:web` | Production build for the web app |
| `npm run build:api` | Production build for the API |

---

## 🗺️ Roadmap

Planned for v2 — deliberately out of scope for v1, but the data model and UI scaffolding are already in place:

- ⏳ Functional monthly spend limits with a live progress bar
- 🔔 Push notifications for renewal reminders and spend-limit alerts
- 🏦 Bank/email auto-detection of subscriptions
- 📤 CSV/PDF export
- 👥 Shared or team subscriptions

---

## 📚 Documentation

This repo is built session-by-session against a living spec in [`context/`](context/) — the single source of truth for architecture, the API contract, the UI system, and build sequencing. Start with [`AGENTS.md`](AGENTS.md) if you're picking up work here, human or AI.

| File | What it covers |
|---|---|
| [`context/progress-tracker.md`](context/progress-tracker.md) | What's done, what's next |
| [`context/project-overview.md`](context/project-overview.md) | Product scope and user flows |
| [`context/architecture.md`](context/architecture.md) | Stack, folder structure, DB schema, invariants |
| [`context/api-contract.md`](context/api-contract.md) | Exact shape of every API endpoint |
| [`context/build-plan.md`](context/build-plan.md) | Numbered, sequenced feature list |
| [`context/code-standards.md`](context/code-standards.md) | Implementation conventions |
| [`context/ui-tokens.md`](context/ui-tokens.md) / [`ui-rules.md`](context/ui-rules.md) / [`ui-registry.md`](context/ui-registry.md) | Design system across web and mobile |
| [`context/git-workflow.md`](context/git-workflow.md) | Branching and commit conventions |

---

<div align="center">

Built as a portfolio project — a relatable, everyday problem, solved end-to-end across web, API, and mobile.

</div>
