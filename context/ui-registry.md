# UI Registry

Living document. Updated after every component is built, on both web and mobile. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here (on the same platform — web and mobile registries are tracked separately below since implementations differ, even when the visual result matches)
2. If yes — match its exact classes/structure
3. If no — build it following `ui-rules.md` and `ui-tokens.md`, then add it here

After building any component — update this file with the component name, file path, and exact classes/props used.

---

## Web Components

### `Input` — `apps/web/components/ui/input.tsx`

Hand-written (not shadcn CLI-generated) to hit `ui-rules.md`'s Form Input spec exactly. Base classes: `w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error`. Props: standard `<input>` props, `className` merged via `cn()`.

### `PasswordInput` — `apps/web/components/ui/password-input.tsx`

Wraps `Input` with a show/hide toggle. `type` alternates between `password`/`text` via local `isVisible` state; forwards all other props (including react-hook-form's `field` spread) straight to `Input`. Toggle is a `type="button"` (never submits the form) positioned `absolute inset-y-0 right-0`, icon-only (`Eye`/`EyeOff` from `lucide-react`, `size-4`), `tabIndex={-1}` (not part of tab order — the input itself is), `aria-label` swaps between "Show password"/"Hide password". `Input`'s className gets `pl-3 pr-9` to keep left padding at spec (12px, same as base `px-3`) while making room for the icon on the right. Used by both `LoginForm` and `RegisterForm` for their password field.

### `Label` — `apps/web/components/ui/label.tsx`

shadcn CLI-generated (`npx shadcn add label`), unmodified. Plain `<label>` wrapper, no external primitive dependency — matches this project's Base UI (not Radix) posture. Used directly by `FormLabel` below; not typically used standalone since `FormField`/`FormLabel` covers every current form field.

### `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` — `apps/web/components/ui/form.tsx`

Hand-written, not CLI-generated — this project's shadcn registry/style (`"base-vega"`) resolves `@shadcn/form` to zero files (verified via `npx shadcn add @shadcn/form --view` → "No files"), so the canonical Form primitives don't exist for this style. Rebuilt to match shadcn/ui's standard Form API (`react-hook-form` + `FormProvider`/`Controller`/`useFormContext`/`useFormState`), with one deliberate deviation: `FormControl` uses a local `React.cloneElement`-based forwarder instead of Radix's `Slot` (this project has no Radix dependency — Button/Card/Input are all Base UI or hand-written), since it only ever wraps a single input-like child. `FormLabel` renders the CLI-generated `Label` above with `data-error` wired to `text-error` per `ui-rules.md`. `FormMessage` renders at `text-xs text-error`, matching the inline field-error styling every other form in this project uses. New deps: `react-hook-form`, `@hookform/resolvers` (see `code-standards.md`'s Dependencies section for why these are approved).

Also note: `buttonVariants`' base classes gained `cursor-pointer` and `disabled:cursor-not-allowed` (was missing on all variants — shadcn's generated `Button` didn't set either, so hover showed the default arrow cursor instead of a pointer). Applies to every `Button` usage app-wide, not just auth forms.

### `LoginForm` — `apps/web/components/auth/LoginForm.tsx`

Client component. `useForm` (react-hook-form) + `zodResolver`, schema mirrors `LoginDto` (`z.email()` for email, non-empty for password). Each field is a `FormField` → `FormItem` → `FormLabel` + `FormControl(Input)` + `FormMessage`. A separate form-level error (`text-xs text-error`, not part of the Form primitives) surfaces API failures (wrong password, network error) since those aren't per-field zod issues. Submit button: `Button` with `bg-accent text-accent-foreground hover:bg-accent-dark w-full`, disabled via `form.formState.isSubmitting`. Calls `lib/auth.ts`'s `login()`, redirects to `/dashboard` via `useRouter().push()` on success.

### `RegisterForm` — `apps/web/components/auth/RegisterForm.tsx`

Same pattern as `LoginForm`, plus a `name` field (zod: non-empty, max 100 chars, mirrors `RegisterDto`). Calls `lib/auth.ts`'s `register()`.

### Auth page shell — `apps/web/app/(auth)/layout.tsx`

Centered flex column, `bg-background`, small branded header above the form: 36×36px logo box (`rounded-[10px]`, `bg-[linear-gradient(135deg,var(--color-accent)_0%,var(--color-accent-dark)_100%)]` — the one approved gradient per `ui-rules.md`) + "SubTrack" wordmark (`text-[19px] font-bold text-text-primary`, per `ui-tokens.md`'s Logo text row). Children rendered inside a `max-w-sm` wrapper. `/login` and `/register` both render a shadcn `Card` (`CardHeader` + `CardTitle` + `CardDescription` + `CardContent`) inside this shell — no changes needed to `Card` itself, token remap in `globals.css` makes it match `ui-rules.md`'s Cards spec (white surface, `rounded-xl` = 16px, `p-6` = 24px, shadow via the remapped `--shadow-xs`).

### `Table`, `Dialog`, `Select`, `Badge` — `apps/web/components/ui/{table,dialog,select,badge}.tsx`

shadcn CLI-generated (`npx shadcn add table dialog select badge`), unmodified — unlike `Form`/`Input`, this style (`base-vega`) does resolve these. Built on `@base-ui/react` primitives (`Select`, `Dialog`), consistent with `Button`. All read the same semantic vars remapped in `globals.css` (`--border`, `--muted`, `--popover`, etc.), so they match `ui-rules.md` with only per-usage `className` overrides (e.g. `TableHead` needs `text-xs font-medium uppercase text-text-secondary` added per-instance — the CLI default is `text-foreground`, not uppercase/secondary). `TableRow`'s default `hover:bg-muted/50` already equals `hover:bg-surface-secondary` from the remap, so no override needed there. **Gotcha:** `Select`'s `SelectValue` renders the raw `value` string by default (not the matching `SelectItem`'s label) — pass a function child, `<SelectValue>{(value) => LABEL_MAP[value]}</SelectValue>`, everywhere the select's value and its display label differ (e.g. category `"software"` → "Software"; not needed for currency, where the code and label are identical).

Re-running `npx shadcn add` for a batch that includes `Button` will silently drop the `cursor-pointer`/`disabled:cursor-not-allowed` fix from the Post-04 follow-up (the CLI overwrites the whole file) — re-add both classes to `buttonVariants`' base string if this happens again.

### `CategoryBadge`, `StatusBadge` — `apps/web/components/subscriptions/{CategoryBadge,StatusBadge}.tsx`

Both wrap shadcn `Badge` with `variant="outline"` (to null out the default `bg-primary`) plus a per-value `className` override. `CategoryBadge` uses `bg-category-{name}/12 text-category-{name}` (Tailwind v4's opacity-modifier syntax against the `--color-category-*` vars in `globals.css`) per `ui-rules.md`'s "12% opacity, category token" badge rule — no dedicated `-light` category tokens exist, so the `/12` opacity suffix is the fallback the rule itself specifies. `StatusBadge` uses the literal `bg-success-light`/`bg-surface-secondary` tokens `ui-rules.md` names directly.

### `RenewalUrgencyPill` — `apps/web/components/subscriptions/RenewalUrgencyPill.tsx`

Implements `ui-rules.md`'s Renewal Urgency Indicators table (`lib/renewal-urgency.ts`'s `getRenewalUrgency()`: ≤7 days → `warning`, 8–30 → `info`, overdue → `error`, else no pill — just plain date text). Used on the subscription detail page's "Next Renewal" field, per the rule's stated scope ("upcoming renewals list and subscription detail") — not used in the subscriptions table, which only shows a plain formatted date plus the separate Status column.

### `SubscriptionsTable` — `apps/web/components/subscriptions/SubscriptionsTable.tsx`

Client component (`useRouter` for row-click navigation to `/subscriptions/[id]`). Columns exactly per `ui-rules.md`: Name, Category (badge), Cost, Cycle, Next Renewal, Status — no actions column, since none is specified. Empty state is a plain centered muted-text message (no icon/CTA — the page-level "Add Subscription" button already covers that action, so a duplicate CTA inside the empty state would be redundant).

### `SubscriptionsPagination` — `apps/web/components/subscriptions/SubscriptionsPagination.tsx`

shadcn `Pagination`/`PaginationContent`/`PaginationItem`/`PaginationPrevious`/`PaginationNext` (`npx shadcn add pagination`), used in a client-state-driven way rather than the CLI default's URL-link model — `PaginationPrevious`/`Next` render as `<a href="#">` under the hood, so `onClick` calls `event.preventDefault()` before invoking the `onPageChange` callback, and the disabled edge (page 1 / last page) is done via `aria-disabled` + `pointer-events-none opacity-50`, not a real `disabled` attribute (anchors don't have one). No numbered page links or ellipsis — just Previous / "Page X of Y" / Next, since the subscriptions list is never expected to need deep pagination.

### `SubscriptionsPageClient` pagination — `apps/web/components/subscriptions/SubscriptionsPageClient.tsx`

`DEFAULT_PAGE_SIZE = 10` (client-side slice of the filtered array, mirroring `api-contract.md`'s `GET /subscriptions` `limit` default — feature 07 swaps this local slicing for the real `page`/`limit`/`total` query params and response fields, same constant name/value carries over unchanged). Changing the search query or status filter resets to page 1 (via wrapper handlers `handleSearchChange`/`handleStatusChange`, not a `useEffect` — simpler and avoids an extra render). The pagination footer (in a `CardFooter`, `border-t`) only renders when there's more than one page — no inert "Page 1 of 1" bar when everything fits on one page.

### `SubscriptionFilters` — `apps/web/components/subscriptions/SubscriptionFilters.tsx`

Search `Input` (with a `lucide-react` `Search` icon absolutely positioned inside, left-padded) plus an All/Active/Cancelled segmented control — same hand-rolled segmented-control pattern as `SubscriptionForm`'s billing cycle control (plain buttons, active = `bg-accent text-accent-foreground`, inactive = `text-text-secondary hover:bg-surface-secondary`), not a shadcn primitive, since shadcn's registry has no toggle-group component for this style.

### `SubscriptionForm` — `apps/web/components/subscriptions/SubscriptionForm.tsx`

Shared by both the Add dialog and the detail page's inline edit — `defaultValues`/`onSubmit`/`submitLabel`/`onCancel` props, same `react-hook-form` + `zodResolver` + shadcn `Form` pattern as `LoginForm`/`RegisterForm`. Billing cycle is the same hand-rolled segmented control as the status filter (4 options); selecting "Custom" reveals an "Every N Days" field and auto-fills it with `30` if empty (`form.setValue`) so the field is never left blank when first revealed. **Numeric fields (`cost`, `customIntervalDays`) do not use `z.coerce.number()`** — mixing `z.coerce` with `react-hook-form`'s `useForm<T>()` generic breaks the resolver's type inference (input type becomes `unknown` vs. output `number`, a known `zodResolver` + strict-TS gotcha). Fixed by keeping the zod schema as plain `z.number()` and wiring each numeric `Input` manually (`value`/`onChange={(e) => field.onChange(e.target.valueAsNumber)}`) instead of spreading `{...field}`. Watches `billingCycle` via `useWatch({ control: form.control, name: "billingCycle" })`, not `form.watch()` — `form.watch()` triggers a React Compiler "cannot be memoized" lint warning; `useWatch` is the proper hook form and doesn't.

### `AddSubscriptionDialog` — `apps/web/components/subscriptions/AddSubscriptionDialog.tsx`

shadcn `Dialog` wrapping `SubscriptionForm`. On submit (mock phase — no API yet), builds a full `Subscription` client-side with `crypto.randomUUID()` and `nextRenewalDate` set equal to `startDate` (a placeholder, not a real calculation — computing an actual renewal date is business logic, which `architecture.md` reserves for `apps/api`; feature 07 replaces this whole handler with a real `POST /subscriptions` call and stops needing this placeholder).

### `EditSubscriptionDialog` — `apps/web/components/subscriptions/EditSubscriptionDialog.tsx`

Same shape as `AddSubscriptionDialog` (shadcn `Dialog` wrapping `SubscriptionForm`, `Button` sits as a `Dialog` sibling rather than a `DialogTrigger` — open state is driven manually via `useState` + `onClick`, matching the Add dialog's existing pattern). Takes `subscription` + `onSave` props instead of building a subscription from scratch — `defaultValues` is populated from the current subscription so the form opens pre-filled. Triggered by an "Edit" button (`Pencil` icon) in the detail page's header row, replacing what was originally an always-visible inline edit `Card` on the detail page — the modal keeps the page's default (read-only) state uncluttered and matches the Add flow's UX. Styled `bg-accent text-surface hover:bg-accent-dark` — the plain shadcn `variant="outline"` default (`bg-background`) was indistinguishable from the page's own `bg-background`, so it needs an explicit override like every other button in this codebase (see the Primary button pattern on `AddSubscriptionDialog`'s trigger).

### `PaymentHistoryList` — `apps/web/components/subscriptions/PaymentHistoryList.tsx`

Simple two-column shadcn `Table` (Date, Amount); empty state is plain centered muted text ("No payment history yet.") — no CTA, since there's no user action that creates payment history (it's system-generated by the renewal job).

### `SubscriptionsPageClient` / `SubscriptionDetailClient` — `apps/web/components/subscriptions/{SubscriptionsPageClient,SubscriptionDetailClient}.tsx`

Client components rendered by the (Server Component) `app/subscriptions/page.tsx` and `app/subscriptions/[id]/page.tsx` respectively, holding all interactive state (list/filter/search/add on the list page; the current subscription value on the detail page) since `code-standards.md` requires Server Components by default and these need `useState`. Both operate purely on mock data (`lib/mock-data.ts`) for now — edits/creates only update in-memory state, nothing persists across a reload. No `Navbar` exists yet (same gap noted and deliberately deferred in feature 04's decisions — it needs `GET /users/me`, which no page fetches until later), so the detail page has a plain "← Back to Subscriptions" link instead of relying on a persistent nav to get back. `SubscriptionDetailClient` itself only renders read-only info (stat grid + `EditSubscriptionDialog`'s trigger button + `PaymentHistoryList`) — editing happens entirely inside the dialog, not inline on the page.

### Page metadata — `apps/web/app/subscriptions/page.tsx`, `apps/web/app/subscriptions/[id]/page.tsx`

`/subscriptions` exports a static `metadata` object (`title: "Subscriptions | SubTrack"`), same pattern as the root layout's `metadata` export. `/subscriptions/[id]` uses `generateMetadata({ params })` instead (async, awaits the `Promise<{ id: string }>` params per Next 16's route-props convention) since the title needs the specific subscription's name — `${subscription.name} | SubTrack`, falling back to `"Subscription Not Found | SubTrack"` when the mock lookup misses (the page component's own `notFound()` call handles the actual 404 render; `generateMetadata` just needs a sensible title for that same case, since it resolves independently of the page body).

---

## Mobile Components

_Empty. Components will be added here as they are built._