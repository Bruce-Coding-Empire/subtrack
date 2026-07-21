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
      → merge back to main (squash merge — see below)
 └── feat/04-auth-web-ui     (branch off updated main)
      ...
```

1. **Branch off `main`** for every feature, named per the convention above
2. **Commit as you go** — don't wait until a feature is fully done to make your first commit; small, logical commits are easier to review and revert
3. **Before merging:** update `progress-tracker.md` — check off the feature, update "Last completed" / "Next", add any decisions made to "Decisions Made During Build". This update is part of the same branch, not a separate one.
4. **Merge to `main` via squash merge** (see below)
5. **Delete the branch** after merging — keep the branch list clean

### Why Squash Merge

Solo project, so there's no review-comment history worth preserving per-commit. Squash merging means `main`'s history reads as one clean commit per feature — exactly matching the numbered list in `build-plan.md`. Anyone (including a hiring manager) browsing `main`'s log sees a readable feature-by-feature build history instead of a wall of "wip", "fix typo", "actually fix it" commits.

```powershell
# On GitHub: when merging a PR, choose "Squash and merge"
# Locally, equivalent:
git checkout main
git merge --squash feat/03-auth-api
git commit -m "feat(api): add auth module with register, login, refresh"
git branch -d feat/03-auth-api
```

The squashed commit message should read like a mini version of the feature's entry in `build-plan.md`, not like the last WIP commit you happened to make.

---

## Pull Requests

Even solo, open a PR per feature branch rather than merging directly — it's a natural checkpoint to re-read your own diff before it lands in `main`, and it gives the repo a visible PR history, which is itself something a reviewer might glance at.

**PR title:** same as the eventual squash commit message — `feat(api): add auth module with register, login, refresh`

**PR description template:**

```markdown
## What
Brief description of what this branch adds/changes.

## Build plan reference
Feature 03 — Auth API

## Testing
How this was verified (manual test steps, Swagger UI check, etc.)
```

---

## When Work Spans Multiple Apps

Some features (e.g. "add name field" from earlier in this project) touch `context/`, `apps/api`, and `apps/web` in one logical change. Keep this as **one branch, one PR** — e.g. `feat/add-user-display-name` — with commits scoped per app inside it if it's cleaner to separate them, but don't split it into three separate PRs that have to land in a specific order. That's exactly the coordination problem a monorepo is meant to solve.

---

## `main` Is Always Deployable

Never merge a branch into `main` that leaves the app in a broken state — if a feature is genuinely half-done at a natural stopping point, keep it on its branch rather than merging incomplete work. `progress-tracker.md` reflects what's actually in `main`, not what's in progress on a branch.