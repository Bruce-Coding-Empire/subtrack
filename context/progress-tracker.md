# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 01 Monorepo + Tooling Setup
**Next:** 02 Database Schema + Migrations

---

## Progress

### Phase 1 — Foundation

- [x] 01 Monorepo + Tooling Setup
- [ ] 02 Database Schema + Migrations
- [ ] 03 Auth — API
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

---

## Notes

- `.env.example` templates added for all three apps (`apps/web`, `apps/api`, `apps/mobile`) matching the env var table in `code-standards.md`. `apps/web/.gitignore` blanket-ignored `.env*`; added a `!.env.example` exception so the template stays committed.
- Verified end-to-end: `npm run build:web` (Next.js production build), `npm run build:api` (Nest build), and `npx tsc --noEmit` + `expo export --platform web` (bundle-only) for `apps/mobile` all succeed.