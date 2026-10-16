/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CvVersion } from "@/lib/cv/cv-types";
import { CvTabs } from "./CvTabs";

let container: HTMLDivElement;
let root: Root;

/** A version with nothing built: no PDF and no page images, which the switcher allows. */
function version(slug: string, label: string): CvVersion {
  return { slug, label, data: { lastUpdated: "2026-10-15" }, pdf: null, pages: [] } as unknown as CvVersion;
}

/** Radix tabs and toggles act on a left-button press, not a click. */
function press(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
  });
}

function tab(name: string) {
  return [...container.querySelectorAll('[role="tab"]')].find((el) => el.textContent === name)!;
}

/** `active` or `inactive`: with forceMount, an inactive panel is hidden by its class, which jsdom does not apply. */
function panelState(name: string) {
  return document.getElementById(tab(name).getAttribute("aria-controls")!)!.dataset.state;
}

function panelText(name: string) {
  return document.getElementById(tab(name).getAttribute("aria-controls")!)!.textContent;
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(
      <CvTabs versions={[version("cv_normal", "Normal"), version("cv_with_freelancer", "With freelancer")]} coverLetter="Dear Hiring Team," />,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("CvTabs", () => {
  it("opens on the CV and shows the letter in its own tab", () => {
    expect(tab("CV").getAttribute("aria-selected")).toBe("true");
    expect(panelState("Cover letter")).toBe("inactive");

    press(tab("Cover letter"));

    expect(panelState("Cover letter")).toBe("active");
    expect(panelText("Cover letter")).toContain("Dear Hiring Team,");
    expect(panelState("CV")).toBe("inactive");
  });

  it("keeps the chosen CV version across a visit to the letter", () => {
    const freelancer = [...container.querySelectorAll('[role="radio"]')].find((el) => el.textContent === "With freelancer")!;
    press(freelancer);
    expect(freelancer.getAttribute("aria-checked")).toBe("true");

    press(tab("Cover letter"));
    press(tab("CV"));

    expect(freelancer.isConnected).toBe(true);
    expect(freelancer.getAttribute("aria-checked")).toBe("true");
  });
});
