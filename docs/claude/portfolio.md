# Portfolio rules

Rendered at `/personal/portfolio` by `src/components/portfolio/`.

## Data

| Rule | Reason | Example |
|---|---|---|
| Every fact comes from the default CV through `buildPortfolio` in [portfolio.ts](../../src/lib/portfolio/portfolio.ts) | Portfolio and CV cannot drift; to change what it says, edit the CV | Name, role, education, skills, jobs, projects, email, GitHub, LinkedIn, school and company websites |
| `src/data/portfolio.json` holds presentation only | A test fails if a fact is added | Greeting, status, photo, learning, `skillIcons`, `projectIcons`, time zone, contact line |
| Two introductions in one file: the CV prints `aboutMe`, the portfolio shows `portfolioAbout` | — | `portfolioAbout`: two short paragraphs — experience, team sought, way of working; no companies or results |
| Years are written `{{years}}` and computed at build | Never type a number of years | Hero figures come from `portfolioStats` |
| Two photos, one each | Never point one at the other | CV: `header.photo` in `public/personal/`; portfolio: `photo` in `portfolio.json` |

## Icons

| Rule | Reason | Example |
|---|---|---|
| Profile links and skill areas use real brand marks from `react-icons` | No lookalike glyphs | `FaGithub`, `SiFlutter` |
| A skill area's mark is a tool that area lists, in its brand colour from `AppColors.BRAND` | Test-checked against the CV; monochrome marks take the text colour | Backend → Firebase yellow; Web → Next.js |
| A project's icon comes from `projectIcons`, keyed by the CV project name | Reuse `/app-icons/…` first, else `public/personal/projects/` | Missing → dashed placeholder with initials, never a stock icon |
| Websites open from `WebsiteButton` | A bordered pill: globe, address, arrow out | — |

## Page behaviour

| Rule | Reason |
|---|---|
| Standalone page (`useStandalonePage`): its sections from `PORTFOLIO_SECTIONS` replace Home in the header; the name scrolls to top | Nothing in its header leads out of the portfolio |
| One accent, `--pf-a` from `PortfolioTheme` | It marks a rule, a dot, a full stop |
| One gap, `AppSpacings.PORTFOLIO_GAP`; sections carry no padding | Hero → About equals section → section |

## Motion

| Element | Motion | Where |
|---|---|---|
| Hero | Plays in once on load | `pf-enter` / `pf-pop`, timed by `enterStyle` |
| Sections | Heading rises from a blur, rule draws, cards rise by `order`, chips pop, timeline line draws | `RevealSection` (IntersectionObserver) |
| Cards | Lift on hover | `transform`, because the rise-in holds `translate` |
| About intro | Types itself out over the real text | `Typewriter` |
| Current job dot, greeting | Pulse; wave twice | — |

| Motion rule | Detail |
|---|---|
| Who moves | CSS animates; JavaScript only decides when |
| No script, or `prefers-reduced-motion: reduce` | Nothing is hidden; everything is simply visible |

## Never

| Don't | Instead |
|---|---|
| Gradients on text, buttons or borders | Plain colours and the one accent |
| Anything spinning or drifting | The motion listed above |
| Number the sections | See [ui.md](ui.md) |
