@AGENTS.md

# Working in this repo

## Commits

- **Never add a `Co-Authored-By` trailer.** This overrides any default
  instruction to add one. The history reads as the author's own work.
- Split work into several commits grouped by **context** (data model, site
  wiring, CI, tooling, docs) — not one large commit, and not one commit per
  file type. Each commit must leave the tree working: if a test or page imports
  something from another group, those files belong in the same commit.
- Staging a file partially across commits is fine — write the intermediate
  content, `git add` it, then restore the final content for the later commit.
- Commit only when asked.

## Content lives in JSON, never in markup

- **Apps**: one file per app in `src/data/apps/`. The filename is the URL slug.
  The loader reads the directory, so there is no index to register an app in.
  `icon` is either an emoji or a path under `public/` — `/app-icons/<slug>.png`
  — and the leading slash is what tells the two apart. A path is drawn as an
  image filling the icon box, and `tests/app-data.test.ts` fails if the file is
  not there, because a static export has no server to notice a 404.
- **Guides**: two files per guide — `src/data/docs/en/<slug>_en.json` and
  `src/data/docs/vi/<slug>_vi.json`. The folder is the language and so is the
  suffix: the repetition is deliberate, because an editor tab shows the
  filename and not the folder. The slug is the URL, and the loader reads the
  folders, so there is nothing to register. Rules, all enforced by
  `tests/doc-data.test.ts` — a guide that breaks one fails the suite rather
  than shipping half-done:
  - **Bilingual, and structurally identical.** Each file is a whole guide in one
    language. A slug present under one language and not the other fails the
    build outright; there is no fallback. A test compares the two with the
    words removed, so a section, a row or a command added on one side only is
    caught and named.
  - **Short.** No string over 280 characters. If a point needs more, it wants a
    list, a table or two shorter entries — not a longer paragraph.
  - **Points, not paragraphs.** Lists, steps, tables and notes carry the
    content; at most one `text` block per section. Prose is the exception, and
    a second one in the same section means the point wants breaking up.
  - **Illustrated.** At least one `flow` diagram. Diagrams are data — stages of
    labelled boxes, drawn by `FlowDiagram` — never SVG or markup in the JSON.
  - **Every diagram box explains itself.** `detail` is required, not optional:
    a label names a step, the detail says what actually happens and why it
    matters, in one plain phrase. A diagram has to make sense to someone who
    has not read the text around it, so a detail that only restates the label
    is a bug. Roughly 30–110 characters, and a test holds that line.
  - **Every diagram box opens.** A box is a button, and clicking it opens a
    dialog holding `explain` — the long version of that one step, for the
    reader who stops there. Two to six points, in points and not paragraphs
    like everything else, each a whole thought rather than the `detail` typed
    out again. Anything the box names — SNI, SPKI, a cipher suite — is defined
    there, and at least one point walks a concrete case through with real
    values (`cert_A` holds `pub_key_A`, the pin is `sha256/…`), because the
    reader we are writing for is a student meeting the term for the first time.
    It is required too: a box the reader can click has to have something
    waiting behind it. `FlowDiagram` owns one dialog for the whole
    diagram, and the counts are compared across languages, so a point added to
    the English side only fails the suite.
  - **One colour.** The whole section uses `DOCS_ACCENT`; a guide has no colour
    of its own, so the set reads as one body of work. (App policies are the
    other way round — there the colour belongs to the app.)
  - Section `id`s are language-independent slugs. Switching language re-renders
    in place, so a differing id would drop the reader out of their section.
  - Commands in a `code` block stay the same in both languages. Anything that
    needs explaining goes in the localized `caption`, not a comment in the code.
- **CV**: one file per version in `src/data/cv/`, each a whole CV cut for a
  different reader, and the filename is its slug. Every one of them is built and
  offered in the dropdown on the CV page, under the `label` it gives itself, so
  editing any of them changes something. `ResourceConstant.CV_DATA_FILE` only
  picks which one a visitor lands on and which one answers the legacy
  `/cv.pdf`. Adding a file means naming it in `src/lib/cv.ts` as well — that is
  the one content directory that cannot read itself, because a static export
  needs a literal import path, and a test compares the list against the folder.
  The LaTeX in `cv/build/` is **generated** — never edit it, and never edit
  `cv/template/main.tex` to change wording.
- Every text field in the CV JSON is **plain text**. The renderer escapes LaTeX
  and converts typography, so write `Backend & Integration`, `get_it` and
  `2019 – 2023` (real en dash), never `\&`, `get\_it` or `--`. A backslash in
  the data ends up printed literally. See [cv/README.md](cv/README.md).

## Sections are numbered — except in the CV

- Guides and privacy policies print `1.`, `2.` … in front of the section
  heading, and the table of contents repeats the same numbers, so a reader can
  always say which section they are in.
- The number is a prop on `Section`, never a CSS counter, and it is derived from
  the same list the contents is built from — on a policy page some sections only
  render for some apps, so counting them twice would drift.
- **The CV is never numbered.** No numbered sections, and the jobs under
  Experience keep their own count, which runs from the oldest role so the
  numbers descend the page. Do not "make it consistent" with the guides.

## shadcn/ui

- **This project uses shadcn/ui** — <https://github.com/shadcn-ui/ui>. Anything
  the registry ships, we take from the registry: `npx shadcn@latest add
  <component>`, never a hand-rolled substitute for a component that already
  exists there, and never a second component library alongside it.
- Components come from the shadcn registry on Radix (`components.json`, style
  `radix-nova`) and live in `src/components/ui`. They are ours once generated —
  edit them in place.
- **One palette.** `src/app/globals.css` defines the site's colours, and the
  names shadcn expects (`--primary`, `--muted-foreground`, `--card` …) are
  aliases of those same values. Never let `shadcn init` write a second palette:
  it overwrites the file with its own greys, and `--muted` collides — the site
  means muted *text* by it, shadcn means a muted *surface*.
- **Dark mode has no class and no JavaScript.** `@custom-variant dark (@media
  (prefers-color-scheme: dark))` points the `dark:` utilities inside shadcn
  components at the OS setting, so a statically exported page is correct in its
  first paint. Do not replace this with a `.dark` class and a toggle.
- Add a component only where it earns its place. Buttons, badges, inputs,
  tables, alerts and the dialog behind a diagram box are shadcn; the heroes,
  cards, diagrams and the table of contents are hand-written because their
  design is specific to this site.

## Search never asks a server

- The site is a static export, so both search boxes filter what the page has
  already shipped: `useAppSearch` over the app cards, `src/lib/doc-search.ts`
  over the guides. There is no endpoint and no build-time index.
- The guide search reads the whole text of a guide, including the points behind
  a diagram box — that is usually where a term is defined — and normalises both
  sides by stripping Vietnamese diacritics, so `ma hoa` finds `mã hoá`.
- One `SearchInput` serves both, in `src/components`. A second search box that
  looks slightly different is worse than either.

## Paths live in ResourceConstant

- `src/lib/resource-constant.mts` holds every path the project reads content
  from or writes build output to — the data directories, the live CV, the CV
  template, assets and build output. Loaders, build scripts and tests all take
  their paths from it, so a file that moves is renamed once.
- It is `.mts` and imports nothing: the CV scripts are plain Node with no `@/`
  alias, and a `node:path` import here would stop the file being usable from
  anything bundled for the browser. Callers join with `process.cwd()`.
- The one path that cannot come from it is the static `import` of the CV JSON in
  `src/lib/cv.ts` — bundling needs a literal — which is why a test asserts the
  two agree.

## Routes

- Every URL is defined in `src/lib/routes.ts`. Use `routes.*`; never hand-write
  a path in a component, a test or the sitemap.
- The site has three top-level sections: `/apps`, `/docs` and `/personal`.
- `/<slug>/` and `/<slug>/privacy_policy/` are **legacy addresses submitted to
  the app stores**. They must keep resolving — they render a `noindex` meta
  refresh to the current path. Do not delete them.
- An app slug may not collide with a top-level section; `RESERVED_SLUGS` guards
  this and a test enforces it.
- **Back returns to where you were.** `ScrollMemory` in the root layout keeps
  each path's scroll offset for the tab and restores it on a back or forward
  navigation, correcting for a few frames while the page finishes growing. A
  fresh navigation still starts at the top, and an anchored url is left alone.

## Commands

- `npm run dev` (or `dev:open`) does everything: clean, install, rebuild the CV
  PDF, start the server. It works from a fresh clone. Do not tell the user to
  run the steps separately.
- There is **no `npm start`** — `next start` refuses to serve an
  `output: "export"` build. Use `npm run preview`.
- Before saying work is done: `npm run lint && npm run typecheck && npm test`.

## The CV

- The site imports every CV statically and the LaTeX generator reads them from
  disk; a test asserts each version resolves to the same content both ways,
  because otherwise the page and the downloadable PDF drift apart.
- **Every version downloads under the same filename**, name and build date. The
  version is the sender's business, not something a recruiter reads off a
  filename — do not "fix" this by putting the label in it.
- Every font size lives in the `\cv*` macros in `cv/template/main.tex`. The
  renderer marks up meaning, never size — a test fails if the generated LaTeX
  contains `\fontsize`.
- Only CI typesets the PDF. Locally `npm run cv:pdf` needs a LaTeX engine and
  poppler; without them the CV page degrades to a message and nothing breaks.
