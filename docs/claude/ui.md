# UI rules

## Route files compose, components style

| Rule | Reason | Example |
|---|---|---|
| No `className` and no `style` under `src/app` | A page says what is on it; style lives in components | `<PageContainer>`, `<PortfolioHero portfolio={portfolio} />` |
| Page-level layout comes from `src/components/layout/` | One source per layout | `PageContainer`, `PageIntro`, `CompactPageHeader`, `CardGrid`, `WithSidebar`, `MessageBlock`, `SiteDocument`, `SiteShell` |
| Add a named spacing to `PageContainer`, never a one-off class | — | `spacing="afterHero"` |

Enforced by [route-markup.test.ts](../../tests/route-markup.test.ts).

## Design tokens — `src/lib/design/`

| Token class | Holds | Rule |
|---|---|---|
| `AppColors` | Section accents, note tones, `BRAND` colours, `tint(color, percent)` | Every colour the code picks; the theme palette stays in `globals.css`; an app's accent stays in its JSON |
| `AppTextStyles` | Type scale by role: `PAGE_TITLE`, `LEAD`, `BODY`, `CAPTION`, `EYEBROW` … | Combine with layout classes: `` `${AppTextStyles.CAPTION} mt-6` ``; never restate a role |
| `AppSpacings` | Page gaps | See below |

Enforced by [design-tokens.test.ts](../../tests/design-tokens.test.ts): no hex colour, no hand-written `color-mix`, no restated text role outside `src/lib/design` (shadcn `components/ui` exempt).

## Page gaps — `AppSpacings`

| Token | Where |
|---|---|
| `PAGE_TOP` | First thing under the sticky header: `PageContainer`, every hero, `LegacyRedirect` |
| `PAGE_BOTTOM` | Before the footer |
| `AFTER_HERO` | Between a hero and the page body |
| `HERO_BOTTOM` | Inside a hero's foot |
| `PORTFOLIO_GAP` | The portfolio's only gap: hero → body (`PortfolioTheme`) and section → section (`PortfolioSections`); sections carry no padding |

Never write a page-level `pt-*`/`pb-*` by hand; change the constant.

## shadcn/ui

| Rule | Reason | Example |
|---|---|---|
| Take anything the registry ships from the registry | No hand-rolled substitutes, no second component library | `npx shadcn@latest add <component>` |
| Components live in `src/components/ui` (Radix, style `radix-nova`) and are edited in place | They are ours once generated | — |
| One palette: shadcn names alias the site's colours in `globals.css` | `--muted` means muted **text** here, a surface in shadcn | Never run `shadcn init` over the file |
| Dark mode: `@custom-variant dark (@media (prefers-color-scheme: dark))` | Correct first paint of a static export | No `.dark` class, no toggle |
| shadcn for buttons, badges, inputs, tables, alerts, the diagram dialog | Heroes, cards, diagrams, table of contents are hand-written |
| Code blocks: one look everywhere — bar (language + `CopyButton`), Shiki colours from `--shiki-light` / `--shiki-dark` chosen by colour scheme | Styles in globals.css (`.code-block`, `.md-code`, `.shiki`); copying goes through `copyText`, which falls back to select-and-copy | — |

## Section numbers

| Page | Numbered | Rule |
|---|---|---|
| Guides, privacy policies | Yes: `1.`, `2.` … | The number is a prop on `Section`, derived from the same list as the table of contents — never a CSS counter |
| Portfolio | No | An introduction; sections from `PORTFOLIO_SECTIONS`, which also builds the header nav |
| CV | Never | Jobs too: newest first, unnumbered |

Nesting reads by a small step in, never a deep one: a section's body sits `pl-3`/`sm:pl-4` in from its heading (`Section`), a nested Markdown heading's content `0.75rem` further (`.md-body dd > dl > dd`), and a series group's pages `ml-3` under the group's name (`SeriesContents`).

A guide's contents panel is pinned on the **left** on wide screens (`SidebarToc`, 18rem, in `DocArticle`): the series' pages first (`SeriesContents variant="sidebar"`, capped at 40% of the window, scrolled to the current page), then "On this page". A click selects the item at once and scrolls there; a series link opens the page at its first section. The selected item, in both lists, is tinted (`AppColors.tint(accent, 12)`), in the accent, semibold, with a 2px bar. Below `lg` there is no panel: the series is a card above the intro and the sections a collapsed list. The privacy policies keep theirs on the right.

## Footer

| Rule | Reason |
|---|---|
| Copyright line only | The home page lists every section; the portfolio stands alone |
