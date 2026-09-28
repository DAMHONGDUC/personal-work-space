# Effects library

Files live on a public Google Drive folder named in `src/data/effect-library.json`; nothing is hosted here.

## Sync

| Step | Detail |
|---|---|
| Run | `npm run effects:sync` |
| Writes | One JSON per top-level Drive folder in `src/data/effects/` |
| Kept across syncs | Each pack's `name`, `category`, `exclude` |
| New Drive folder | Arrives with an empty `category`; `npm test` fails until it is filed under a category from `effect-library.json` |
| Shortcuts | Followed to the real folder; if the owner deletes or unshares it, the files go |
| Skipped | `My uploads` |

## Uploads

The Upload button on `/effects` writes to `My uploads/<category>` and lists files in `effects-uploads.json` beside it; pages read it on open, so no sync or rebuild.

| Step | Where |
|---|---|
| 1. New project, enable **Google Drive API** | console.cloud.google.com → APIs & Services → Library |
| 2. OAuth consent screen: External, status Testing, add your account as test user | Only test users can upload |
| 3. OAuth client ID, Web application; origins `https://damhongduc.github.io`, `http://localhost:3000` | Credentials |
| 4. API key restricted to Drive API and referrers `https://damhongduc.github.io/*`, `http://localhost:3000/*` | Credentials |
| 5. Deployed site: Actions variables `GOOGLE_CLIENT_ID`, `GOOGLE_API_KEY` | GitHub → Settings → Secrets and variables → Actions → Variables |
| 6. Local: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_API_KEY` | `.env.local` |

Without the two values the Upload button is hidden and no uploads are read.
