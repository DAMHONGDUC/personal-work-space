/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { SiteHeader } from "./SiteHeader";

let container: HTMLDivElement;
let root: Root;

function render() {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<SiteHeader publisher="Acme" />);
  });
  const header = container.querySelector("header");
  if (!header) throw new Error("header did not render");
  return header;
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("SiteHeader", () => {
  it("carries the CSS hook that paints its background", () => {
    // .site-header is solid by default and only goes transparent at the very
    // top via a scroll-driven animation, so the bar can never be stuck
    // see-through.
    expect(render().className).toContain("site-header");
  });

  it("never sets a background utility that could override the CSS", () => {
    const header = render();

    expect(header.className).not.toContain("bg-transparent");
    expect(header.className).not.toContain("backdrop-blur");
  });

  it("does not animate its colours with a transition", () => {
    // A transition leaves the bar stuck at its starting colour whenever the
    // document is hidden or animations are paused.
    const header = render();

    expect(header.className).not.toContain("transition-colors");
    expect(header.className).not.toContain("transition-[background-color");
  });

  it("stays pinned to the top on scroll", () => {
    const header = render();

    expect(header.className).toContain("sticky");
    expect(header.className).toContain("top-0");
  });

  it("renders the publisher name and a Home link, and no other navigation", () => {
    const header = render();
    const navLinks = [...header.querySelectorAll("nav a")];

    expect(header.textContent).toContain("Acme");
    expect(navLinks.map((link) => link.textContent)).toEqual(["Home"]);
    expect(navLinks[0].getAttribute("href")).toBe("/");
  });
});
