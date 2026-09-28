# Architecture

## Layers

```mermaid
flowchart TD
  Data["src/data/*.json<br/>apps · docs · effects · cv · portfolio · site"]
  Lib["src/lib/{scope}<br/>loaders + *-model.ts types"]
  Design["src/lib/design<br/>AppColors · AppTextStyles · AppSpacings"]
  Hooks["src/hooks/{scope}<br/>client state: search, language, scroll"]
  Comp["src/components/{scope}<br/>+ ui (shadcn)"]
  App["src/app<br/>route files: compose only"]
  Out["out/<br/>static export → GitHub Pages"]

  Data --> Lib --> App
  Lib --> Comp
  Design --> Comp
  Hooks --> Comp --> App --> Out
```

| Layer | Folder | Responsibility | May depend on |
|---|---|---|---|
| Content | `src/data/` | All copy and facts, as JSON | — |
| Loaders | `src/lib/<scope>/` | Read and shape content at build time (`node:fs`, server-only) | Content, `resource-constant.mts` |
| Models | `src/lib/<scope>/*-model.ts` | Types and constants safe for the browser | Nothing server-side |
| Tokens | `src/lib/design/` | Colours, type roles, page gaps | Nothing |
| Hooks | `src/hooks/<scope>/` | Client behaviour: search, language, scroll, standalone header | Models |
| Components | `src/components/<scope>/` | All markup and styling | Models, tokens, hooks, `ui` |
| Routes | `src/app/` | Compose components per URL; no `className`/`style` | Loaders, components |
| Scripts | `scripts/` | CV LaTeX/PDF, effects sync, commit check | `resource-constant.mts` |

## Data flow: building a page

```mermaid
sequenceDiagram
  participant B as next build
  participant R as src/app route
  participant L as src/lib loader
  participant D as src/data JSON
  participant C as components
  B->>R: prerender every path (generateStaticParams)
  R->>L: getDocBundle(slug) / portfolio / getApps()
  L->>D: read JSON (fs or static import)
  L-->>R: typed data
  R->>C: props
  C-->>B: HTML into out/
```

## Portfolio data

```mermaid
flowchart LR
  CV["cv_full.json<br/>facts"] --> Build["buildPortfolio()"]
  Page["portfolio.json<br/>presentation"] --> Build
  Build --> P["Portfolio"] --> Page2["/personal/portfolio"]
  CV --> Tex["cv:tex → PDF"] --> CVPage["/personal/cv"]
```

## Key decisions

| Decision | Reason | Trade-off |
|---|---|---|
| Static export (`output: "export"`) | Free hosting on GitHub Pages | No server: no `next start`, search is client-side, uploads go straight to Drive |
| Content in JSON, never markup | Edit content without touching UI | Rules enforced by tests, not types alone |
| One CV feeds the PDF and the portfolio | Facts cannot drift | Portfolio-only copy needs its own CV field (`portfolioAbout`) |
| Dark mode by media query only | Correct first paint without JavaScript | No manual toggle |
| CSS animation, JavaScript only for timing | Works without script; honours reduced motion | Needs IntersectionObserver for scroll entrances |
| Paths in `ResourceConstant`, URLs in `routes` | Renames happen once | — |

## Where to add things

| Task | Location |
|---|---|
| App privacy policy | `src/data/apps/<slug>.json` — [guide](guides/apps.md) |
| Guide | `src/data/docs/{en,vi}/<slug>_{en,vi}.json` — [rules](claude/content.md) |
| CV version | `src/data/cv/<slug>.json` + `src/lib/cv/cv.ts` — [guide](guides/cv.md) |
| Portfolio fact | The CV JSON; presentation in `src/data/portfolio.json` |
| New URL | `src/lib/routes/routes.ts` + folder under `src/app/` |
| New component | `src/components/<scope>/` |
| New colour, text role or page gap | `src/lib/design/` |
| New content path | `src/lib/resource-constant.mts` |
