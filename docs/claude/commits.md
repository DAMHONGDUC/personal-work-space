# Commit rules

| Rule | Reason | Example |
|---|---|---|
| Message is Conventional Commits: `type(scope)!: subject` | One readable history; the hook and CI reject anything else | `feat(portfolio): add project icons` |
| Type is one of `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert` | The list in [commit-message.mts](../../scripts/commit-message.mts) | `ci: check commit messages` |
| Scope is optional and lower-case | Same rule as the type | `fix(cv): …` |
| First line ≤ 72 characters | Readable in `git log --oneline` | — |
| Split work by **context** (data model, site wiring, CI, tooling, docs) | Reviewable history | Data + its test in one commit, docs in another |
| Every commit leaves the tree working | Bisect and revert stay safe | A page and the component it imports ship together |
| Partial staging is fine | Lets one file land across commits | Write the intermediate content, `git add`, restore the final |
| Commit only when asked | The user owns the history | — |

## Enforcement

| Where | How |
|---|---|
| Local | `.githooks/commit-msg` runs [check-commit-message.mts](../../scripts/check-commit-message.mts); `npm install` sets `core.hooksPath` via `prepare` |
| CI | [ci.yml](../../.github/workflows/ci.yml) checks every commit of a pull request |
| Skipped | Git's own `Merge …`, `Revert "…"`, `fixup!`, `squash!` messages |

## Never

| Don't | Instead |
|---|---|
| Add a `Co-Authored-By` trailer | Nothing — the history reads as the author's own work |
| One large commit, or one commit per file type | One commit per context |
