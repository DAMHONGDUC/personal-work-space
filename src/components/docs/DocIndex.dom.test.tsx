/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DocIndex } from "./DocIndex";
import type { Lang, Doc } from "@/lib/docs/doc-model";

function guide(lang: Lang): Doc[] {
  const vi = lang === "vi";

  return [
    {
      slug: "ssh-git",
      title: vi ? "Cài SSH cho git" : "Set up SSH for git",
      tagline: vi ? "Key, agent và config." : "Keys, agent and config.",
      icon: "🔑",
      topic: "tooling",
      tags: ["Git"],
      readingTime: "6 min",
      effectiveDate: "2026-01-01",
      lastUpdated: "2026-01-01",
      intro: [vi ? "Một key mỗi máy." : "One key per machine."],
      sections: [
        {
          id: "overview",
          title: vi ? "Tổng quan" : "Overview",
          blocks: [{ type: "list", items: ["ssh-keygen"] }],
        },
        {
          id: "several-accounts",
          title: vi ? "Hai tài khoản" : "Two accounts",
          blocks: [{ type: "list", items: ["IdentitiesOnly yes"] }],
        },
      ],
    },
    {
      slug: "xcode-setup",
      title: vi ? "Dựng máy Mac cho iOS" : "Set up a Mac for iOS",
      tagline: vi ? "Từ máy trắng tới TestFlight." : "Blank machine to TestFlight.",
      icon: "🛠️",
      topic: "ios",
      tags: ["Xcode"],
      readingTime: "9 min",
      effectiveDate: "2026-01-01",
      lastUpdated: "2026-01-01",
      intro: [vi ? "Chừa 60 GB trống." : "Leave 60 GB free."],
      sections: [
        {
          id: "signing",
          title: vi ? "Ký ứng dụng" : "Signing",
          blocks: [{ type: "list", items: ["Provisioning profile"] }],
        },
      ],
    },
  ];
}

const versions: Record<Lang, Doc[]> = { en: guide("en"), vi: guide("vi") };

let container: HTMLDivElement;
let root: Root;

function render() {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<DocIndex versions={versions} />);
  });
  return container;
}

function type(text: string) {
  const input = container.querySelector<HTMLInputElement>('input[type="search"]');
  if (!input) throw new Error("no search box");

  act(() => {
    // What React listens for on a controlled input.
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function titles() {
  return [...container.querySelectorAll("h3")].map((heading) => heading.textContent);
}

function shelves() {
  return [...container.querySelectorAll("h2")].map((heading) => heading.firstChild?.textContent);
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("DocIndex", () => {
  it("lists every guide before anything is typed", () => {
    const page = render();

    // Shelved in topic order, not load order: iOS comes before tooling.
    expect(titles()).toEqual(["Set up a Mac for iOS", "Set up SSH for git"]);
    expect(page.textContent).toContain("2 guides");
  });

  it("shelves guides under their topic, and drops a shelf the search empties", () => {
    render();

    expect(shelves()).toEqual(["iOS & Swift", "Git & tooling"]);

    type("xcode");

    expect(shelves()).toEqual(["iOS & Swift"]);
  });

  it("filters the list, and says how many are left", () => {
    const page = render();

    type("xcode");

    expect(titles()).toEqual(["Set up a Mac for iOS"]);
    expect(page.textContent).toContain("1 of 2 guides");
  });

  it("lists only the section a word appears in", () => {
    const page = render();

    type("IdentitiesOnly");

    expect(titles()).toEqual(["Set up SSH for git"]);
    expect(page.textContent).toContain("Matching section");
    expect(page.textContent).toContain("Two accounts");
    expect(page.textContent).not.toContain("Overview");
  });

  it("says so when nothing matches, and quotes what was typed", () => {
    const page = render();

    type("kubernetes");

    expect(titles()).toEqual([]);
    expect(page.textContent).toContain("kubernetes");
  });

  it("searches the language on screen", () => {
    const page = render();

    type("tài khoản");
    expect(titles()).toEqual([]);

    const vietnamese = [...page.querySelectorAll("button")].find(
      (button) => button.textContent === "vi",
    );
    act(() => vietnamese!.click());

    expect(titles()).toEqual(["Cài SSH cho git"]);
  });
});
