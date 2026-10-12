/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DocArticle } from "./DocArticle";
import type { Lang, Doc, SeriesPage } from "@/lib/docs/doc-model";

function version(lang: Lang): Doc {
  const word = lang === "en" ? "English" : "Vietnamese";

  return {
    slug: "guide",
    title: `${word} title`,
    tagline: `${word} tagline`,
    icon: "🛠️",
    topic: "git-tools",
    tags: ["Xcode"],
    readingTime: `${word} 10`,
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01",
    intro: [`${word} intro`],
    sections: [
      {
        id: "signing",
        title: `${word} signing`,
        blocks: [{ type: "text", body: [`${word} body`] }],
      },
    ],
  };
}

const versions: Record<Lang, Doc> = { en: version("en"), vi: version("vi") };

let container: HTMLDivElement;
let root: Root;

function render(guide: Record<Lang, Doc> = versions, series?: SeriesPage[]) {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<DocArticle versions={guide} series={series} />);
  });
  return container;
}

function switchTo(label: string) {
  const button = [...container.querySelectorAll("button")].find(
    (candidate) => candidate.textContent === label,
  );
  if (!button) throw new Error(`no ${label} button`);

  act(() => button.click());
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("DocArticle", () => {
  it("starts in English, which is what the prerendered HTML contains", () => {
    expect(render().textContent).toContain("English body");
  });

  it("starts in the guide's own default language when it names one", () => {
    const vietnameseFirst: Record<Lang, Doc> = {
      en: { ...versions.en, defaultLang: "vi" },
      vi: { ...versions.vi, defaultLang: "vi" },
    };

    expect(render(vietnameseFirst).textContent).toContain("Vietnamese body");
  });

  it("lets a stored choice win over the guide's default", () => {
    window.localStorage.setItem("docs-language", "en");
    const vietnameseFirst: Record<Lang, Doc> = {
      en: { ...versions.en, defaultLang: "vi" },
      vi: { ...versions.vi, defaultLang: "vi" },
    };

    expect(render(vietnameseFirst).textContent).toContain("English body");
  });

  describe("remembering where the reader stopped", () => {
    function long(lang: Lang): Doc {
      return {
        ...version(lang),
        sections: ["setup", "signing", "release"].map((id) => ({
          id,
          title: `${lang === "en" ? "English" : "Vietnamese"} ${id}`,
          blocks: [{ type: "text" as const, body: [`${id} body`] }],
        })),
      };
    }
    const longer: Record<Lang, Doc> = { en: long("en"), vi: long("vi") };
    const store = (value: object) =>
      window.localStorage.setItem("docs-position:guide", JSON.stringify(value));
    const bar = () => document.body.querySelector('[role="status"]');

    it("offers to go back to the section the reader was in", () => {
      store({ section: "release", offset: 120, done: false });
      render(longer);

      expect(bar()?.textContent).toContain("English release");
    });

    it("goes back there when asked, and puts the offer away", () => {
      const scrollIntoView = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoView as unknown as Element["scrollIntoView"];
      store({ section: "release", offset: 120, done: false });
      const page = render(longer);

      const resume = [...bar()!.querySelectorAll("button")].find((button) => button.textContent === "Continue");
      act(() => resume!.click());

      expect(scrollIntoView.mock.contexts[0]).toBe(page.querySelector("#release"));
      expect(bar()).toBeNull();
    });

    it("puts the offer away when dismissed", () => {
      store({ section: "release", offset: 0, done: false });
      render(longer);

      act(() => bar()!.querySelector<HTMLButtonElement>('button[aria-label="Dismiss"]')!.click());

      expect(bar()).toBeNull();
    });

    it("offers nothing for the first section or a guide read to the end", () => {
      store({ section: "setup", offset: 400, done: false });
      render(longer);
      expect(bar()).toBeNull();
      act(() => root.unmount());
      container.remove();

      store({ section: "release", offset: 0, done: true });
      render(longer);
      expect(bar()).toBeNull();
    });

    it("saves where the reader is as they scroll", () => {
      vi.useFakeTimers();
      try {
        const page = render(longer);
        // A long page, not scrolled to its end.
        Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 5000 });
        // "signing" has passed under the header line, 300px ago; "release" has not.
        page.querySelector<HTMLElement>("#setup")!.getBoundingClientRect = () => ({ top: -900 }) as DOMRect;
        page.querySelector<HTMLElement>("#signing")!.getBoundingClientRect = () => ({ top: -180 }) as DOMRect;
        page.querySelector<HTMLElement>("#release")!.getBoundingClientRect = () => ({ top: 700 }) as DOMRect;

        act(() => {
          window.dispatchEvent(new Event("scroll"));
          vi.advanceTimersByTime(400);
        });

        expect(JSON.parse(window.localStorage.getItem("docs-position:guide")!)).toEqual({
          section: "signing",
          offset: 300,
          done: false,
        });
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("synced from Markdown", () => {
    const english: Doc = {
      ...versions.en,
      languages: ["en"],
      numbered: false,
      sections: [
        {
          id: "1-product",
          title: "1. Product",
          blocks: [
            {
              type: "html",
              html: '<h3 id="11-positioning">1.1 Positioning</h3><p>Offline <code>first</code></p>',
              text: "1.1 Positioning Offline first",
            },
          ],
        },
      ],
    };
    const synced: Record<Lang, Doc> = { en: english, vi: english };

    it("draws the rendered HTML, anchors included", () => {
      const page = render(synced);

      expect(page.querySelector('[id="11-positioning"]')?.textContent).toBe("1.1 Positioning");
      expect(page.querySelector(".md-body code")?.textContent).toBe("first");
    });

    it("offers no language switch, and reads in its one language", () => {
      window.localStorage.setItem("docs-language", "vi");
      const page = render(synced);

      expect(page.querySelector('[role="radiogroup"]')).toBeNull();
      expect(page.querySelector("main")?.getAttribute("lang")).toBe("en");
    });

    it("scrolls to a section when a link in the body points at one", () => {
      const scrollIntoView = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoView as unknown as Element["scrollIntoView"];
      const linked: Record<Lang, Doc> = {
        en: {
          ...english,
          sections: [
            ...english.sections,
            {
              id: "2-market",
              title: "2. Market",
              blocks: [{ type: "html", html: '<p>See <a href="#11-positioning">1.1</a>.</p>', text: "See 1.1." }],
            },
          ],
        },
        vi: english,
      };
      const page = render({ en: linked.en, vi: linked.en });

      act(() => page.querySelector<HTMLAnchorElement>('a[href="#11-positioning"]')!.click());

      expect(scrollIntoView.mock.contexts[0]).toBe(page.querySelector('[id="11-positioning"]'));
      expect(window.location.hash).toBe("#11-positioning");
    });

    it("keeps the titles' own numbers instead of adding its own", () => {
      const page = render(synced);

      expect(page.querySelector("h2")?.textContent).toBe("1. Product");
    });
  });

  describe("as one page of a series", () => {
    const series: SeriesPage[] = [
      { slug: "intro", part: 0, title: { en: "The path", vi: "Lộ trình" } },
      { slug: "guide", part: 1, title: { en: "English title", vi: "Vietnamese title" } },
      { slug: "last", part: 2, title: { en: "Last step", vi: "Bước cuối" } },
    ];

    it("lists every page and marks the one being read", () => {
      const page = render(versions, series);
      const current = page.querySelector('[data-variant="card"] [aria-current="page"]');

      expect(current?.textContent).toBe("English title");
      expect(current?.getAttribute("href")).toBe("/docs/guide");
      expect(page.textContent).toContain("Page 2 of 3");
    });

    it("lists the series in the pinned sidebar too, marking the same page", () => {
      const page = render(versions, series);
      const sidebar = page.querySelector('aside [data-variant="sidebar"]');

      expect(sidebar?.querySelector('[aria-current="page"]')?.textContent).toBe("English title");
      expect(sidebar?.textContent).toContain("2/3");
    });

    it("opens another page of the series at its first section", () => {
      const withSections: SeriesPage[] = series.map((entry) => ({ ...entry, firstSection: "overview" }));
      const page = render(versions, withSections);

      expect(page.querySelector('aside a[href^="/docs/last"]')?.getAttribute("href")).toBe("/docs/last#overview");
      expect(page.querySelector('a[rel="next"]')?.getAttribute("href")).toBe("/docs/last#overview");
    });

    it("links the previous and the next page", () => {
      const page = render(versions, series);

      expect(page.querySelector('a[rel="prev"]')?.getAttribute("href")).toBe("/docs/intro");
      expect(page.querySelector('a[rel="next"]')?.getAttribute("href")).toBe("/docs/last");
    });

    it("heads each group of pages with its name", () => {
      const grouped: SeriesPage[] = [
        series[0],
        { ...series[1], group: "Build guide" },
        { ...series[2], group: "Build guide" },
      ];
      const page = render(versions, grouped);
      const headings = [...page.querySelectorAll('[data-variant="card"] li[role="presentation"]')];

      expect(headings.map((heading) => heading.textContent)).toEqual(["Build guide"]);
      // The group's pages step in under its name; the overview above it does not.
      const items = [...page.querySelectorAll('[data-variant="card"] ol > li:not([role])')];
      expect(items.map((item) => item.className)).toEqual(["", "ml-3", "ml-3"]);
    });

    it("names the pages in the language on screen", () => {
      const page = render(versions, series);

      switchTo("vi");

      expect(page.textContent).toContain("Bước cuối");
      expect(page.textContent).toContain("Trang tiếp");
    });
  });

  it("swaps every string when the language is switched", () => {
    const page = render();

    switchTo("vi");

    expect(page.textContent).toContain("Vietnamese body");
    expect(page.textContent).toContain("Vietnamese title");
    expect(page.textContent).not.toContain("English body");
  });

  it("keeps the section anchors, so switching does not lose your place", () => {
    const page = render();
    const before = page.querySelector("section")?.id;

    switchTo("vi");

    expect(page.querySelector("section")?.id).toBe(before);
    expect(before).toBe("signing");
  });

  it("numbers the section and its contents entry the same way", () => {
    const page = render();

    expect(page.querySelector("h2")?.textContent).toBe("1.English signing");
    expect(page.querySelector("ol a")?.textContent).toBe("1English signing");
  });

  it("marks the body with the language it is written in", () => {
    const page = render();

    expect(page.querySelector("main")?.lang).toBe("en");

    switchTo("vi");

    expect(page.querySelector("main")?.lang).toBe("vi");
  });

  it("remembers the choice for the next guide and the next visit", () => {
    render();

    switchTo("vi");

    expect(window.localStorage.getItem("docs-language")).toBe("vi");
  });

  it("shows the reader which language is active", () => {
    const page = render();
    const checked = () =>
      [...page.querySelectorAll('[role="radio"]')]
        .filter((option) => option.getAttribute("aria-checked") === "true")
        .map((option) => option.textContent);

    expect(checked()).toEqual(["en"]);

    switchTo("vi");

    expect(checked()).toEqual(["vi"]);
  });

  it("exposes the switch as one radio group with a single tab stop", () => {
    // What the Radix toggle group buys over two buttons: the group is one stop
    // in the tab order and the arrow keys move between the languages.
    const group = render().querySelector('[role="radiogroup"]');

    expect(group?.getAttribute("aria-label")).toBe("Language");
    expect(group?.getAttribute("tabindex")).toBe("0");
    expect(
      [...group!.querySelectorAll('[role="radio"]')].map((option) =>
        option.getAttribute("tabindex"),
      ),
    ).toEqual(["-1", "-1"]);
  });
});
