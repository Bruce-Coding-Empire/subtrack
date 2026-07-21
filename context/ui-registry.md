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

---

## Mobile Components

_Empty. Components will be added here as they are built._