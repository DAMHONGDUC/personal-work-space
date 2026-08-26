# Personal work space

Static site with two top-level sections:

| Path                             | What it is                       |
| -------------------------------- | -------------------------------- |
| `/apps/`                         | Directory of every published app |
| `/apps/<slug>/privacy_policy/`   | One app's privacy policy         |
| `/personal/cv/`                  | CV, served from `public/cv.pdf`  |

All content lives in JSON — neither adding an app nor updating the CV touches UI
code.

```
src/data/
├── site.json              publisher, url, email + shared legal sections
├── cv/
│   ├── cv_full.json       one file per version of the CV
│   └── cv_no_freelancer.json
└── apps/
    └── baro-ease.json     one file per app
cv/
├── template/main.tex      CV layout (see cv/README.md)
└── assets/avt.png         CV photo
```

Every URL is defined in `src/lib/routes.ts`; use `routes.*` rather than writing
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
