/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollMemory } from "./useScrollMemory";

let container: HTMLDivElement;
let root: Root;
let scrolls: number[];

function Probe({ pathname }: { pathname: string }) {
  useScrollMemory(pathname);
  return null;
}

function render(pathname: string) {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<Probe pathname={pathname} />);
  });
}

/** A navigation the router performed, with or without the user pressing Back. */
function navigate(pathname: string, { back = false } = {}) {
  act(() => {
    if (back) window.dispatchEvent(new PopStateEvent("popstate"));
    root.render(<Probe pathname={pathname} />);
  });
}

function scrollTo(offset: number) {
  act(() => {
    Object.defineProperty(window, "scrollY", { value: offset, configurable: true });
    window.dispatchEvent(new Event("scroll"));
  });
}

/** Height of the document the next page renders at. */
function setHeight(height: number) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: height,
    configurable: true,
  });
}

beforeEach(() => {
  window.sessionStorage.clear();
  scrolls = [];
  Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  setHeight(10000);
  // jsdom does not scroll, so the stub moves scrollY the way a browser would.
  vi.stubGlobal("scrollTo", (_x: number, y: number) => {
    scrolls.push(y);
    Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  window.location.hash = "";
});

describe("useScrollMemory", () => {
  it("puts the reader back where they were when they press Back", () => {
    render("/docs");
    scrollTo(1400);

    navigate("/docs/ssl-pinning");
    scrollTo(300);
    navigate("/docs", { back: true });

    expect(scrolls.at(-1)).toBe(1400);
  });

  it("leaves a forward navigation at the top", () => {
    render("/docs");
    scrollTo(1400);
    navigate("/docs/ssl-pinning");

    // Coming back to a path that has a remembered position, but by following a
    // link rather than going back: the router's own scroll to top stands.
    navigate("/docs");

    expect(scrolls).toEqual([]);
  });

  it("waits for the page to grow before settling", () => {
    render("/docs");
    scrollTo(2000);
    navigate("/docs/ssh-git");

    // The list renders short first, then fills in.
    setHeight(1000);
    let frame = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      if (++frame === 1) setHeight(10000);
      callback(0);
      return 1;
    });

    navigate("/docs", { back: true });

    expect(scrolls.at(-1)).toBe(2000);
    expect(scrolls.length).toBeGreaterThan(1);
  });

  it("holds the position against a scroll to top a frame later", () => {
    // What the router does around a back navigation is not ours to control, so
    // the restore keeps correcting for a few frames instead of landing once.
    render("/docs");
    scrollTo(1400);
    navigate("/docs/ssl-pinning");

    let frame = 0;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      if (++frame === 1) {
        Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
      }
      callback(0);
      return 1;
    });

    navigate("/docs", { back: true });

    expect(window.scrollY).toBe(1400);
  });

  it("does not fight an anchored url", () => {
    render("/docs");
    scrollTo(900);
    navigate("/docs/ssh-git");

    window.location.hash = "#several-accounts";
    navigate("/docs", { back: true });

    expect(scrolls).toEqual([]);
  });

  it("forgets a popstate that only changed the hash", () => {
    render("/docs");
    scrollTo(900);
    navigate("/docs/ssh-git");

    // Back within the guide, from one anchor to the previous one: same path, so
    // nothing is restored — and the flag must not survive into the next move.
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    navigate("/docs");

    expect(scrolls).toEqual([]);
  });

  it("remembers the position across a reload of the same tab", () => {
    render("/docs");
    scrollTo(1200);

    act(() => window.dispatchEvent(new PageTransitionEvent("pagehide")));

    expect(window.sessionStorage.getItem("scroll:/docs")).toBe("1200");
  });
});
