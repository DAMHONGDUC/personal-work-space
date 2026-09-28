/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PORTFOLIO_SECTIONS } from "@/lib/portfolio/portfolio-model";
import { routes } from "@/lib/routes/routes";
import { SiteHeader } from "./SiteHeader";

// The header picks its links by path; each test says where it is.
const location = vi.hoisted(() => ({ path: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => location.path }));

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
  location.path = "/";
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

  it("pins the portfolio's sections in place of Home on the portfolio", () => {
    // Prerendered paths carry the trailing slash trailingSlash adds.
    location.path = `${routes.portfolio}/`;
    const header = render();
    const navLinks = [...header.querySelectorAll("nav a")];

    expect(navLinks.map((link) => link.textContent)).toEqual(
      PORTFOLIO_SECTIONS.map((section) => section.label),
    );
    expect(navLinks.map((link) => link.getAttribute("href"))).toEqual(
      PORTFOLIO_SECTIONS.map((section) => `#${section.id}`),
    );
  });

  it("sends the publisher's name home from an ordinary page", () => {
    const brand = render().querySelector("a:not(nav a)");

    expect(brand?.textContent).toContain("Acme");
    expect(brand?.getAttribute("href")).toBe(routes.home);
  });

  it("keeps the publisher's name on the portfolio, never linking home", () => {
    // The portfolio stands on its own: no link in its header leads out of it.
    location.path = `${routes.portfolio}/`;
    const header = render();
    const brand = header.querySelector("a:not(nav a)");

    expect(brand?.getAttribute("href")).toBe(routes.portfolio);
    expect([...header.querySelectorAll("a")].map((link) => link.getAttribute("href"))).not.toContain(
      routes.home,
    );
  });

  it("scrolls the portfolio back to its top when the name is clicked", () => {
    location.path = `${routes.portfolio}/`;
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as typeof window.scrollTo;

    const brand = render().querySelector<HTMLAnchorElement>("a:not(nav a)");
    act(() => brand?.click());

    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
  });
});
