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
| Never commit or push to `main`: work on a branch, open a pull request, merge it with a merge commit | `main` deploys; a squash would copy the PR description, footer included, onto `main` | `feature/cover-letter-for-cv` → PR → `Merge pull request #14 …` |
| Commit as the repo owner, never under an AI tool's identity | The author and committer are part of the history too | `git config user.name ducdam-dev`, `user.email ducdam.dev@gmail.com`; `Claude <noreply@anthropic.com>` is rejected |
| No AI trace in a message: no `Co-Authored-By` or `Claude-Session` trailer, no "Generated with Claude Code" footer, no Claude Code link, no 🤖 | The history reads as the author's own work | The word `claude` alone is fine: `docs(claude): …` |

## Enforcement

| Where | How |
|---|---|
| Local | `.githooks/commit-msg` runs [check-commit-message.mts](../../scripts/check-commit-message.mts) on the message and the author and committer it is about to get; `npm install` sets `core.hooksPath` via `prepare` |
| CI | [ci.yml](../../.github/workflows/ci.yml) checks every commit of a pull request: message, author, committer |
| Skipped | Git's own `Merge …`, `Revert "…"`, `fixup!`, `squash!` messages get no format check; the AI-trace and identity checks still apply |

## Never

| Don't | Instead |
|---|---|
| Add a `Co-Authored-By` trailer | Nothing — the history reads as the author's own work |
| Commit or push to `main`, or force-push it | A branch and a pull request; rewriting `main` only when the owner asks |
| Squash-merge a pull request | A merge commit |
| One large commit, or one commit per file type | One commit per context |
