# Code Standards

Implementation rules for the entire monorepo. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions and between apps.

---

## Engineering Mindset

- **Think before implementing** — understand what's being built and why before writing a line
- **Read context files first** — never assume, verify against `architecture.md` and `api-contract.md`
- **Scope is sacred** — build only what the current feature requires, even if something else seems helpful
- **Every feature must be testable immediately** after implementation — if it can't be verified, it's incomplete
- **Clean over clever** — code a junior developer can read is always preferred over abstraction for its own sake
- **One thing at a time** — finish one feature fully (all three apps, where relevant) before touching the next
- **Failures are expected** — every external call (DB, FX API, scheduled job) wrapped in try/catch, logged, never crashes the process

---

## TypeScript (all three apps)

- Strict mode enabled — no exceptions
- Never use `any` — use `unknown` and narrow
- Never use type assertions (`as SomeType`) unless unavoidable, and comment why
- All function parameters and return types explicitly typed
- `type` for object shapes and unions, `interface` only for extendable component props
- All async functions have proper error handling — never let a promise float unhandled
- `const` by default, `let` only when reassignment is necessary

---

## apps/web — Next.js Conventions

- App Router only — no Pages Router
- **Next.js is a frontend framework here — no business logic in route handlers or Server Actions.** Every mutation and read goes through `lib/api-client.ts` to the Nest API.
- No direct DB access anywhere in `apps/web` — there is no DB credential in this app at all
- Server Components by default; add `"use client"` only for `useState`/`useReducer`, `useEffect`, browser APIs, event listeners, or client-only libraries
- Never add `"use client"` to layout files unless required
- Data fetching in Server Components calls `lib/api-client.ts`, which calls the Nest API — never fetch a third-party API (FX rates, etc.) directly from the web app

---

## apps/api — Nest.js Conventions

- One module per domain in `modules/` — controller, service, entities, DTOs live together
- Controllers are thin — request/response and validation only, no business logic
- Services own all business logic and are the only layer that touches TypeORM repositories
- Every DTO validated with `class-validator` decorators, applied via a global `ValidationPipe`
- Every endpoint scoped to the authenticated user — extract `userId` via `@CurrentUser()` decorator (`common/decorators/current-user.decorator.ts`), never trust a `userId` from the request body
- Scheduled jobs live in `modules/scheduler/`, never inline `@Cron()` decorators in feature services
- Never call a third-party API (FX rates) from a request-handling path — only from scheduled jobs, reading/writing the cache table
- Every controller and DTO decorated with Swagger per `library-docs.md` — an endpoint is not complete without it

---

## apps/mobile — Expo Conventions

- Expo Router for navigation
- Same `lib/api-client.ts` pattern as web, adapted for React Native (no cookies — refresh token in SecureStore, sent in request body to `/auth/refresh`)
- No business logic in screens — screens call `lib/api-client.ts` and render
- Shared visual language with web via `ui-tokens.md`, applied through NativeWind

---

## File and Folder Naming (all apps)

- Folders: kebab-case — `subscription-form`, `spend-trend`
- Component files: PascalCase — `StatsBar.tsx`, `SubscriptionForm.tsx`
- Utility files: camelCase — `apiClient.ts` → written as `api-client.ts` per project convention (kebab-case for utility files specifically, to match `architecture.md`)
- Nest module files: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.entity.ts` — never combine layers in one file
- One component per file — never export multiple components from one file
- Index files only in `components/ui/` — never barrel export elsewhere

---

## Component Structure (web + mobile)

```typescript
"use client"; // only if needed, web only

// 1. External imports
import { useState } from "react";

// 2. Internal imports
import { StatsCard } from "@/components/dashboard/StatsCard";

// 3. Type definitions
type Props = {
  subscriptionId: string;
};

// 4. Component
export function ComponentName({ subscriptionId }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports for components — always named exports
- Props type defined directly above the component, not in a separate file unless shared
- No inline styles — Tailwind/NativeWind classes using tokens from `ui-tokens.md` only

---

## Nest.js Controller Pattern

```typescript
// modules/subscriptions/subscriptions.controller.ts

@Controller("subscriptions")
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    const subscription = await this.subscriptionsService.create(userId, dto);
    return { success: true, data: subscription };
  }
}
```

- Every controller method returns `{ success: boolean, data?: T, error?: string }`
- Errors thrown as Nest `HttpException` subtypes, caught globally by `common/filters/http-exception.filter.ts`
- Never return a raw entity — map to a response DTO if the entity has fields that shouldn't be exposed (e.g. never return `password_hash`)

---

## Nest.js Service Pattern

```typescript
// modules/subscriptions/subscriptions.service.ts

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async create(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    try {
      const nextRenewalDate = calculateNextRenewalDate(
        dto.startDate,
        dto.billingCycle,
        dto.customIntervalDays,
      );
      const subscription = this.subscriptionRepo.create({
        ...dto,
        userId,
        nextRenewalDate,
        status: "active",
      });
      return await this.subscriptionRepo.save(subscription);
    } catch (error) {
      throw new InternalServerErrorException("Failed to create subscription");
    }
  }
}
```

- Every service method wrapped in try/catch, rethrows as an appropriate `HttpException`
- Every query scoped to `userId` — never a repository call without a user filter, except in scheduled jobs which iterate across all users deliberately

---

## Scheduled Job Pattern

```typescript
// modules/scheduler/renewal.job.ts

@Injectable()
export class RenewalJob {
  private readonly logger = new Logger(RenewalJob.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(PaymentHistory)
    private readonly paymentHistoryRepo: Repository<PaymentHistory>,
  ) {}

  @Cron("5 0 * * *") // 00:05 daily
  async handleRenewals(): Promise<void> {
    const due = await this.subscriptionRepo.find({
      where: { status: "active", nextRenewalDate: LessThanOrEqual(today()) },
    });

    for (const subscription of due) {
      try {
        await this.paymentHistoryRepo.save({
          subscriptionId: subscription.id,
          userId: subscription.userId,
          amount: subscription.cost,
          currency: subscription.currency,
          paidAt: today(),
        });
        subscription.nextRenewalDate = calculateNextRenewalDate(
          subscription.nextRenewalDate,
          subscription.billingCycle,
          subscription.customIntervalDays,
        );
        await this.subscriptionRepo.save(subscription);
      } catch (error) {
        this.logger.error(`Failed to renew subscription ${subscription.id}`, error);
        // never let one failure stop the loop
      }
    }
  }
}
```

- Every job iterates with a per-item try/catch — one failure never stops the batch
- Every job logs start, completion, and per-item failures via Nest `Logger`
- Never call an external paid API inside a loop without rate-limit awareness — batch or throttle if needed

---

## API Client Pattern (web + mobile)

```typescript
// lib/api-client.ts

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeader()),
        ...options.headers,
      },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: "Network error — please try again" };
  }
}
```

- One shared fetch wrapper per app — never call `fetch()` directly from a component
- Always returns the `{ success, data?, error? }` shape from `api-contract.md`
- Handles 401 by attempting a silent refresh once, then redirecting to login if refresh also fails

---

## Error Handling

- Never empty catch blocks — always log or handle
- Console/logger errors always include context prefix: `[SubscriptionsService.create]`
- User-facing errors are human readable — never expose raw error messages or stack traces
- API route errors return generic messages on 500 — never expose internals

---

## Environment Variables

| Variable                | Used In            | Notes                          |
| ------------------------ | -------------------- | --------------------------------- |
| `DATABASE_URL`            | apps/api             | Postgres connection string        |
| `JWT_ACCESS_SECRET`       | apps/api             |                                    |
| `JWT_REFRESH_SECRET`      | apps/api             |                                    |
| `REFRESH_TOKEN_MAX_AGE_MS` | apps/api             | Refresh cookie lifetime in ms — must match the refresh JWT's `expiresIn` ("7d") in `auth.service.ts` |
| `EXCHANGE_RATE_API_URL`   | apps/api             | exchangerate.host base URL        |
| `GOOGLE_CLIENT_ID`         | apps/api             | Google Cloud OAuth client — Gmail read-only scope, feature 27 |
| `GOOGLE_CLIENT_SECRET`     | apps/api             | Google Cloud OAuth client secret — never logged, never sent to a client |
| `GOOGLE_REDIRECT_URI`      | apps/api             | Must exactly match a redirect URI registered on the Google Cloud OAuth client |
| `TOKEN_ENCRYPTION_KEY`     | apps/api             | 32-byte hex key, AES-256-GCM — encrypts `email_connections` tokens at rest, see `common/utils/encryption.util.ts` |
| `NEXT_PUBLIC_API_URL`     | apps/web             | Exposed to browser — API base URL |
| `NEXT_PUBLIC_SITE_URL`    | apps/web             | Exposed to browser — canonical site URL, resolves `metadataBase` for OG/Twitter images |
| `EXPO_PUBLIC_API_URL`     | apps/mobile           | Exposed to app bundle — API base URL |

Never hardcode a URL, secret, or key anywhere in the codebase. `NEXT_PUBLIC_` / `EXPO_PUBLIC_` prefixes mean the value ships to the client — never put a secret behind those prefixes.

---

## Import Aliases

Always use `@/` — never a relative import going up more than one level.

```typescript
// Correct
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

// Never
import { Button } from "../../../components/ui/button";
```

---

## Comments

- No comments explaining what code does — code must be self-explanatory
- Comments only for why — a non-obvious decision
- Scheduled jobs may have a brief comment explaining timing/batching strategy
- Never leave TODO comments in committed code — track remaining work in `progress-tracker.md` instead

---

## Dependencies

Never install a package without a clear reason. Check first:

1. Does shadcn/ui already have this component (web)?
2. Does Nest.js already provide this (guards, pipes, interceptors)?
3. Is there a simpler native solution?

Approved dependencies:

**apps/api:** `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`, `@nestjs/schedule`, `@nestjs/config`, `@nestjs/swagger`, `swagger-ui-express`, `expo-server-sdk` (feature 26 — sends renewal-reminder and spend-limit-alert push notifications to stored Expo push tokens from `NotificationDispatchJob`), `google-auth-library` (feature 27 — `OAuth2Client` for the Gmail read-only OAuth2 consent/token-exchange flow; the heavier `googleapis` package is deferred to feature 28, only if Gmail message-fetching needs more than a plain authenticated `fetch()` against the Gmail REST API), `pdfkit` + `@types/pdfkit` (devDependency, ships without its own types) (feature 31 — renders the PDF export format for subscriptions/payment-history; CSV export uses manual serialization, no dependency)

**apps/web:** `tailwindcss`, `shadcn/ui` components, `recharts`, `lucide-react`, `zod` (form validation), `react-hook-form` + `@hookform/resolvers` (unavoidable peer dependencies of shadcn/ui's `Form` component — same treatment as `passport` under `@nestjs/passport` in `apps/api`)

**apps/mobile:** `expo-router`, `nativewind`, `react-native-chart-kit`, `react-native-svg` (unavoidable peer dependency of `react-native-chart-kit`'s SVG rendering — same treatment as `passport` under `@nestjs/passport` — installed alongside it via `npx expo install` in feature 16), `expo-secure-store`, `zod`, `@expo-google-fonts/inter` (Inter ships as static per-weight font files, not a variable font — this is `expo-font` + "Inter package" per `ui-tokens.md`'s Typography section, added feature 14 when mobile first needed to load a font), `@expo/vector-icons` (ships bundled with the Expo SDK, installed explicitly via `npx expo install` in feature 15 — `ui-rules.md`'s mobile tab bar spec requires a real icon for the prominent center "Add" button, which text alone can't satisfy; using the `Feather` set for close visual parity with web's `lucide-react`, which is itself a Feather fork), `@react-native-community/datetimepicker` (the standard native date picker for Expo/React Native — added post-feature-15 at the user's explicit request, replacing an initial manual-text-entry `YYYY-MM-DD` field the user found unguessable/hard to use; auto-registers its own config plugin in `app.json` via `npx expo install`, no manual native config needed), `expo-notifications` (feature 24 — Expo push token registration; requires the `expo-notifications` config plugin in `app.json`'s `plugins`, added alongside)

**apps/web (devDependency only, never shipped):** `playwright` — headless-browser verification of UI features during the build, since no `chromium-cli`-equivalent tool is available in this environment. Not a runtime dependency.

**apps/mobile (devDependency only, never shipped):** `eslint-config-expo` — auto-installed by `npx expo lint` the first time it ran (feature 14, first mobile feature with a lint pass); not previously configured.

Do not install anything outside this list without updating it first.