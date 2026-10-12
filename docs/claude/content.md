# Content rules

Content lives in JSON under `src/data/`, never in markup.

## Site — `src/data/site.json`

| Field | Used for |
|---|---|
| `site.publisher`, `site.contactEmail`, `site.description` | Header, footer, home page, policy defaults |
| `site.url` | Sitemap and canonical tags; no trailing slash (test-enforced) |
| `defaults.sections` | Privacy-policy sections every app shares; an app's `sections` entry with the same `id` replaces one |

## Apps — `src/data/apps/<slug>.json`

| Rule | Reason | Example |
|---|---|---|
| One file per app; the filename is the URL slug | The loader reads the directory; nothing to register | `baro-ease.json` → `/apps/baro-ease/privacy_policy/` |
| `icon` is an emoji or a path under `public/` | The leading `/` tells them apart | `"⏳"` or `"/app-icons/baro-ease.png"` |
| An icon path must exist | Static export has no server to notice a 404; [app-data.test.ts](../../tests/app-data.test.ts) fails | — |
| An app's `accent` belongs to the app | Policies are coloured per app | — |

## Guides — `src/data/docs/{en,vi}/<slug>_{en,vi}.json`

Every rule is enforced by [doc-data.test.ts](../../tests/doc-data.test.ts).

| Rule | Reason | Example |
|---|---|---|
| Two files per guide; folder and suffix both name the language | An editor tab shows the filename, not the folder | `ssh-git_en.json`, `ssh-git_vi.json` |
| Both languages exist and are structurally identical | No fallback; a test compares them with the words removed | A row added on one side only fails |
| No string over 280 characters | Readable standing at a machine | Split into a list or table |
| Points, not paragraphs: at most one `text` block per section | Prose is the exception | — |
| At least one `flow` diagram, as data | Drawn by `FlowDiagram`, never SVG or markup | — |
| Every box has a `detail` of ~30–110 characters that says what happens and why | A diagram reads on its own | Not a restatement of the label |
| Every box has an `explain` of 2–6 points, each ≥ 60 characters | The box opens a dialog; define every term with a concrete worked case | `cert_A` holds `pub_key_A`, the pin is `sha256/…` |
| One colour: `AppColors.DOCS` | The set reads as one body of work | — |
| One `topic` from `DOC_TOPICS` in [doc-model.ts](../../src/lib/docs/doc-model.ts) | The index shelves by it; labels live there | Add a topic there, never a label in JSON |
| Section `id`s are language-independent slugs | Switching language re-renders in place | `create-key` |
| Commands in a `code` block are identical in both languages | Copy-pasteable | Explanations go in the localized `caption` |
| A `links` block lists things to open elsewhere; each `url` is identical in both languages and `https` | Same page whatever the language | Label and `source` (the channel) are written per language |
| A guide opens in English unless it sets `defaultLang` (same in both files) | A reader's stored choice still wins | `fullstack-roadmap` sets `"vi"` |
| A guide can be one page of a series: `series: { id, part }`, same in both files; part 0 is the overview and names the series, parts run 0…n without gaps | Each page lists the series on top and links previous / next at the foot (`SeriesNav`) | `fullstack-web`: `fullstack-roadmap` (0) to `fullstack-roadmap-6-deploy` (6), topic `roadmap` |
| Guides updated the same day sort by slug | Directory order differs between machines; a series stays in order | Name series pages `<overview-slug>-<n>-<topic>` |

## Synced guides — `src/data/synced-docs/`

Markdown kept in another repo, published as guide series. Enforced by [synced-docs.test.ts](../../tests/synced-docs.test.ts).

| Rule | Reason | Example |
|---|---|---|
| Written by `npm run docs:sync`; never hand-edited | The Markdown is the source; the next sync overwrites any edit | — |
| Which folders sync, and each series' name, icon and tags, live in `src/data/synced-docs.json` | One place to add a series | `sitelog-specs` ← `site-log-ios/docs/feature-docs` |
| The sync reads a local clone (`localPath`); the build never touches the other repo | Static export, reproducible CI | `../../SwiftUI/site-log-ios` |
| One file per Markdown file: slug `<series>-<file>`, part = position in the folder | A series is the folder, in order | `sitelog-guide-03-capture` |
| English only (`languages: ["en"]`), titles keep their own numbers (`numbered: false`) | The Markdown is English and numbered; no switch, no second number | `0. Entry point (done)` |
| Rendered to HTML at sync time, drawn by `HtmlBlock` with the `.md-body` styles in globals.css; `text` holds the same words for search | The site ships no Markdown parser | `<details>` hints stay collapsible |
| Heading ids are GitHub's; links to another synced file point at its page, other repo files at GitHub, images are copied to `public/synced-docs/` | The docs' own links keep working; test-checked down to the anchor | `../sitelog-specs-00-overview/#d09--…` |
| A `## Contents` section is dropped | The page draws its own | — |

## Effects library — `src/data/effects/`

| Rule | Reason | Example |
|---|---|---|
| One file per pack = one top-level folder of the Drive in `effect-library.json` | Categories live there too | — |
| `items` are generated by `npm run effects:sync` | Never hand-edit | — |
| `name`, `category`, `exclude` are hand-edited and survive a sync | — | — |
| Nothing is hosted | Every thumbnail, player and download is a Drive URL from `effect-model.ts` | — |
| One colour: `AppColors.EFFECTS` | Same as guides | — |

## Effect uploads

| Rule | Reason |
|---|---|
| Uploads are listed in a manifest JSON on Drive (`effect-uploads.ts`), read on page open, rewritten after each upload | The one runtime exception to static content |
| Never synced into `src/data/effects/` | — |
| Drive calls live in `google-drive.ts`, configured by `NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_API_KEY` | Without them the feature is off |
