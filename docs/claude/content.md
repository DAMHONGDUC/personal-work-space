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
| A `code` block is coloured when the page is built (`highlightVersions`, Shiki) and drawn with a bar: caption, language, copy button | Reads like a fenced block on GitHub; no highlighter ships to the browser | Language names from `CodeHighlight.LANGUAGES` / `ALIASES` in `code-highlight.mts`; an unknown one shows plain |
| A `links` block lists things to open elsewhere; each `url` is identical in both languages and `https` | Same page whatever the language | Label and `source` (the channel) are written per language |
| A guide opens in English unless it sets `defaultLang` (same in both files) | A reader's stored choice still wins | `fullstack-roadmap` sets `"vi"` |
| A guide can be one page of a series: `series: { id, part }`, same in both files; part 0 is the overview and names the series, parts run 0…n without gaps | Each page lists the series on top and links previous / next at the foot (`SeriesNav`) | `fullstack-web`: `fullstack-roadmap` (0) to `fullstack-roadmap-6-deploy` (6), topic `fullstack` |
| Guides updated the same day sort by slug | Directory order differs between machines; a series stays in order | Name series pages `<overview-slug>-<n>-<topic>` |

## Synced guides — `src/data/synced-docs/`

Markdown kept in another repo, published as guide series. Enforced by [synced-docs.test.ts](../../tests/synced-docs.test.ts).

| Rule | Reason | Example |
|---|---|---|
| Written by `npm run docs:sync`; never hand-edited | The Markdown is the source; the next sync overwrites any edit | — |
| A series in `src/data/synced-docs.json` is a list of parts, each one file or one folder of Markdown; a file an earlier part took is skipped in a later folder | One entry in the index, the rest reached from it | `sitelog`: `README.md`, `ROADMAP.md`, `feature-guide/README.md`, `feature-docs`, … then `feature-guide` |
| A part names its `panel`: the block of the series navigation it sits in, under that heading; a page shows only its own panel, with links into the others | The index card opens the base docs, which lead into the guides; the card also jumps straight to them | `Base docs` → `Sprint guides` |
| A folder part has one `group` heading for all its pages, or `groupBy: "folder"`: each subfolder a group headed by its README (`opensGroup`) | A sprint reads as its overview with its features under it | `S0-foundation-access/` → S0 README, then F00, F01 |
| Folders in the series' `host` are copied whole to `public/synced-docs/<id>/<repo path>`, and links into them point at the copy instead of GitHub | A page with its own assets (a mockup) opens on the site, its relative links intact; test-checked | `docs/design/mockups`, `docs/design/app-icon` |
| The first part is part 0 and the only page the index lists; a search reaches every page | A 40-page series stays one card | `isListed` in `doc-listing.ts`; `sitelog-overview` |
| The sync reads a local clone (`localPath`); the build never touches the other repo | Static export, reproducible CI | `../../SwiftUI/site-log-ios` |
| One page per Markdown file; every slug starts with `<series id>-`, which is how stale pages are found | Order: root, then each folder: its README, its files sorted, then its subfolders the same way | `sitelog-overview`, `sitelog-guide-f05-capture` |
| A folder's README is named after its folder (the part's own README after the prefix alone), any other file by its name only, lower-cased; two files with one slug fail the sync | A slug does not grow with the folders above it; a link to a folder opens its README | `S0-foundation-access/README.md` → `sitelog-guide-s0-foundation-access` |
| A folder page's title gets its file's number when it lacks it | The series list reads in order | `01-field-work.md` → `01 — Field work`; `F01 — …` is left alone |
| English only (`languages: ["en"]`), titles keep their own numbers (`numbered: false`) | The Markdown is English and numbered; no switch, no second number | `0. Entry point (done)` |
| Rendered to HTML at sync time, drawn by `HtmlBlock` with the `.md-body` styles in globals.css; `text` holds the same words for search | The site ships no Markdown parser | `<details>` hints stay collapsible |
| Heading ids are GitHub's; links to another synced file point at its page, other repo files at GitHub, images are copied to `public/synced-docs/` | The docs' own links keep working; test-checked down to the anchor | `../sitelog-specs-00-overview/#d09--…` |
| A ```mermaid block is drawn to SVG at sync time (mermaid-cli), light and dark, shown as a `<picture>`; a block that does not parse stays code and the sync warns | Diagrams render with no runtime library; unchanged ones are not redrawn | `public/synced-docs/sitelog/diagram-<hash>-dark.svg` |
| Every synced SVG `<img>` carries its `width` and `height` | The space is held before it loads, so the page never grows under a reader scrolling to a section | Read from the SVG's viewBox |
| Code is coloured by Shiki at sync time with the same themes as the guides, and framed with the language and a copy button (`.md-code`, answered by `HtmlBlock`) | Every code block on the site looks and copies the same | Languages preloaded: pages render in parallel |
| A task's parts become lettered steps — a. File [Edit], b. Explain, c. Think (with its hints), d. Code (folded, "Show code"), e. Try — restarting at each File line; the path under File is a yellow tag (`md-file`, `AppColors.MARKDOWN_FILE`) | A task reads as a sequence, and the file to open at a glance; test-checked | `stepTasks` and `markFilePaths` in the sync |
| Only a task's Code folds, closed ("Show code", `md-code-fold`); every other `<details>` becomes a framed block that is always shown (`md-panel`) | Hints and groups are read in passing; the Code holds the answer, checked after trying; test-checked | `unfoldDetails` in the sync |
| A `## Contents` section is dropped | The page draws its own | — |

## Project media — `src/data/project-media.json`

Enforced by [project-media.test.ts](../../src/lib/projects/project-media.test.ts).

| Rule | Reason | Example |
|---|---|---|
| One entry per project: a 4:3 `cover` under `public/personal/projects/` and a `youtube` demo link | The Upwork tab and the portfolio show the same cover and video; changed once | `"BaroEase": { "cover": "/personal/projects/baroease-cover.jpg", "youtube": "https://youtu.be/pvCg-821vBo" }` |
| Keyed by the CV's project name, else the Upwork portfolio title | The portfolio looks up CV projects, the Upwork tab its `cvProject` or title | `Sovereign: Private Jet` is a client job, not a CV project |
| Every Upwork portfolio project has an entry; a cover is the app repo's Upwork cover, as JPEG | Upwork asks for a cover on every project; a 1 MB PNG is cut to ~200 KB | `migraine-tracker/assets/mkt/baroease-upwork-cover-1600x1200.png` |
| `youtube` is `https://youtu.be/<id>` | One short form to paste into Upwork | — |

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
