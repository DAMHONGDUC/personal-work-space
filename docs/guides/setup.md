# Setup

| Requirement | Version / install | Needed for |
|---|---|---|
| Node.js | `>=22.18` (`engines` in [package.json](../../package.json)) | Everything; the `.mts` scripts rely on built-in type stripping |
| LaTeX engine | `brew install tectonic` (or `latexmk` / `pdflatex`) | Optional: the local CV PDF |
| poppler | `brew install poppler` | Optional: CV page images (`pdftoppm`) |

## Commands

| Task | Command | Notes |
|---|---|---|
| Start from a fresh clone | `npm run dev` | `predev` runs `setup`: clean, install, CV LaTeX, PDF and images when the tools exist |
| Same, and open the browser | `npm run dev:open` | Waits for `http://localhost:3000` |
| Production build, served | `npm run preview` | `next build`, then `serve out` |
| Lint / typecheck / test | `npm run lint && npm run typecheck && npm test` | Required before calling work done |
| Build only | `npm run build` | Static export to `out/` |
| Clean generated files | `npm run clean` | `.next`, `out`, `cv/build`, `public/cv.pdf`, `public/cv` |

## Environment variables

| Variable | Used by | Without it |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | [next.config.ts](../../next.config.ts), set by CI for GitHub Pages | Site served from `/` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Effect uploads | Upload button hidden |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Effect uploads | Upload button hidden |

Local values go in the git-ignored `.env.local`; setup steps are in [effects.md](effects.md#uploads).

## Git hook

| Step | Detail |
|---|---|
| Installed by | `npm install` → `prepare` → `git config core.hooksPath .githooks` |
| Checks | Conventional Commits, see [docs/claude/commits.md](../claude/commits.md) |
