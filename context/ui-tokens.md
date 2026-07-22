# UI Tokens

Design tokens for SubTrack. Shared conceptually between web (Tailwind v4 `@theme`) and mobile (NativeWind config) — same values, same names, two implementations. Never hardcode colors in components in either app.

---

## How to Use

**Web** — Tailwind v4, tokens defined via `@theme` in `app/globals.css`. No `tailwind.config.ts` for colors.

**Mobile** — NativeWind, tokens defined in `tailwind.config.js` under `theme.extend.colors`, mirroring the same hex values under the same names.

```tsx
// Correct (web) — generated utility classes
className="bg-surface text-text-primary border-border"

// Correct (mobile) — same class names via NativeWind
className="bg-surface text-text-primary"

// Never — hardcoded hex
className="bg-[#F6F7FB]"

// Never — raw Tailwind color classes
className="bg-emerald-500 text-gray-600"
```

---

## globals.css — Web Token Definition

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", sans-serif;

  /* Page and surface backgrounds */
  --color-background: #f6f8f7;
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-muted: #f2f7f5;

  /* Borders */
  --color-border: #e5ebe8;
  --color-border-light: #edf1ef;

  /* Text */
  --color-text-primary: #10241e;
  --color-text-secondary: #5c6b65;
  --color-text-muted: #94a39c;
  --color-text-dark: #2c3b35;

  /* Primary accent — teal/emerald */
  --color-accent: #0f9d78;
  --color-accent-dark: #0b7a5c;
  --color-accent-light: #e3f6ee;
  --color-accent-muted: #f2fbf7;
  --color-accent-foreground: #ffffff;

  /* Success — used for under-budget, positive states */
  --color-success: #16a34a;
  --color-success-light: #dcfce7;
  --color-success-lightest: #f0fdf4;
  --color-success-foreground: #15803d;

  /* Warning — approaching renewal, approaching limit */
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-warning-foreground: #b45309;

  /* Error — over budget, failed job, destructive actions */
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-error-foreground: #b91c1c;

  /* Info — neutral highlights, upcoming (non-urgent) */
  --color-info: #3b82f6;
  --color-info-light: #dbeafe;
  --color-info-foreground: #1d4ed8;

  /* Category colors — used only in charts, never on card surfaces */
  --color-category-entertainment: #0f9d78;
  --color-category-software: #3b82f6;
  --color-category-fitness: #f59e0b;
  --color-category-utilities: #8b5cf6;
  --color-category-other: #94a39c;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

---

## Mobile Token Mirror (`tailwind.config.js`)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "#f6f8f7",
        surface: "#ffffff",
        "surface-secondary": "#f9fafb",
        border: "#e5ebe8",
        "text-primary": "#10241e",
        "text-secondary": "#5c6b65",
        "text-muted": "#94a39c",
        accent: "#0f9d78",
        "accent-dark": "#0b7a5c",
        "accent-light": "#e3f6ee",
        "accent-foreground": "#ffffff",
        success: "#16a34a",
        "success-light": "#dcfce7",
        warning: "#f59e0b",
        "warning-light": "#fef3c7",
        error: "#ef4444",
        "error-light": "#fee2e2",
        info: "#3b82f6",
        "info-light": "#dbeafe",
        "category-entertainment": "#0f9d78",
        "category-software": "#3b82f6",
        "category-fitness": "#f59e0b",
        "category-utilities": "#8b5cf6",
        "category-other": "#94a39c",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
    },
  },
};
```

Any token added to one file must be added to the other in the same session — they must never drift.

`accent-foreground` (#ffffff, Primary button text) was missing from this Mobile Token Mirror even though `globals.css` already had it — added during feature 14 (Mobile Auth), the first mobile feature to need Primary buttons. Backfill any other `-foreground`/`-light` token gaps only when a feature actually needs them, not preemptively.

**Mobile font weights:** `@expo-google-fonts/inter` (loaded via `expo-font`'s `useFonts()`) ships each weight as a separate static font file, not a variable font — so unlike web's single `--font-sans` + `font-medium`/`font-semibold` utility split, `apps/mobile/tailwind.config.js` defines one `fontFamily` key per weight actually used: `font-sans` (400), `font-sans-medium` (500), `font-sans-semibold` (600), `font-sans-bold` (700). Use these instead of Tailwind's `font-weight` utilities (`font-medium`, etc.) on mobile — those set CSS `font-weight`, which React Native mostly ignores for custom static-weight fonts.

---

## Color Usage Guide

### Page Layout

| Element           | Token                  |
| ------------------ | ------------------------- |
| Page background     | `bg-background`          |
| Card / surface       | `bg-surface`              |
| Secondary surface    | `bg-surface-secondary`   |
| Default border        | `border-border`          |

### Typography

| Element                | Token                        |
| ------------------------ | -------------------------------- |
| Headings, primary text    | `text-text-primary`            |
| Secondary text, labels     | `text-text-secondary`          |
| Placeholder, muted          | `text-text-muted`              |

### Accent (Primary Teal)

Used for: primary buttons, active nav items, the accent line in charts, focus rings, the app logomark.

| Element                 | Token                       |
| -------------------------- | -------------------------------- |
| Button background            | `bg-accent`                     |
| Button text                    | `text-accent-foreground`        |
| Light badge background        | `bg-accent-light`               |

### Status Colors (spend limit & renewal states — v2 UI is scaffolded with these now)

| State                      | Token                                    |
| ---------------------------- | -------------------------------------------- |
| Under budget / active, healthy | `text-success` / `bg-success-light`        |
| Renewal within 7 days           | `text-warning` / `bg-warning-light`        |
| Over budget / overdue             | `text-error` / `bg-error-light`            |
| Renewal within 30 days (non-urgent) | `text-info` / `bg-info-light`         |

### Category Badges

Each category gets a fixed color, used consistently in the subscriptions table, category breakdown chart, and detail page.

| Category       | Token                             |
| ---------------- | ------------------------------------- |
| Entertainment      | `category-entertainment` (#0F9D78)  |
| Software             | `category-software` (#3B82F6)       |
| Fitness               | `category-fitness` (#F59E0B)        |
| Utilities              | `category-utilities` (#8B5CF6)      |
| Other                    | `category-other` (#94A39C)          |

---

## Typography

| Element              | Size | Weight | Line height | Color token          |
| ---------------------- | ------ | -------- | -------------- | ------------------------ |
| Logo text                 | 19px   | 700      | 28px             | `text-text-primary`    |
| Stat number                 | 30px   | 600      | 36px             | `text-text-primary`    |
| Section heading                | 16px   | 600      | 24px             | `text-text-primary`    |
| Nav item (active)                  | 14px   | 500      | 20px             | `text-accent`         |
| Nav item (inactive)                   | 14px   | 500      | 20px             | `text-text-secondary` |
| Body / primary content text              | 14px   | 500      | 20px             | `text-text-primary`   |
| Secondary / muted text                       | 12px   | 400      | 16px             | `text-text-muted`     |
| Chart axis labels                                | 12px   | 400      | 15px             | `text-text-muted`     |

Font family: **Inter** — `next/font/google` on web, `expo-font` + Inter package on mobile. Never fall back to system font.

---

## Spacing

| Token       | Value      | Usage                    |
| ------------- | ------------ | ---------------------------- |
| `gap-1`         | 4px            | Tight inline gaps            |
| `gap-2`           | 8px            | Badge and tag gaps           |
| `gap-3`             | 12px           | Form field gaps              |
| `gap-4`               | 16px           | Section internal gaps        |
| `gap-6`                 | 24px           | Between sections             |
| `gap-8`                   | 32px           | Page section gaps            |
| `p-4`                       | 16px           | Card padding                 |
| `p-6`                         | 24px           | Large card padding           |
| `px-4 py-2`                     | 16px / 8px     | Button padding                |

---

## Component Tokens

### Cards

```
background: bg-surface
border: 1px solid var(--border)
border-radius: 16px (rounded-2xl)
padding: 24px (p-6)
box-shadow: 0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.06)
```

### Buttons

**Primary:**
```
background: bg-accent
text: text-accent-foreground
border-radius: rounded-md
padding: px-4 py-2
font-weight: font-medium
```

**Secondary:**
```
background: bg-surface
border: border border-border
text: text-text-primary
border-radius: rounded-md
padding: px-4 py-2
```

**Destructive** (cancel/delete subscription):
```
background: bg-error
text: white
border-radius: rounded-md
padding: px-4 py-2
```

### Input Fields

```
background: bg-surface
border: border border-border
border-radius: rounded-md
padding: px-3 py-2
text: text-text-primary
placeholder: text-text-muted
focus: ring-1 ring-accent
```

### Badges

```
border-radius: rounded-full
padding: px-2 py-0.5
font-size: text-xs
font-weight: font-medium
```

### Renewal Countdown Pill (upcoming renewals list)

```
background: varies by urgency (see Status Colors)
border-radius: rounded-full
padding: px-2 py-0.5
font-size: 12px
font-weight: 500
```

### Chart Colors

| Chart                        | Color                                                      |
| ------------------------------- | -------------------------------------------------------------- |
| Spend trend (line)                 | `#0F9D78` stroke, 3px width, gradient fill rgba(15,157,120,0.15) |
| Category breakdown (pie)             | Category tokens listed above, one slice per category           |
| Chart grid lines                       | `1px dashed #E5EBE8`                                           |
| Chart axis labels                        | `#94A39C`, 12px                                                |

### Logo

```
background: linear-gradient(135deg, #0F9D78 0%, #0B7A5C 100%)
border-radius: 10px
size: 36x36px
```

---

## Invariants

- Never use hex values directly in components on either platform — always use tokens
- Font is Inter everywhere — never a fallback system font
- Never use raw Tailwind color classes like `bg-emerald-500` or `text-gray-600` — project tokens only
- `--accent` (#0F9D78) is the only teal/green accent — never Tailwind's built-in emerald/teal scale
- Category colors are fixed and consistent across every chart and badge that shows category — never reassigned per-view
- All borders default to `--border` — never `border-gray-*`
- Any token change must be made identically in both `globals.css` (web) and `tailwind.config.js` (mobile) in the same session