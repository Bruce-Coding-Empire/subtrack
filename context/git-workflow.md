# Git Workflow

Branching, commit, and merge conventions for SubTrack. Read this before creating a branch or writing a commit message. This is a solo-developer portfolio project, so the workflow favors a clean, readable history over heavy process — but it should still look and behave like something built by someone who knows how teams work, since reviewers may browse this repo directly.

---

## Branch Naming

```
<type>/<build-plan-number>-<short-description>
```

Where `<build-plan-number>` is the feature number from `build-plan.md` when the branch maps directly to one (most branches will). If the work doesn't map to a numbered feature (a hotfix, a refactor, doc updates), omit the number.

**Types:**

| Type       | Use for                                                        |
| ------------ | ------------------------------------------------------------------ |
| `feat`         | New feature or endpoint — most branches will be this               |
| `fix`            | Bug fix                                                             |
| `refactor`         | Code change with no behavior change                                 |
| `docs`               | Changes to `context/` files only                                    |
| `chore`                | Tooling, config, dependency updates, monorepo setup                  |
| `style`                  | Formatting only, no logic change                                    |

**Examples:**

```
feat/03-auth-api
feat/06-subscriptions-page-ui
feat/08-renewal-scheduled-job
fix/renewal-job-timezone-bug
docs/update-api-contract-name-field
chore/add-swagger-setup
chore/mobile-workspace-setup
```

Lowercase, hyphen-separated, no underscores, no capital letters, no ticket numbers (there's no separate ticket system — `build-plan.md` numbering is the ticket system).

---

## Commit Messages — Conventional Commits

```
<type>(<scope>): <short summary, imperative mood, lowercase, no period>

<optional body — why, not what, if the change needs explanation>
```

**Scope** is the app or area touched: `web`, `api`, `mobile`, `context`, `deps`, or a module name like `auth`, `subscriptions`, `dashboard`.

**Examples:**

```
feat(api): add subscriptions CRUD endpoints

feat(web): build subscriptions table with filter and search

fix(api): correct next_renewal_date calculation for custom cycles

docs(context): add name field to users table and api-contract

chore(deps): add @nestjs/swagger and swagger-ui-express

refactor(api): extract billing cycle math into shared util
```

Imperative mood ("add", not "added" or "adds") — matches how Git itself describes commits ("This commit will `add subscriptions endpoint`").

One logical change per commit. A commit that touches `api-contract.md`, the API, and both clients for the same field change is fine as one commit — that's one logical change made real across the stack. A commit that adds an unrelated feature *and* fixes an unrelated bug is two commits.

---

## Branch Workflow

```
main
 └── feat/03-auth-api        (branch off main)
      → work, commit as you go
      → push
```

1. **Branch off `main`** for every feature, named per the convention above
2. **Commit as you go** — don't wait until a feature is fully done to make your first commit; small, logical commits are easier to review and revert
3. **Push** the branch once it's ready
