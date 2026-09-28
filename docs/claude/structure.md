# Structure rules

## Folders by scope

| Rule | Reason | Example |
|---|---|---|
| `src/lib`, `src/hooks`, `src/components` hold one folder per scope | Find a feature in one place | `apps` `cv` `docs` `effects` `portfolio` `routes` `scroll` `layout` `policy` `shared` |
| A test sits beside its file | Moves together | `src/lib/apps/apps.ts` + `apps.test.ts` |
| Only cross-scope files stay at a root | Keeps roots small | `src/lib/resource-constant.mts`, `format.ts`, `utils.ts` (shadcn alias) |
| Design tokens are their own scope | See [ui.md](ui.md) | `src/lib/design/` |
| A new file goes in its scope's folder; a new scope gets a folder | Nothing new at a root | — |

## Paths — ResourceConstant

| Rule | Reason | Example |
|---|---|---|
| Every content and build-output path lives in [resource-constant.mts](../../src/lib/resource-constant.mts) | A moved file is renamed once | `ResourceConstant.DOCS_DIR` |
| It is `.mts` and imports nothing | Plain-Node CV scripts import it by relative path; `node:path` would break browser bundles | Callers join with `process.cwd()` |
| The one exception: the static CV JSON import in [cv.ts](../../src/lib/cv/cv.ts) | Bundling needs a literal path | A test asserts both agree |

## Routes

| Rule | Reason | Example |
|---|---|---|
| Every URL comes from [routes.ts](../../src/lib/routes/routes.ts) | No hand-written paths in components, tests or the sitemap | `routes.doc(slug)` |
| Top-level sections: `/apps`, `/docs`, `/effects`, `/personal` | — | `/personal` holds the portfolio and the CV; its root forwards to the portfolio |
| Keep `/<slug>/` and `/<slug>/privacy_policy/` | Legacy addresses submitted to the app stores | They render a `noindex` meta refresh |
| An app slug may not match a top-level section | `RESERVED_SLUGS`, test-enforced | — |
| Back restores the scroll offset | `ScrollMemory` in the root layout | A fresh navigation starts at the top; an anchor is left alone |

## Search

| Rule | Reason | Example |
|---|---|---|
| Every search filters what the page already shipped | Static export: no endpoint, no build-time index | `useAppSearch`, [doc-search.ts](../../src/lib/docs/doc-search.ts), [effect-search.ts](../../src/lib/effects/effect-search.ts) |
| Guide search reads diagram dialogs too, and strips Vietnamese diacritics on both sides | Terms are defined there; `ma hoa` must find `mã hoá` | — |
| One `SearchInput` for every search box | Two slightly different boxes read worse | `src/components/shared/SearchInput.tsx` |

## Never

| Don't | Instead |
|---|---|
| Delete the legacy `/<slug>/` routes | Keep the meta refresh |
| Import `node:fs` from a client component | Keep loaders server-only; types in `*-model.ts` |
