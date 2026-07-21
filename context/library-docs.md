# Library Docs

Project-specific usage patterns for every third party library across the three apps. This file only covers how we use each library in SubTrack specifically — rules, patterns, constraints that override general training knowledge.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project.
2. **Check if an MCP server is configured** for that library — use it before falling back to general knowledge.
3. **Read this file** for project-specific patterns that override general library knowledge.

Order of authority:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently.

---

## TypeORM (apps/api)

**Check first:** AGENTS.md for an installed TypeORM skill or MCP.

### Entity Pattern

```typescript
// modules/subscriptions/entities/subscription.entity.ts
@Entity("subscriptions")
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column("numeric")
  cost: number;

  @Column()
  currency: string;

  @Column({ type: "enum", enum: ["weekly", "monthly", "yearly", "custom"] })
  billingCycle: string;

  @Column({ type: "int", nullable: true })
  customIntervalDays: number | null;

  @Column({ type: "enum", enum: ["entertainment", "software", "fitness", "utilities", "other"] })
  category: string;

  @Column({ type: "enum", enum: ["active", "cancelled"], default: "active" })
  status: string;

  @Column("date")
  startDate: string;

  @Column("date")
  nextRenewalDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;
}
```

### Migrations — Never `synchronize: true`

```typescript
// ormconfig / TypeOrmModule.forRootAsync
{
  synchronize: false, // always false, even in dev — migrations only
  migrations: ["dist/migrations/*.js"],
}
```

Generate migrations explicitly: `npm run typeorm migration:generate -- -n AddSubscriptions`. Never let TypeORM auto-sync schema — this project uses versioned migrations only, from day one.

**Rules:**

- Every entity's `userId` column is indexed — most queries filter by it
- Never use `@OneToMany`/`@ManyToOne` eager loading by default — load relations explicitly per query to avoid over-fetching
- Repository injection via `@InjectRepository(Entity)` only inside services — never in controllers

---

## Nest Passport + JWT (apps/api)

**Check first:** AGENTS.md for an installed Nest auth skill.

### Strategy Pattern

```typescript
// modules/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### Token Issuance

```typescript
// modules/auth/auth.service.ts
const accessToken = this.jwtService.sign(
  { sub: user.id, email: user.email },
  { secret: process.env.JWT_ACCESS_SECRET, expiresIn: "15m" },
);
const refreshToken = this.jwtService.sign(
  { sub: user.id },
  { secret: process.env.JWT_REFRESH_SECRET, expiresIn: "7d" },
);
```

**Rules:**

- Access token: 15 minutes. Refresh token: 7 days. Never extend these without updating this file.
- Refresh token set as `httpOnly, secure, sameSite: 'lax'` cookie on web responses — never returned in the JSON body on web
- Mobile has no cookies — refresh token returned in the JSON body once, then stored in `expo-secure-store` by the client, sent back as a body field on `/auth/refresh`
- Passwords hashed with `bcrypt`, 10 salt rounds, never a lower round count
- `JwtAuthGuard` applied via `@UseGuards(JwtAuthGuard)` on every controller except `AuthController`

---

## @nestjs/schedule (apps/api)

**Check first:** AGENTS.md for an installed scheduling skill.

### Cron Registration

```typescript
// modules/scheduler/scheduler.module.ts
@Module({
  imports: [ScheduleModule.forRoot(), SubscriptionsModule, CurrencyModule],
  providers: [RenewalJob, ExchangeRateJob],
})
export class SchedulerModule {}
```

```typescript
// modules/scheduler/renewal.job.ts
@Cron("5 0 * * *") // daily at 00:05 server time
async handleRenewals() { /* see code-standards.md for full pattern */ }
```

```typescript
// modules/scheduler/exchange-rate.job.ts
@Cron("0 */6 * * *") // every 6 hours
async refreshRates() { /* fetch + upsert into exchange_rates */ }
```

**Rules:**

- Cron expressions always as string literals with a comment explaining the schedule in plain English
- Every job method is `async`, wraps its per-item work in try/catch (see `code-standards.md` for the loop pattern)
- Never run a job on app bootstrap manually to "test" it in production — trigger via a dev-only endpoint or manual script instead
- Server timezone must be documented and consistent — default UTC unless `.env` sets otherwise

---

## exchangerate.host (apps/api)

**Check first:** AGENTS.md for an installed FX API skill or MCP.

### Fetching Rates

```typescript
// modules/currency/currency.service.ts
async fetchLatestRates(base: string): Promise<Record<string, number>> {
  const response = await fetch(
    `${process.env.EXCHANGE_RATE_API_URL}/latest?base=${base}`,
  );
  if (!response.ok) {
    throw new Error(`Exchange rate API error: ${response.status}`);
  }
  const data = await response.json();
  return data.rates; // { USD: 1, RWF: 1450.2, EUR: 0.92, ... }
}
```

### Caching Pattern

```typescript
// Called only from exchange-rate.job.ts, never from a request path
async refreshAndCache(): Promise<void> {
  const currencies = await this.getDistinctCurrenciesInUse(); // from subscriptions table
  for (const base of currencies) {
    const rates = await this.fetchLatestRates(base);
    for (const [target, rate] of Object.entries(rates)) {
      await this.exchangeRateRepo.upsert(
        { baseCurrency: base, targetCurrency: target, rate, fetchedAt: new Date() },
        ["baseCurrency", "targetCurrency"],
      );
    }
  }
}
```

### Reading Cached Rates (request path)

```typescript
// Always reads from DB — never calls the external API here
async getConvertedAmount(amount: number, from: string, to: string): Promise<number> {
  if (from === to) return amount;
  const rate = await this.exchangeRateRepo.findOne({
    where: { baseCurrency: from, targetCurrency: to },
    order: { fetchedAt: "DESC" },
  });
  if (!rate) throw new Error(`No cached rate for ${from} -> ${to}`);
  return amount * rate.rate;
}
```

**Rules:**

- Only `exchange-rate.job.ts` calls the external API — every other code path reads the cache
- If a rate is missing when a dashboard read needs it, fail that single conversion gracefully (log + fall back to showing the original currency for that line) — never crash the whole dashboard response
- Refresh only currencies actually in use (derived from distinct `subscriptions.currency` values) — never fetch rates for currencies no user has

---

## Recharts (apps/web)

**Check first:** AGENTS.md for an installed Recharts skill.

### Spend Trend Line Chart

```tsx
<ResponsiveContainer width="100%" height={240}>
  <LineChart data={points}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
    <YAxis tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
    <Line type="monotone" dataKey="amount" stroke="var(--color-accent)" strokeWidth={3} dot={false} />
  </LineChart>
</ResponsiveContainer>
```

**Rules:**

- Chart colors always pulled from CSS variables per `ui-tokens.md` — never hardcoded hex in chart props
- Always wrap in `ResponsiveContainer` — never a fixed pixel width
- Empty state handled before rendering the chart component — never render `LineChart` with an empty `points` array

---

## react-native-chart-kit (apps/mobile)

**Check first:** AGENTS.md for an installed chart-kit skill.

### Category Breakdown Pie Chart

```tsx
<PieChart
  data={categoryData.map((c) => ({
    name: c.category,
    amount: c.amount,
    color: categoryColorMap[c.category],
    legendFontColor: "#5C6B65",
    legendFontSize: 12,
  }))}
  width={Dimensions.get("window").width - 32}
  height={200}
  chartConfig={{ color: () => "#10241E" }}
  accessor="amount"
  backgroundColor="transparent"
  paddingLeft="8"
/>
```

**Rules:**

- `categoryColorMap` sourced from the mobile token file — never inline hex per chart
- `width` always derived from `Dimensions.get('window').width` minus horizontal padding — never a fixed number that breaks on different device sizes
- This library renders to Skia/SVG under the hood on some charts — test on both iOS and Android simulators before considering a chart "done"

---

## Swagger / OpenAPI (apps/api)

**Check first:** AGENTS.md for an installed Swagger/Nest OpenAPI skill.

### Bootstrap Setup

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

const config = new DocumentBuilder()
  .setTitle("SubTrack API")
  .setDescription("Subscription tracking API — auth, subscriptions, dashboard, currency")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api/docs", app, document);
```

Docs served at `http://localhost:3001/api/docs` in dev. Never expose Swagger UI in production without auth in front of it — for this portfolio project, disable it in production entirely via an env check:

```typescript
if (process.env.NODE_ENV !== "production") {
  SwaggerModule.setup("api/docs", app, document);
}
```

### Controller Decoration

```typescript
// modules/subscriptions/subscriptions.controller.ts
@ApiTags("subscriptions")
@ApiBearerAuth()
@Controller("subscriptions")
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  @Post()
  @ApiOperation({ summary: "Create a new subscription" })
  @ApiResponse({ status: 201, description: "Subscription created" })
  async create(@CurrentUser() userId: string, @Body() dto: CreateSubscriptionDto) {
    // ...
  }
}
```

### DTO Decoration

```typescript
// modules/subscriptions/dto/create-subscription.dto.ts
export class CreateSubscriptionDto {
  @ApiProperty({ example: "Netflix" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 15.99 })
  @IsNumber()
  cost: number;

  @ApiProperty({ enum: ["weekly", "monthly", "yearly", "custom"] })
  @IsEnum(["weekly", "monthly", "yearly", "custom"])
  billingCycle: string;
}
```

**Rules:**

- Every controller gets `@ApiTags()` matching its module name
- Every endpoint gets `@ApiOperation({ summary })` — one sentence, plain English
- Every DTO field gets `@ApiProperty()` with a realistic `example` — this is what makes the Swagger UI actually usable for testing, not just decorative
- `@ApiBearerAuth()` on every controller that sits behind `JwtAuthGuard`
- Swagger docs are written in the same commit/session as the endpoint itself — never added retroactively as cleanup. An endpoint isn't "done" per `progress-tracker.md` until its Swagger decoration is in place too.
- Swagger UI is a genuinely good manual-testing tool during the build (curl-free), and doubles as a portfolio artifact — a hiring manager can hit `/api/docs` and try your API live

---



**Check first:** AGENTS.md for an installed Expo Router skill — API has changed across Expo SDK versions.

### Route Groups

```
app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── _layout.tsx      → Tab bar definition
│   ├── dashboard.tsx
│   ├── subscriptions.tsx
│   └── settings.tsx
└── subscription/
    ├── [id].tsx
    └── add.tsx
```

**Rules:**

- Auth guard lives in the root `_layout.tsx` — redirect to `(auth)/login` if no valid token in SecureStore
- Tab bar only rendered inside `(tabs)/_layout.tsx` — screens outside this group (subscription detail, add) render without tabs, with a back button instead

---

## expo-secure-store (apps/mobile)

**Check first:** AGENTS.md for an installed SecureStore skill.

```typescript
// lib/auth.ts
import * as SecureStore from "expo-secure-store";

await SecureStore.setItemAsync("refreshToken", token);
const token = await SecureStore.getItemAsync("refreshToken");
await SecureStore.deleteItemAsync("refreshToken"); // on logout
```

**Rules:**

- Access token kept in memory (React state/context) only — never persisted, since it's short-lived and refetched via refresh token on app start
- Refresh token is the only token persisted, always via SecureStore — never `AsyncStorage`, which is not encrypted

---

## NativeWind (apps/mobile)

**Check first:** AGENTS.md for an installed NativeWind skill — version-specific setup (Babel plugin, metro config) matters.

**Rules:**

- `tailwind.config.js` colors must mirror `globals.css` `@theme` tokens exactly, per `ui-tokens.md`
- Not all Tailwind utilities are supported in NativeWind — verify a class works on-device before relying on it broadly (particularly flex/gap edge cases)