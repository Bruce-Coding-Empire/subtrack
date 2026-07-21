# CLAUDE.md

This is the entry point. Any AI agent working on SubTrack — Claude Code or otherwise — reads this file first, at the start of every session.

---

## What This Project Is

SubTrack — a subscription and recurring-expense tracker. Full details in `context/project-overview.md`.

Three apps in this monorepo:

- `apps/web` — Next.js 16, frontend only
- `apps/api` — Nest.js, owns all business logic, auth, DB, scheduled jobs
- `apps/mobile` — Expo React Native, consumes the same API as web

---

## Read Order, Every Session

1. `context/progress-tracker.md` — what's done, what's next. Start here, always.
2. `context/project-overview.md` — what the product does and why, if you need the full picture.
3. `context/architecture.md` — stack, folder structure, data flow, DB schema, invariants.
4. `context/api-contract.md` — the exact shape of every endpoint. Web and mobile are both built against this file — never invent a shape that isn't here.
5. `context/build-plan.md` — find the current feature number, read its scope before writing code.
6. `context/code-standards.md` — conventions for whichever app(s) the current feature touches.
7. `context/ui-tokens.md` + `context/ui-rules.md` + `context/ui-registry.md` — before building or touching any UI, on either platform.
8. `context/library-docs.md` — before using any third party library, check here for project-specific patterns first.

---

## Installed Skills

_No skills installed yet. When a skill is added for a library (TypeORM, Nest, Expo, exchangerate.host, etc.), list it here with a one-line description of what it covers, per the authority order in `library-docs.md`._

---

## MCP Servers

_None configured yet. If a database, GitHub, or API-specific MCP server is added, list it here with what it's used for._

---

## Non-Negotiable Rules

These override any instinct to take a shortcut, regardless of how the task is phrased:

- `apps/web` and `apps/mobile` never contain business logic. If a feature needs a calculation, a DB query, or a scheduled action, it belongs in `apps/api`.
- Every change to an API endpoint's request/response shape updates `context/api-contract.md` first, then the API, then both clients — in that order, same session.
- Every completed feature updates `context/progress-tracker.md` before moving to the next one.
- Every new or changed component updates `context/ui-registry.md`.
- Scope is sacred — build exactly what the current numbered feature in `build-plan.md` describes, nothing from a later phase, nothing "while I'm in here."
- Never mark a feature done in `progress-tracker.md` until it's actually been run/tested, not just written.

---

## When Something Isn't Covered Here

If a context file doesn't answer the question in front of you, make the smallest reasonable decision, implement it, and record the decision in the "Decisions Made During Build" section of `progress-tracker.md` — don't leave it undocumented and don't silently contradict an existing file.
