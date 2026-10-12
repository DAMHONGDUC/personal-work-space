/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeSample } from "./CodeSample";

let container: HTMLDivElement;
let root: Root;
let writeText: ReturnType<typeof vi.fn>;

function render(node: React.ReactNode) {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(node);
  });
  return container;
}

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("CodeSample", () => {
  it("names the language and copies the code with real newlines", async () => {
    const page = render(
      <CodeSample block={{ type: "code", language: "bash", caption: "Install", code: ["npm install", "npm run dev"] }} />,
    );

    expect(page.textContent).toContain("bash");
    await act(async () => page.querySelector<HTMLButtonElement>("button")!.click());

    expect(writeText).toHaveBeenCalledWith("npm install\nnpm run dev");
    expect(page.querySelector("button")?.textContent).toBe("Copied");
  });

  it("draws the colours the page build added", () => {
    const page = render(
      <CodeSample
        block={{
          type: "code",
          language: "swift",
          code: ["let x = 1"],
          highlighted: '<pre class="shiki"><code><span style="--shiki-light:#D73A49">let</span> x = 1</code></pre>',
        }}
      />,
    );

    expect(page.querySelector("pre.shiki span")?.textContent).toBe("let");
  });
});
