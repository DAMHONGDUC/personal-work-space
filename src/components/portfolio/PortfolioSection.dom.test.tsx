/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { PortfolioSection } from "./PortfolioSection";
import { PortfolioSections } from "./PortfolioSections";
import { AppSpacings } from "@/lib/design/app-spacings";

function render(ui: React.ReactNode) {
  const container = document.createElement("div");
  act(() => createRoot(container).render(ui));
  return container;
}

describe("portfolio spacing", () => {
  it("gives a section no padding of its own", () => {
    // Every gap on the page is PORTFOLIO_GAP; padding on a section would add
    // a second value between the hero and About or between two sections.
    const section = render(
      <PortfolioSection id="about" eyebrow="About me" title="About">
        body
      </PortfolioSection>,
    ).querySelector("section")!;

    expect(section.className).not.toMatch(/(^|\s)p[xytblr]?-\S+/);
  });

  it("stacks the sections with the one portfolio gap", () => {
    const stack = render(<PortfolioSections>x</PortfolioSections>).firstElementChild!;

    expect(stack.className).toContain(AppSpacings.PORTFOLIO_GAP);
  });
});
