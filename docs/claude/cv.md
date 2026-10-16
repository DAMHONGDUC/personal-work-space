# CV rules

## Data — `src/data/cv/<slug>.json`

| Rule | Reason | Example |
|---|---|---|
| One file per CV version; the filename is its slug | Every version is built and offered as a tag on the CV page under its `label` | `cv_normal.json` |
| What versions share lives once in `src/data/cv/shared/` (`header`, `about-me`, `education`, `skills`, `projects`, `experience`); a version holds only `label`, `lastUpdated` and its job ids | One fact, one place; `mergeCv` in [cv-merge.mts](../../src/lib/cv/cv-merge.mts) builds the full CV for both the site and the LaTeX | `"experience": ["oivan", "flynk"]` |
| A job's project prints as its `title` with its `meta` beside it (team and client, `·`-separated), then its `stack` (framework and architecture) as the first bullet, then its bullets; the same in every version. A title that names its stack (`Flutter Apps`) has no `stack` | The project and who it was for read in one line; the stack is a point of its own, never said twice; test-enforced | **Real Estate Product** · 17 mobile devs (10 VN, 7 Egypt & Thailand) · Direct client: Saudi Arabia, then – Flutter, Modular Feature-Based Clean Architecture, Melos Monorepo, BLoC, Scrum, Kanban |
| A version with `"brief": true` prints the brief wording beside the full one in `shared/` (`about-me-brief.json`, a group's `briefBullets`, a note's `brief`), each falling back to the full wording, and smaller gaps in Experience | The same facts, read at a glance; written next to the full wording so both are edited together | Every version is brief: `cv_normal.json`, `cv_with_freelancer.json`; the portfolio prints the full wording |
| A brief CV says everything the full wording says, only shorter: the same About me sentences, skills, jobs, projects, notes and one bullet per full bullet (`briefBullets` 1:1 with `bullets`), each bullet ≤ 100 characters (one PDF line) | Brief is a shorter wording, never fewer points; test-enforced against the version's own jobs merged in full | `briefBullets[0]` is `bullets[0]` cut to one line |
| A new file is also named in [cv.ts](../../src/lib/cv/cv.ts) | Static export needs a literal import; a test compares the list with the folder | — |
| `ResourceConstant.CV_DATA_FILE` only picks the landing version and the legacy `/cv.pdf` | A visitor reads the CV without the freelance work first | `cv_normal.json` |
| Every text field is plain text | The renderer escapes LaTeX and converts typography | `Backend & Integration`, `get_it`, `2019 – 2023` |
| The word `Freelancer` in an `arrangement` prints bold and blue | Freelance work is found at a glance; `\cvHighlight` in the template | **Freelancer**, part-time, remote (Japan) |
| Every location ends with `, Viet Nam` | One spelling; test-enforced | A remote client's country goes in `arrangement`: `Freelancer, part-time, remote (Japan)` |
| A job's `period` is `Mon YYYY – Mon YYYY` or `Mon YYYY – now`, never with its length | The build appends the length, counted to the build month, in [cv-period.mts](../../src/lib/cv/cv-period.mts); test-enforced | `Oct 2024 – now` prints `Oct 2024 – now (2 yrs 1 mo)` |
| Optional `url` on education and experience | Links the name in the PDF and on the portfolio | `"url": "https://oivan.com/"` |
| `aboutMe` stays general: no figures, no results | The figures belong to the jobs, where they have context | `I have experience in optimising app size…`, never `200MB to 90MB` |
| Every `aboutMe` sentence has a subject and a verb | A CV reads as written by a person, not as a list of fragments | `I am based in Ho Chi Minh City.`, never `Based in Ho Chi Minh City.` |
| Every experience group has `domains`; `mergeCv` builds the `Domains` skill line from the version's jobs only; a personal project has no `domains` | A version without a job does not claim its industry, and a side project claims none; never write `Domains` in `shared/skills.json` (it throws) | `"domains": ["Real estate"]` |
| Every project has a `https://github.com/…` link, printed under it in every version, brief included | A personal project is shown by its code, and a printed CV keeps the address; test-enforced | `github.com/DAMHONGDUC/sms-hook` |
| A project's `description` is `Framework (libraries) – what it does.`, on one PDF line | Read at a glance; ≤ 110 characters with the name, test-enforced | `Flutter (Riverpod, Firebase) – Resale business app: sourcing, inventory, listings, profit.` |
| `aboutMe` writes the years as `{{years}}` | `mergeCv` counts them from the version's oldest job at build, in half-year steps rounded down, with months counted as a job's length is (`yearsSince`); the portfolio shows the same lines, see [portfolio.md](portfolio.md) | `I am a mobile developer with {{years}}+ years…` prints `4+`, then `4.5+` from the 54th month |
| The portfolio has its own file in the version format, `src/data/cv/portfolio/portfolio.json` | A subfolder, so it is never offered as a CV | — |
| One cover letter for every application, `src/data/cv/cover-letter/cover-letter.json`, shown in its own tab beside the CV (`CvTabs`: CV, Cover letter; both panels stay mounted so the chosen version survives) with a copy button (`CoverLetter`); the role is a `[bracket]` the reader replaces | Pasted as plain text into any form; `buildCoverLetter` counts `{{years}}` and signs it (name, email, phone) from the default CV; its `Domains` must be the CV's, test-enforced | `- Domains: real estate, aviation, …` |

## Build and page

| Rule | Reason |
|---|---|
| Every CV, full or brief, is at most 2 pages | The limit a reader gives a CV; `MAX_PAGES` in [build-cv-images.mts](../../scripts/build-cv-images.mts) fails CI on a longer PDF (a warning under `npm run dev`) |
| The site imports every CV statically and the LaTeX generator reads them from disk (`cv-disk.mts`); both go through `mergeCv`, and a test asserts they resolve the same | Page and PDF must not drift |
| Every version downloads under the same filename (name + build date) | The version is the sender's business |
| Font sizes live only in the `\cv*` macros of `cv/template/main.tex` | The renderer marks up meaning; a test fails on `\fontsize` in generated LaTeX |
| The CV page is public: no password, no gate | A static export could only curtain files that stay reachable by URL |
| Only CI typesets the PDF | Locally `npm run cv:pdf` needs LaTeX and poppler; without them the page shows a message |

## Never

| Don't | Instead |
|---|---|
| Edit `cv/build/` | It is generated by `npm run cv:tex` |
| Edit `cv/template/main.tex` to change wording | Edit the JSON |
| Write `\&`, `get\_it`, `--` | Write plain text; a backslash prints literally |
| Put the version label in the download filename | Keep one filename |

Guide: [docs/guides/cv.md](../guides/cv.md).
