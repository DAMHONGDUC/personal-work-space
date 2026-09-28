/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Typewriter } from "./Typewriter";

let container: HTMLDivElement;
let root: Root;
let enter: () => void;

class FakeObserver {
  constructor(callback: IntersectionObserverCallback) {
    enter = () =>
      callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  observe() {}
  disconnect() {}
}

function render(reducedMotion = false) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reducedMotion }) as typeof window.matchMedia;
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<Typewriter paragraphs={["Hi there.", "Second line."]} />);
  });

  const typewriter = container.querySelector<HTMLElement>(".pf-typewriter")!;
  const typed = [...container.querySelectorAll<HTMLElement>("[data-typed]")];
  return { typewriter, typed };
}

beforeEach(() => {
  vi.useFakeTimers();
  window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Typewriter", () => {
  it("keeps the real text in the page for screen readers throughout", () => {
    const { typewriter } = render();

    expect(typewriter.querySelectorAll(".pf-typewriter-text")[0].textContent).toBe("Hi there.");
    expect(typewriter.querySelectorAll(".pf-typewriter-text")[1].textContent).toBe("Second line.");
  });

  it("waits for the text to scroll in, then types one paragraph after the other", () => {
    const { typewriter, typed } = render();

    expect(typewriter.dataset.typing).toBe("");
    expect(typed[0].textContent).toBe("");

    act(() => enter());
    act(() => vi.advanceTimersByTime(600));
    expect(typed[0].textContent?.length).toBeGreaterThan(0);
    expect(typed[1].textContent).toBe("");

    act(() => vi.advanceTimersByTime(200));
    expect(typed[0].textContent).toBe("Hi there.");

    act(() => vi.advanceTimersByTime(2000));
    expect(typewriter.dataset.typing).toBeUndefined();
    expect(typed.every((overlay) => overlay.textContent === "")).toBe(true);
  });

  it("does nothing for a reader who asked for reduced motion", () => {
    const { typewriter, typed } = render(true);

    expect(typewriter.dataset.typing).toBeUndefined();
    expect(typed[0].dataset.caret).toBeUndefined();
  });
});
