# Documentation rules

| Rule | Example |
|---|---|
| Docs are in English | — |
| `README.md` and `CLAUDE.md` stay at the root; every other doc lives in `docs/` | `docs/guides/cv.md` |
| `CLAUDE.md` is a short index of `@imports`; rules live in `docs/claude/` | [CLAUDE.md](../../CLAUDE.md) |
| A topic with 2+ files gets a subfolder | `docs/guides/`, `docs/claude/` |
| Tables and Mermaid diagrams first; at most one short sentence under a heading | — |
| No intros, conclusions or empty sections | — |
| Every command, path and name comes from the repo; unknown values are `TODO: confirm` | — |
| Update the rule file in the same change as the code | Stale rules mislead the agent |

`AGENTS.md` stays at the root: `next dev` writes it there and `CLAUDE.md` imports it.
