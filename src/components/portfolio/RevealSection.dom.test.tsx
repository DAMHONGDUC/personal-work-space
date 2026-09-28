/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RevealSection } from "./RevealSection";

let container: HTMLDivElement;
let root: Root;
let trigger: (isIntersecting: boolean) => void;

class FakeObserver {
  constructor(callback: IntersectionObserverCallback) {
    trigger = (isIntersecting) =>
      callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  observe() {}
  disconnect() {}
}

function render(top: number, reducedMotion = false) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reducedMotion }) as typeof window.matchMedia;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top } as DOMRect);

  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<RevealSection id="skills">content</RevealSection>);
  });

  return container.querySelector("section")!;
}

beforeEach(() => {
  window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
  window.innerHeight = 800;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("RevealSection", () => {
  it("hides a section below the fold, then shows it when it scrolls in", () => {
    const section = render(1200);

    expect(section.dataset.reveal).toBe("hidden");

    act(() => trigger(false));
    expect(section.dataset.reveal).toBe("hidden");

    act(() => trigger(true));
    expect(section.dataset.reveal).toBe("shown");
  });

  it("plays a section that is already on screen immediately", () => {
    expect(render(300).dataset.reveal).toBe("shown");
  });

  it("does nothing for a reader who asked for reduced motion", () => {
    expect(render(1200, true).dataset.reveal).toBeUndefined();
  });
});
