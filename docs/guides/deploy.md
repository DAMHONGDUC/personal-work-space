# Deploy

| Trigger | Workflow | Does |
|---|---|---|
| Pull request | [ci.yml](../../.github/workflows/ci.yml) | Commit messages, lint, typecheck, test, CV LaTeX + PDF (artifact `cv-pdf`), build |
| Push to `main` | [deploy.yml](../../.github/workflows/deploy.yml) | Same checks, publishes the CV, builds the static export, deploys to GitHub Pages |

| One-time setup | Where |
|---|---|
| Pages source: GitHub Actions | Settings → Pages → Source |
| `site.url` set to the deployed URL | [src/data/site.json](../../src/data/site.json); sitemap and canonical tags use it |
| Upload variables (optional) | See [effects.md](effects.md#uploads) |
