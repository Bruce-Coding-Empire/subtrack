# UI Rules

Concise rules for building the SubTrack UI across web and mobile. These cover the most important patterns and constraints to keep both apps visually consistent without over-specifying every detail. Where a rule is web-only or mobile-only, it's labeled.

---

## Font

**Web** — import Inter via `next/font/google` in the root layout:

```typescript
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
```

Apply the font variable class to the `<html>` tag.

**Mobile** — load Inter via `expo-font` in the root layout before rendering any screen. Never render UI before fonts are loaded — use `expo-splash-screen` to hold the splash until `useFonts()` resolves.

---

## Layout

**Web**
- Page max-width: 1280px, centered
- Main content area padding: 32px on all sides
- Gap between page sections: 24px
- Header height: 64px, full width, white background, padding 0 24px
- Top navbar only — no sidebar

**Mobile**
- Safe area padding respected on every screen (`SafeAreaView` or equivalent)
- Screen content padding: 16px horizontal
- Gap between sections: 20px
- Bottom tab bar height: standard platform default, white background
- No top navbar — screen title lives in each screen's header area

---

## Navigation

**Web navbar** — three items: `Dashboard`, `Subscriptions`, `Settings`, plus the user's display name (right side, next to a small avatar circle showing their initial) — pulled from `GET /users/me`, never hardcoded or omitted.
- Active item: `text-accent`, font-weight 500, 14px
- Inactive item: `text-text-secondary`, font-weight 500, 14px
- No underline — active state is color change only
- User name text: 14px, font-weight 500, `text-text-primary`. Avatar: 32px circle, `bg-accent-light` background, `text-accent` initial letter, centered.

**Mobile tab bar** — four items: `Dashboard`, `Subscriptions`, `Add` (center, visually prominent — larger icon in an accent-colored circle), `Settings`.
- Active tab icon + label: `accent`
- Inactive tab icon + label: `text-muted`
- User's display name shown in the Dashboard screen header ("Hi, {name}") and at the top of the Settings screen next to the same avatar pattern as web — not in the tab bar itself, since space is tight

---

## Cards

Every content section lives in a card, both platforms.

```
background: #FFFFFF
border: 1px solid #E5EBE8
border-radius: 16px
padding: 24px (web) / 16px (mobile)
box-shadow: 0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.06)  (web only — mobile uses a subtle elevation, not CSS shadow)
```

Never use colored card backgrounds — always white/surface. Color goes inside cards via badges, chart segments, and text.

---

## Typography Hierarchy

Same three levels on both platforms, per `ui-tokens.md`:

**Section headings** — 16px / 600 / `text-text-primary`
**Body / primary content text** — 14px / 500 / `text-text-primary`
**Secondary / muted text** — 12px / 400 / `text-text-muted`

Stat numbers on dashboard: 30px / 600 / `text-text-primary` (web), scaled down slightly to 26px on mobile to fit smaller stat cards.

---

## Badges

Pill shape (`rounded-full`) for status and category badges: `px-2 py-0.5`, `text-xs`, `font-medium`.

**Category badge** — background is the category's token at 12% opacity equivalent (use the `-light` variant where defined, or the accent-muted pattern for categories without a dedicated light token), text is the full category color.

**Status badge (active/cancelled)**
- Active: `bg-success-light` / `text-success-foreground`
- Cancelled: `bg-surface-secondary` / `text-text-secondary`

---

## Buttons

**Primary:** `bg-accent`, white text, `rounded-md`, `px-4 py-2`, `font-medium`
**Secondary:** white background, `border-border`, `text-text-primary`, `rounded-md`, `px-4 py-2`
**Destructive** (cancel subscription): `bg-error`, white text — always requires a confirmation step before firing (dialog on web, native alert on mobile) — never destructive on a single tap/click

---

## Form Inputs

```
background: #FFFFFF
border: 1px solid #E5EBE8
border-radius: 8px
padding: 8px 12px
font-size: 14px
color: #10241E
placeholder color: #94A39C
focus: ring-1 ring-accent border-accent
```

**Currency input** — always paired with a currency selector (dropdown web, picker mobile), never a free-text currency field.
**Billing cycle input** — segmented control or select with four options: Weekly, Monthly, Yearly, Custom. Selecting Custom reveals a "every N days" numeric input.

---

## Table / List (Subscriptions)

**Web (table)**
- No alternating row colors — white rows, separated by `border-border`
- Column headers: uppercase, 12px, font-weight 500, `text-text-secondary`
- Row text: 14px, `text-text-primary`
- Hover state: `bg-surface-secondary`
- Columns: NAME, CATEGORY (badge), COST, CYCLE, NEXT RENEWAL, STATUS

**Mobile (card list)**
- Each subscription is a compact card, not a table row
- Row 1: name (bold) + category badge
- Row 2: cost + cycle (muted) + next renewal countdown pill
- Tap opens detail screen

---

## Dashboard Stat Cards

Four cards on both platforms (mobile: 2x2 grid; web: 4-across row):
- Total Monthly Spend
- Total Yearly Spend
- Active Subscriptions (count)
- Upcoming Renewals (7 days, count)

Stat number large and bold, label small and muted beneath it, per typography hierarchy.

---

## Charts

- **Spend trend** — line chart, accent-colored stroke, gradient fill beneath, per `ui-tokens.md`
- **Category breakdown** — pie or donut chart, one slice per category token, legend below with category name + percentage
- Chart grid lines: dashed, `border-light` color
- Chart axis labels: 12px, `text-muted`
- Empty state (no data yet): centered muted text, no chart rendered — never render an empty/zeroed chart

---

## Renewal Urgency Indicators

Used on the upcoming renewals list and subscription detail:

| Days until renewal | Token      |
| --------------------- | ------------ |
| ≤ 7 days                 | `warning`      |
| 8–30 days                  | `info`         |
| Overdue (job hasn't run yet) | `error`     |

---

## Spend Limit / Notification UI (v2 — scaffolded now)

Both features get a visible, disabled section in v1 rather than being hidden entirely — this makes the pattern visible to any AI agent picking up v2 later.

- Settings page: "Monthly Spend Limit" and "Notifications" sections rendered with disabled inputs and a small `Coming in v2` badge (`bg-info-light` / `text-info-foreground`)
- Dashboard: no spend-limit progress bar in v1 — omit rather than show a fake/disabled one, since it would need real data to not be misleading

---

## Empty States

Every section that can be empty must have one. Keep it minimal:
- Short descriptive text in `text-muted`
- Optional icon above text
- CTA button if there's a logical next action (e.g. "Add your first subscription")

---

## Tailwind v4 Note (web)

This project uses Tailwind v4. Tokens defined with `@theme` in `globals.css` — no `tailwind.config.ts` for web. Always use `@theme` for new tokens.

## NativeWind Note (mobile)

Mobile uses `tailwind.config.js` (NativeWind requires the config file, unlike Tailwind v4 web). Token names must match the web `@theme` names exactly even though the underlying config mechanism differs.

---

## Do Nots

- Never use Tailwind's/NativeWind's built-in color classes (`bg-emerald-500`, `text-gray-600`) — project tokens only
- Never define colors outside `globals.css` (web) or the colors block of `tailwind.config.js` (mobile)
- Never add gradients to card backgrounds (the logo is the one approved gradient use)
- Never use more than one font weight in a single UI element
- Never show a raw error message to the user — always human readable text
- Never stack more than 2 levels of border radius inside each other
- Web: never use `position: fixed` — use normal flow layout
- Mobile: never hardcode pixel values for safe area insets — always use the safe area API