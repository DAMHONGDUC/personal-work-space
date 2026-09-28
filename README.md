# Personal work space

Static site with these sections:

| Path                             | What it is                       |
| -------------------------------- | -------------------------------- |
| `/apps/`                         | Directory of every published app |
| `/apps/<slug>/privacy_policy/`   | One app's privacy policy         |
| `/docs/`                         | Guides, shelved by topic         |
| `/docs/<slug>/`                  | One guide, in English and Vietnamese |
| `/effects/`                      | Video-editing effects library    |
| `/effects/<category>/`           | One category, previews per file  |
| `/personal/portfolio/`           | Portfolio: skills, work, projects |
| `/personal/cv/`                  | CV, served from `public/cv.pdf`  |

All content lives in JSON — neither adding an app nor updating the CV touches UI
code.

```
src/data/
├── site.json              publisher, url, email + shared legal sections
├── portfolio.json         the portfolio's presentation; its facts come from the CV
├── docs/
│   ├── en/<slug>_en.json  one guide per file, per language
│   └── vi/<slug>_vi.json
├── cv/
│   ├── cv_full.json       one file per version of the CV
│   └── cv_no_freelancer.json
└── apps/
    └── baro-ease.json     one file per app
cv/template/main.tex       CV layout (see cv/README.md)
public/personal/avt.jpg    CV photo, also the portfolio's
```

Every URL is defined in `src/lib/routes/routes.ts`; use `routes.*` rather than writing
paths by hand.

The old addresses `/<slug>/` and `/<slug>/privacy_policy/` still resolve — they
render a `noindex` meta-refresh to the new path, so links already submitted to
the app stores keep working.

## Commands

One command does everything — clean, install dependencies, rebuild the CV PDF,
start the dev server. It works from a fresh clone:

```bash
npm run dev        # or dev:open, which also opens the browser
```

The prep is `npm run setup`, wired in through npm's `predev` / `predev:open`
hooks. It needs a LaTeX engine to build the CV PDF (`brew install tectonic`) and poppler (`brew install poppler`);
without one it prints how to get one and carries on, so the server always
starts.

```bash
npm run preview   # production build, served at http://localhost:3000
```

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

There is no `npm start`: the site is a static export, which `next start` refuses
to serve. Use `npm run preview`.

## Updating the CV

Edit a file in `src/data/cv/` — `npm run dev` picks it up. Each file is a whole
version of the CV, cut for a different reader, and the CV page offers them all in
a dropdown. The deployed PDFs are compiled from LaTeX in CI; `npm run cv:pdf`
builds them locally if you have LaTeX. See [cv/README.md](cv/README.md) for how
to preview one without installing anything.

## Updating the effects library

The files live on a public Google Drive folder, named in
`src/data/effect-library.json`. Nothing is hosted here: thumbnails, players and
downloads all come from Drive. To pick up files added on Drive:

```bash
npm run effects:sync
```

It rewrites the file lists in `src/data/effects/`, one JSON per top-level Drive
folder. Each pack's `name`, `category` and `exclude` are hand-edited and kept
across syncs. A new Drive folder arrives with an empty `category`, and
`npm test` fails until you file it under a category from
`effect-library.json`.

Folders in the Drive may be shortcuts to someone else's Drive; the sync follows
them to the real folder. A shortcut is not a copy — if the owner deletes or
unshares the original, the files go with it.

### Uploading from the site

The Upload button on `/effects` sends files to your Drive, under
`My uploads/<category>` in the library folder, and lists them in
`effects-uploads.json` beside it. Every page reads that file when it opens, so
an upload shows up at once — no sync, no rebuild. The sync skips `My uploads`.

It needs two values from a Google Cloud project, both public by design:

1. [console.cloud.google.com](https://console.cloud.google.com) → new project →
   **APIs & Services → Library** → enable **Google Drive API**.
2. **OAuth consent screen** → External, status **Testing**, add your own Google
   account as a test user. Only test users can sign in, so only you can upload.
3. **Credentials → Create credentials → OAuth client ID** → Web application.
   Authorised JavaScript origins: `https://damhongduc.github.io` and
   `http://localhost:3000`.
4. **Credentials → Create credentials → API key** → restrict it to the Google
   Drive API and to the HTTP referrers `https://damhongduc.github.io/*` and
   `http://localhost:3000/*`.

Then, for the deployed site: GitHub repo → **Settings → Secrets and variables →
Actions → Variables** → add `GOOGLE_CLIENT_ID` and `GOOGLE_API_KEY`. Locally,
put them in `.env.local` (git ignores it):

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=…apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_API_KEY=…
```

Without them the Upload button is not shown and the site reads no uploads.

## Adding an app

Create one JSON file in `src/data/apps/`. That's it — the loader reads the
directory, so there is no index to register the app in.

**The filename is the URL:** `focus-timer.json` →
`/apps/focus-timer/privacy_policy/`

Start from the JSON below, or copy an existing app and edit it:

```bash
cp src/data/apps/baro-ease.json src/data/apps/focus-timer.json
```

### Sample JSON

```json
{
  "name": "Focus Timer",
  "tagline": "A distraction-free Pomodoro timer for deep work.",
  "icon": "⏳",
  "accent": "#6366f1",
  "platforms": ["iOS", "Android"],
  "effectiveDate": "2026-01-10",
  "lastUpdated": "2026-06-02",
  "contactEmail": "support@example.com",
  "storeLinks": {
    "appStore": "https://apps.apple.com/app/id0000000000",
    "playStore": "https://play.google.com/store/apps/details?id=com.example.focustimer"
  },
  "overview": [
    "This Privacy Policy describes how {{app}} handles information when you use the app."
  ],
  "summary": [
    "Your timer sessions never leave your device.",
    "No account, no sign-in required."
  ],
  "collects": [
    {
      "category": "Diagnostics",
      "items": ["Crash logs", "Device model"],
      "purpose": "Identify and fix crashes.",
      "linked": false
    }
  ],
  "notCollected": ["Precise location", "Contacts", "Photos or media"],
  "permissions": [
    {
      "name": "Notifications",
      "required": false,
      "reason": "Alert you when a session ends."
    }
  ],
  "thirdParties": [
    {
      "name": "Firebase Crashlytics",
      "purpose": "Crash reporting.",
      "url": "https://firebase.google.com/support/privacy"
    }
  ]
}
```

Optional, safe to omit: `contactEmail`, `storeLinks`, `overview`, `sections`.
Everything else is required — but `collects` / `permissions` / `thirdParties`
may be `[]`.

### Things worth knowing

- `linked: true` means the data can be tied to a person (App Store
  nutrition-label wording); it renders an amber badge.
- `collects: []` renders a "does not collect any data" note instead of an
  empty table.
- An empty array hides its section, and its table-of-contents entry.
- `{{app}}`, `{{publisher}}` and `{{email}}` are substituted inside `overview`
  and `sections`.
- A `sections` entry reusing an id from `site.json` (e.g. `security`)
  **replaces** that shared section for this app only; a new id **appends** one.

## Deploy

Push to `main` — GitHub Actions builds the static export and publishes it to
Pages.

One-time setup: **Settings → Pages → Source → GitHub Actions**.

Set `site.url` in `site.json` to the real deployed URL before going live; the
sitemap and canonical tags are built from it.
