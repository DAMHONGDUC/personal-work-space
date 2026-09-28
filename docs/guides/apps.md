# Adding an app

| Step | Detail |
|---|---|
| Create `src/data/apps/<slug>.json` | The filename is the URL: `focus-timer.json` → `/apps/focus-timer/privacy_policy/` |
| Start from an existing app | `cp src/data/apps/baro-ease.json src/data/apps/focus-timer.json` |
| Icon image (optional) | `public/app-icons/<slug>.png`, referenced as `"/app-icons/<slug>.png"` |
| Check | `npm test` |

## Fields

| Field | Required | Notes |
|---|---|---|
| `name`, `tagline`, `icon`, `accent`, `platforms` | Yes | `icon`: emoji or `/app-icons/…` path |
| `effectiveDate`, `lastUpdated` | Yes | ISO dates |
| `summary`, `notCollected` | Yes | String lists |
| `collects`, `permissions`, `thirdParties` | Yes (may be `[]`) | An empty array hides its section and contents entry |
| `contactEmail`, `storeLinks`, `overview`, `sections` | No | — |

## Behaviour

| Input | Result |
|---|---|
| `linked: true` in `collects` | Data tied to a person (App Store wording); amber badge |
| `collects: []` | "Does not collect any data" note instead of a table |
| `{{app}}`, `{{publisher}}`, `{{email}}` in `overview` / `sections` | Substituted |
| A `sections` entry reusing an id from `site.json` (e.g. `security`) | Replaces that shared section for this app |
| A `sections` entry with a new id | Appended |

Example: [src/data/apps/baro-ease.json](../../src/data/apps/baro-ease.json).
