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
| Each guide remembers where the reader stopped, and offers it back on the next visit | `localStorage` `docs-position:<slug>`: section id + offset into it, so it survives a language switch; asked by a bar (`ResumeReading`), never jumped to; nothing offered for the first section or a guide read to the end | `useReadingPosition` in `DocArticle` |
| One offset puts a section under the sticky header: `scroll-padding-top` on `html` | A second one (`scroll-mt` on the section) left headings below the line the contents highlight reads | Sections and Markdown headings carry no scroll margin |
| A contents link scrolls by script and checks where it landed | Smooth scrolling stops short when the page grows under it (a lazy image above) or never runs; `scrollToSection` jumps the rest of the way, unless the reader scrolled | `PolicyNav` → `src/lib/scroll/scroll-to-section.ts`; the body's own `#` links too (`useSectionLinks`) |

## Search

| Rule | Reason | Example |
|---|---|---|
| Every search filters what the page already shipped | Static export: no endpoint, no build-time index | `useAppSearch`, [doc-search.ts](../../src/lib/docs/doc-search.ts), [effect-search.ts](../../src/lib/effects/effect-search.ts) |
| Guide search reads diagram dialogs too, and strips Vietnamese diacritics on both sides | Terms are defined there; `ma hoa` must find `mã hoá` | — |
| The guide index filters by topic too, combined with the search | One topic at a time; All, or pressing the chosen one again, shows every guide | `TopicFilter`, only topics that hold a guide |
| One `SearchInput` for every search box | Two slightly different boxes read worse | `src/components/shared/SearchInput.tsx` |

## Never

| Don't | Instead |
|---|---|
| Delete the legacy `/<slug>/` routes | Keep the meta refresh |
| Import `node:fs` from a client component | Keep loaders server-only; types in `*-model.ts` |
