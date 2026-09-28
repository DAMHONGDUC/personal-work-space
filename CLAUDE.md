@AGENTS.md

# CLAUDE.md

| | |
|---|---|
| Project | Static site (Next.js 16 export, React 19, Tailwind 4, shadcn/ui): app privacy policies, bilingual guides, effects library, portfolio, CV |
| Entry point | `src/app/layout.tsx` |

## Commands

| Task | Command |
|---|---|
| Install + CV build + dev server (fresh clone) | `npm run dev` |
| Same, and open the browser | `npm run dev:open` |
| Checks before saying work is done | `npm run lint && npm run typecheck && npm test` |
| Test one file | `npx vitest run tests/doc-data.test.ts` |
| Production build, served locally | `npm run preview` |
| CV LaTeX / PDF | `npm run cv:tex` / `npm run cv:pdf` |
| Sync the effects library from Drive | `npm run effects:sync` |
| Check commit messages in a range | `npm run commits:check -- origin/main..HEAD` |

| Never | Instead |
|---|---|
| `npm start` | `npm run preview` — `next start` refuses an `output: "export"` build |
| Telling the user to run install / CV build / server as separate steps | `npm run dev` does all of it from a fresh clone |

## Rules

- @docs/claude/commits.md
- @docs/claude/structure.md
- @docs/claude/content.md
- @docs/claude/ui.md
- @docs/claude/portfolio.md
- @docs/claude/cv.md
- @docs/claude/docs.md
