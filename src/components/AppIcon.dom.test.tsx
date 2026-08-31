/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { AppIcon } from "./AppIcon";

let container: HTMLDivElement;
let root: Root;

function render(icon: string) {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<AppIcon icon={icon} accent="#3D50DF" />);
  });
  return container;
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("AppIcon", () => {
  it("prints an emoji as text", () => {
    const box = render("📦");

    expect(box.querySelector("img")).toBeNull();
    expect(box.textContent).toBe("📦");
  });

  it("draws a rooted path as an image", () => {
    // Otherwise the path would be printed literally, which is what a plain
    // string field invites.
    const img = render("/app_icons/reseller-studio.png").querySelector("img");

    expect(img?.getAttribute("src")).toBe("/app_icons/reseller-studio.png");
  });

  it("clips the image to the rounded box", () => {
    // The file is square artwork of its own; without this it paints over the
    // corners the accent border draws.
    const span = render("/app_icons/reseller-studio.png").querySelector("span");

    expect(span?.className).toContain("overflow-hidden");
  });
});
