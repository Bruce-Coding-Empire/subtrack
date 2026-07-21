---
name: typeorm-migrations
description: Use when generating, running, or reverting a TypeORM migration in apps/api, or when adding/changing an entity, column, or constraint. Covers this project's own gotchas — the uuid-ossp extension, the hand-rolled SnakeNamingStrategy, the centralized entity list, the tsconfig-paths fix the CLI needs, and how to hand-add constraints TypeORM decorators can't express — so a session doesn't rediscover them from scratch. Trigger on "migration:generate", "migration:run", "migration:revert", "add a column", "add an entity", "new migration", "TypeORM".
---

# TypeORM Migrations (apps/api)

For entity/decorator patterns, see `context/library-docs.md`. This skill is the procedural workflow and the project-specific pitfalls around actually running migrations.

## Workflow (run from `apps/api/`)

```
npm run migration:generate -- src/database/migrations/<Name>   # diffs entities against the DB
npm run migration:run
npm run migration:revert
npm run seed
```

Never set `synchronize: true`, even temporarily to "check something quick" — this project uses versioned migrations only, from day one. Generate a migration instead.

## Known gotchas — don't rediscover these

1. **`uuid-ossp` extension.** TypeORM's default `uuid` primary key strategy emits `DEFAULT uuid_generate_v4()`, which needs the `uuid-ossp` Postgres extension. It's not enabled on a fresh DB — the initial migration's `up()` starts with `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`. Only relevant again if migrating against a brand-new database.

2. **snake_case columns, camelCase entities.** A hand-written `SnakeNamingStrategy` (`apps/api/src/common/utils/snake-naming.strategy.ts`, extends TypeORM's `DefaultNamingStrategy`) converts entity properties to snake_case columns automatically — registered in both `app.module.ts`'s `TypeOrmModule.forRootAsync` and the CLI-only `database/data-source.ts`. Don't hand-map individual columns with `@Column({ name: '...' })`; the strategy already does it.

3. **Centralized entity list.** `apps/api/src/database/entities.ts` is the single source of truth for the entity list used by both `TypeOrmModule` and the CLI `DataSource`. A new entity must be added there — adding it only to a module's imports won't make `migration:generate` see it.

4. **CLI needs its own path-alias fix.** `typeorm-ts-node-commonjs` (used by `migration:generate`/`run`/`revert`) runs on raw `ts-node`, which — unlike `nest build`/`nest start --watch` — does not rewrite `@/` path aliases on its own. This is fixed by a `"ts-node": { "require": ["tsconfig-paths/register"] }` block in `apps/api/tsconfig.json`. If a migration command suddenly throws `Cannot find module '@/...'`, check that block is still there before debugging anything else.

5. **Expression indexes / constraints TypeORM can't express.** Some Postgres constraints (e.g. `exchange_rates`' unique index on `(base_currency, target_currency, fetched_at::date)` — a Postgres *expression* index) can't be written as entity decorators. Pattern: generate the migration from entities first, then hand-add the raw `CREATE UNIQUE INDEX ...` (and matching `DROP INDEX` in `down()`) directly in the generated migration file.

6. **Local Postgres is a native Windows service, not Docker.** Runs as `postgresql-x64-18` — no `docker-compose.yml` in this project. If `migration:run` can't connect, check the service is running (`Get-Service postgresql*`) before assuming a config problem.

## Before calling a migration-touching feature done

Actually run `migration:generate` against the live local `subtrack` database and read the generated file — especially for custom constraints, enums, or defaults — before `migration:run`. Don't assume a migration is trivial just because the entity looks simple. The `postgres` MCP server (read-only) is available for inspecting current schema/data state without shelling out to `psql`.
