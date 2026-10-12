/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PolicyNav } from "./PolicyNav";

let container: HTMLDivElement;
let root: Root;
let scrollIntoView: ReturnType<typeof vi.fn>;

function render() {
  container = document.createElement("div");
  // The sections the links point at, as the page would hold them.
  container.innerHTML = '<section id="1-product"></section><section id="2-market"></section>';
  document.body.appendChild(container);

  const nav = document.createElement("div");
  container.appendChild(nav);
  act(() => {
    root = createRoot(nav);
    root.render(
      <PolicyNav
        items={[
          { id: "1-product", title: "1. Product" },
          { id: "2-market", title: "2. Market" },
        ]}
        accent="#0ea5e9"
        numbered={false}
      />,
    );
  });
}

function link(title: string) {
  const found = [...container.querySelectorAll("a")].find((anchor) => anchor.textContent === title);
  if (!found) throw new Error(`no link ${title}`);
  return found;
}

beforeEach(() => {
  vi.useFakeTimers();
  scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView as unknown as Element["scrollIntoView"];
  window.history.replaceState(null, "", "/docs/sitelog-specs-00-overview/");
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe("PolicyNav", () => {
  it("scrolls to the section that was clicked and puts it in the address", () => {
    render();

    act(() => link("2. Market").click());

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById("2-market"));
    expect(window.location.hash).toBe("#2-market");
  });

  it("jumps the rest of the way when the scroll settles short of the section", () => {
    render();
    // The section is still far down the page once scrolling has stopped: the
    // smooth scroll never ran, or the page grew under it.
    document.getElementById("1-product")!.getBoundingClientRect = () => ({ top: 900 }) as DOMRect;
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 5000 });

    act(() => link("1. Product").click());
    act(() => vi.advanceTimersByTime(500));

    expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: "instant", block: "start" });
  });

  it("leaves the page alone once the section is in place", () => {
    render();
    document.getElementById("2-market")!.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;

    act(() => link("2. Market").click());
    act(() => vi.advanceTimersByTime(500));

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("stops checking when the reader scrolls themselves", () => {
    render();
    document.getElementById("1-product")!.getBoundingClientRect = () => ({ top: 900 }) as DOMRect;
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 5000 });

    act(() => link("1. Product").click());
    act(() => {
      window.dispatchEvent(new Event("wheel"));
      vi.advanceTimersByTime(500);
    });

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("marks the clicked section as selected at once", () => {
    render();

    act(() => link("2. Market").click());

    expect(link("2. Market").getAttribute("aria-current")).toBe("location");
    expect(link("1. Product").getAttribute("aria-current")).toBeNull();
  });

  it("leaves a modified click to the browser", () => {
    render();

    act(() => {
      link("2. Market").dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true }));
    });

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
