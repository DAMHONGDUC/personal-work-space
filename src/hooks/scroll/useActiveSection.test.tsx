/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useActiveSection } from "./useActiveSection";

const IDS = ["overview", "at-a-glance", "data-collected", "contact"];

let container: HTMLDivElement;
let root: Root;
/** Viewport-relative top for each section, driven by the tests. */
let tops: Record<string, number>;

function createSections() {
  for (const id of IDS) {
    const section = document.createElement("section");
    section.id = id;
    section.getBoundingClientRect = () =>
      ({ top: tops[id] }) as DOMRect;
    document.body.appendChild(section);
  }
}

function render() {
  function Probe() {
    const active = useActiveSection(IDS);
    return <span data-testid="active">{active}</span>;
  }

  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<Probe />);
  });

  return () => container.querySelector('[data-testid="active"]')?.textContent;
}

/** Moves the sections and fires a scroll, flushing the rAF the hook schedules. */
function scrollTo(next: Record<string, number>, scrollY = 500) {
  act(() => {
    tops = { ...tops, ...next };
    Object.defineProperty(window, "scrollY", { value: scrollY, configurable: true });
    window.dispatchEvent(new Event("scroll"));
  });
}

beforeEach(() => {
  // rAF must run synchronously so assertions see the measured value.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: 10000,
    configurable: true,
  });

  // Everything starts below the header line except the first section.
  tops = {
    overview: 100,
    "at-a-glance": 900,
    "data-collected": 1800,
    contact: 2600,
  };
  createSections();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.querySelectorAll("section").forEach((el) => el.remove());
  vi.unstubAllGlobals();
});

describe("useActiveSection", () => {
  it("starts on the first section", () => {
    expect(render()()).toBe("overview");
  });

  it("advances as later headings pass under the header", () => {
    const read = render();

    scrollTo({ overview: -700, "at-a-glance": 100, "data-collected": 1000 });

    expect(read()).toBe("at-a-glance");
  });

  it("keeps the highlight while scrolling inside one tall section", () => {
    // The bug this replaced: an observer reports nothing here, so the
    // highlight used to freeze on the previous section.
    const read = render();

    scrollTo({ overview: -700, "at-a-glance": 100, "data-collected": 1000 });
    expect(read()).toBe("at-a-glance");

    scrollTo({ overview: -1200, "at-a-glance": -400, "data-collected": 500 });

    expect(read()).toBe("at-a-glance");
  });

  it("updates when an anchor click jumps straight to a section", () => {
    const read = render();

    // A jump moves every section at once, with the target under the header.
    act(() => {
      tops = {
        overview: -2400,
        "at-a-glance": -1600,
        "data-collected": 96,
        contact: 900,
      };
      Object.defineProperty(window, "scrollY", { value: 2400, configurable: true });
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(read()).toBe("data-collected");
  });

  it("picks the section nearest the header when several are above it", () => {
    const read = render();

    scrollTo({ overview: -2000, "at-a-glance": -900, "data-collected": 20 });

    expect(read()).toBe("data-collected");
  });

  it("does not advance to a heading still below the line", () => {
    const read = render();

    scrollTo({ overview: 50, "at-a-glance": 121 });

    expect(read()).toBe("overview");
  });

  it("highlights the last section once the page is scrolled to the bottom", () => {
    // Short trailing sections may never reach the line on their own.
    const read = render();

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 9200, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(read()).toBe("contact");
  });

  it("stops listening once unmounted", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    render();

    act(() => root.unmount());

    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
    remove.mockRestore();

    // Re-render so the shared afterEach unmount has a root to work with.
    render();
  });
});
