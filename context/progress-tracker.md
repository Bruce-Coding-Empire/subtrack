# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 03 Auth — API
**Next:** 04 Auth — Web UI + Wiring

---

## Progress

### Phase 1 — Foundation

- [x] 01 Monorepo + Tooling Setup
- [x] 02 Database Schema + Migrations
- [x] 03 Auth — API
- [ ] 04 Auth — Web UI + Wiring

### Phase 2 — Subscriptions Core

- [ ] 05 Subscriptions API
- [ ] 06 Subscriptions Page — Web UI (mock data)
- [ ] 07 Subscriptions — Web Wiring

### Phase 3 — Renewals, History & Currency

- [ ] 08 Renewal Scheduled Job
- [ ] 09 Currency Module + Exchange Rate Job

### Phase 4 — Dashboard

- [ ] 10 Dashboard API
- [ ] 11 Dashboard Page — Web UI (mock data)
- [ ] 12 Dashboard — Web Wiring

### Phase 5 — Settings

- [ ] 13 Settings Page — Web (Full, incl. v2 scaffolding)

### Phase 6 — Mobile App

- [ ] 14 Mobile Auth
- [ ] 15 Mobile Subscriptions
- [ ] 16 Mobile Dashboard
- [ ] 17 Mobile Settings

---

## Decisions Made During Build

- `context/git-workflow.md` was missing on session start despite being required reading in `AGENTS.md`; it has since been added.
- `apps/mobile` had already been scaffolded via `create-expo-app`'s default "src directory" template (`src/app`, `src/components`, etc.), which contradicted the flat `app/`, `components/`, `lib/` layout documented in `architecture.md`. Flattened it to match `architecture.md` exactly (moved `src/*` to the app root, updated the `@/*` path alias in `tsconfig.json`). Deleted the stock `scripts/reset-project.js` and its `package.json` script since it hardcoded the old `src/` paths and doesn't apply to this project.
- NativeWind pinned to `nativewind@^4.2.6` with `tailwindcss@^3.4.0` in `apps/mobile` (NativeWind v4 requires Tailwind v3's config-based API, not v4's `@theme` syntax — matches the distinction already called out in `ui-rules.md`). `apps/web` keeps `tailwindcss@^4`; npm workspaces nests a separate `tailwindcss@4.3.3` under `apps/web/node_modules` to keep the two versions from colliding at the hoisted root.
- Added `expo-env.d.ts` and `nativewind-env.d.ts` to `apps/mobile` — Expo/NativeWind normally generate these on first `expo start`/`expo install` run; created manually since the app had never been run. Both are gitignored, consistent with being generated files.
- `npx expo export --platform web` fails on this monorepo layout with `Cannot find module 'expo-router/build/utils/url'` — a pre-existing hoisting issue where `expo-router` resolves to a nested `apps/mobile/node_modules` copy that `@expo/cli`'s static-export step can't reach via plain Node `require`. Metro itself bundles the app successfully (verified: 1226 modules, web platform), and static web export isn't in v1 scope for mobile (native app via Expo Go/simulators), so this was left unresolved. Revisit if a future feature needs `expo export --platform web`.
- `apps/api/tsconfig.json` had `baseUrl` but no `paths` entry, so `code-standards.md`'s mandated `@/` import alias had nothing to resolve against for the API. Fixed as `"paths": { "@/*": ["./src/*"] }` with **no `baseUrl`** — `baseUrl` is deprecated (removed in TS 7.0) and TS 5.9.3 errors on the `"ignoreDeprecations": "6.0"` value the deprecation message itself suggests, so the correct fix is to drop `baseUrl` entirely rather than silence the warning. Since TS 4.1, `paths` resolves relative to the tsconfig file's own location when `baseUrl` is unset (path values must then start with `./`) — this matches the pattern `apps/web/tsconfig.json` already uses. Verified empirically (not assumed) that the Nest CLI's own compiler — used by both `nest build` and `nest start --watch` — already rewrites `@/...` imports to correct relative `require()` paths in the emitted JS, so no extra runtime tooling (`tsc-alias`, `tsconfig-paths/register`) is needed; a first attempt to add `tsc-alias` as a belt-and-suspenders measure was reverted once testing showed it was redundant. Plain `tsc` (not routed through `nest build`) does *not* do this rewrite — don't reach for raw `tsc` for anything that needs `@/` imports in this app.
- `npm install typeorm` pulled **`typeorm@1.1.0`** — TypeORM has since graduated off its long-standing 0.3.x pre-1.0 line to a stable 1.x major (confirmed via `npm view typeorm version`, not assumed). All patterns in `library-docs.md` (entity decorators, `DataSource`, migration CLI) still work unchanged against 1.1.0; noting the version jump so a future session isn't surprised by `"typeorm": "^1.1.0"` in `package.json`.
- Added a hand-written `SnakeNamingStrategy` at `apps/api/src/common/utils/snake-naming.strategy.ts` (extends TypeORM's `DefaultNamingStrategy`, no new dependency) so entity properties stay camelCase (per `code-standards.md`/`library-docs.md` entity examples) while actual Postgres columns are snake_case (per `architecture.md`'s documented schema, e.g. `next_renewal_date`, `password_hash`). Registered in both `app.module.ts`'s `TypeOrmModule.forRootAsync` and the CLI-only `database/data-source.ts`.
- `architecture.md`'s monorepo tree has no dedicated `notifications` module, so the v2-scaffolded `notification_preferences` entity was placed at `modules/users/entities/notification-preference.entity.ts` (user-owned data, not wired into any service/controller — table exists per the build plan, nothing reads/writes it in v1).
- `exchange_rates`'s documented unique constraint — `(base_currency, target_currency, fetched_at::date)` — is a Postgres *expression* index that TypeORM entity decorators can't express directly. Generated the migration from entities first, then hand-added `CREATE UNIQUE INDEX ... (("fetched_at")::date)` (and its `DROP INDEX` in `down()`) directly in the migration file. **Flag for feature 09**: `library-docs.md`'s example upsert (`currency.service.ts`) uses a two-column conflict target (`["baseCurrency", "targetCurrency"]`), which won't match this three-column unique index — Postgres `ON CONFLICT` requires an exact match to a real unique constraint/index. Reconcile this when building the Currency Module (either upsert conflict target must become 3 columns using today's date, or the constraint should drop the date component — revisit then, not decided now).
- The TypeORM CLI (`typeorm-ts-node-commonjs`, used for `migration:generate`/`migration:run`/`migration:revert`) runs on raw `ts-node`, which — unlike `nest build`/`nest start` — does **not** rewrite `@/` path aliases on its own. Fixed by adding a `"ts-node": { "require": ["tsconfig-paths/register"] }` block to `apps/api/tsconfig.json`; `ts-node` auto-reads this block, so no extra CLI flags or `NODE_OPTIONS` juggling needed, and it's cross-platform (matters since this session runs both PowerShell and Git Bash).
- TypeORM's default `uuid` primary key strategy emits `DEFAULT uuid_generate_v4()`, which requires the `uuid-ossp` Postgres extension. Not enabled by default on a fresh database, so `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` was added as the first statement in the initial migration's `up()`.
- Local Postgres runs as an already-installed Windows service (`postgresql-x64-18`, verified via `Get-Service`), not Docker — no `docker-compose.yml` needed for this project. The `subtrack` database didn't exist yet and was created manually via `psql -U postgres -c "CREATE DATABASE subtrack;"` before running migrations.
- Dev seed script (`apps/api/src/database/seed.ts`, run via `npm run seed`) creates one test user (`test@subtrack.dev` / `Password123!`, bcrypt-hashed at 10 rounds per `library-docs.md`) and 7 subscriptions spanning all 5 categories and 3 currencies (USD, RWF, EUR), covering weekly/monthly/yearly/custom-adjacent cycles. `start_date`/`next_renewal_date` are hardcoded fixture values rather than computed — `billing-cycle.util.ts` doesn't exist until feature 05, and this is one-off seed data rather than a runtime calculation path, so the "`next_renewal_date` only via `billing-cycle.util.ts`" invariant (which governs application code) doesn't apply here. Script is idempotent — deletes any existing seeded user (and their subscriptions) by email before inserting, safe to re-run.
- Installed `bcrypt` (+ `@types/bcrypt`) now rather than deferring to feature 03, since the seed script needed a real password hash for the test user to be usable once Auth API lands. Already on the approved dependency list in `code-standards.md`.
- **03 Auth — API.** Installed `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` (+ `@types/passport-jwt`) — all on the approved list except bare `passport`, which is an unavoidable peer dependency of the other two, not a discretionary addition. Also installed `@nestjs/swagger` here (moved up from its own placeholder — see below) since feature 03 is where the build plan says the Swagger bootstrap and first decorated controller happen together.
- `api-contract.md`'s documented register/login response was missing `refreshToken` in the body, but `library-docs.md`'s Nest Passport + JWT rules explicitly require it there for mobile (no cookies to rely on). Updated `api-contract.md` first (per its own "update the contract file first" rule) to include `refreshToken` in the response `data`, with a note that web ignores the body copy and relies on the httpOnly cookie instead — mobile's `expo-secure-store` persistence (feature 14) is the only consumer of that field.
- Skipped the `cookie-parser` package for reading the refresh token off the web request in `POST /auth/refresh` — it's not on the approved dependency list in `code-standards.md`, and Express's `res.cookie()` (used to *set* the httpOnly cookie) doesn't require it. Wrote a ~10-line manual parser (`common/utils/cookie.util.ts`) instead, consistent with this project's existing preference for hand-rolled solutions over new dependencies for trivial needs (see the `SnakeNamingStrategy` decision above).
- `main.ts`'s Swagger setup (added in an earlier session, ahead of this feature) used path `docs` with no production gate. Corrected to match `library-docs.md` exactly: mounted at `api/docs`, wrapped in `if (process.env.NODE_ENV !== 'production')`. Also added the global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) and a global `common/filters/http-exception.filter.ts` here, since `03 Auth — API` is the first feature with DTOs/endpoints to validate and error-format.
- `common/filters/http-exception.filter.ts` uses `@Catch()` (not `@Catch(HttpException)`) so *every* unhandled error — not just ones we explicitly throw — gets converted to the `{ success: false, error }` shape `api-contract.md` mandates, including framework-level 404s for unmatched routes. Non-`HttpException` errors are logged with `Logger.error` and collapsed to a generic "Internal server error" message, per `code-standards.md`'s "never expose internals" rule.
- Logout has no server-side token invalidation — `architecture.md`'s schema has no refresh-token/blacklist table, and adding one wasn't in scope for this feature. Web logout clears the httpOnly cookie; mobile logout is a client-side `SecureStore.deleteItemAsync` (per `library-docs.md`), already documented as the mobile pattern. Revisit only if a future feature explicitly calls for server-side revocation.
- All four endpoints (`register`, `login`, `refresh`, `logout`) verified end-to-end against a live `nest start --watch` instance and the real local Postgres DB — not just `tsc`/lint: register → 201, login/refresh/logout → 200 (Nest defaults `@Post()` to 201, so `@HttpCode(HttpStatus.OK)` was added explicitly to the three non-creation endpoints), wrong password and missing/garbage refresh tokens → 401, duplicate email → 409, invalid DTO body → 400, unauthenticated logout → 401, unknown route → 404 — all in the `{ success, data?, error? }` shape.
- Nest's `start:dev` (`nest start --watch`) on this Windows setup occasionally spawns a new child process on file-change recompiles before the previous one has released port 3001, so a few `EADDRINUSE` crashes appear in dev server logs around rapid successive edits. The newest process always wins the port and serves correctly (verified — no functional impact), it's just log noise. Not investigated further since it's a local dev-tooling quirk unrelated to app code.

---

## Notes

- `.env.example` templates added for all three apps (`apps/web`, `apps/api`, `apps/mobile`) matching the env var table in `code-standards.md`. `apps/web/.gitignore` blanket-ignored `.env*`; added a `!.env.example` exception so the template stays committed.
- Verified end-to-end: `npm run build:web` (Next.js production build), `npm run build:api` (Nest build), and `npx tsc --noEmit` + `expo export --platform web` (bundle-only) for `apps/mobile` all succeed.
- `apps/api` DB workflow: `npm run migration:generate -- src/database/migrations/<Name>` (diffs entities against the DB), `npm run migration:run`, `npm run migration:revert`, `npm run seed` — all run from `apps/api/`. Entities live one-per-module under `modules/*/entities/`; the full entity list for `TypeOrmModule`/the CLI `DataSource` is centralized in `apps/api/src/database/entities.ts` so both stay in sync. Verified end-to-end: migration generated from entities, ran clean against a fresh local `subtrack` Postgres database, seed script populated it, and `npm run build` + a live `node dist/main.js` boot both succeeded with `TypeOrmModule` connecting successfully.