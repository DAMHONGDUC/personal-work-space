/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { FlowDiagram } from "./FlowDiagram";
import type { FlowBlock } from "@/lib/docs/doc-model";

const block: FlowBlock = {
  type: "flow",
  caption: "Where the key goes.",
  stages: [
    {
      items: [
        {
          label: "Create the key",
          detail: "ssh-keygen writes two files",
          explain: [
            "The secret half never leaves the machine it was made on.",
            "The .pub half is the one you paste into GitHub.",
          ],
        },
      ],
    },
    {
      items: [
        {
          label: "ssh-agent",
          detail: "Holds the key unlocked in memory",
          explain: ["It forgets everything when the machine restarts."],
        },
      ],
    },
  ],
};

let container: HTMLDivElement;
let root: Root;

function render() {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<FlowDiagram block={block} accent="#0ea5e9" lang="vi" />);
  });
  return container;
}

function boxes() {
  return [...container.querySelectorAll("button")];
}

function open(label: string) {
  const box = boxes().find((candidate) => candidate.textContent?.startsWith(label));
  if (!box) throw new Error(`no ${label} box`);

  act(() => box.click());
}

function dialog() {
  return document.body.querySelector('[role="dialog"]');
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("FlowDiagram", () => {
  it("draws every box, with the short version on it", () => {
    const page = render();

    expect(boxes()).toHaveLength(2);
    expect(page.textContent).toContain("Create the key");
    expect(page.textContent).toContain("ssh-keygen writes two files");
    expect(page.textContent).toContain("Where the key goes.");
  });

  it("keeps the long version out of the diagram until it is asked for", () => {
    const page = render();

    expect(page.textContent).not.toContain("never leaves the machine");
    expect(dialog()).toBeNull();
  });

  it("opens the step behind the box that was clicked", () => {
    render();

    open("Create the key");

    expect(dialog()?.textContent).toContain("The secret half never leaves");
    expect(dialog()?.textContent).toContain("paste into GitHub");
    // The step's own detail leads the dialog, so it is clear which box opened.
    expect(dialog()?.textContent).toContain("ssh-keygen writes two files");
    expect(dialog()?.textContent).not.toContain("forgets everything");
  });

  it("swaps the contents when a different box is clicked", () => {
    render();

    open("Create the key");
    act(() => {
      document.body
        .querySelector<HTMLElement>('[role="dialog"] [data-slot="dialog-close"]')
        ?.click();
    });
    open("ssh-agent");

    expect(dialog()?.textContent).toContain("forgets everything");
  });

  it("states the language of its own text, being outside the article", () => {
    // The dialog is portalled to the end of the body, so it cannot inherit the
    // lang that `main` puts on the guide.
    render();

    open("ssh-agent");

    expect(dialog()?.closest("[lang]")?.getAttribute("lang")).toBe("vi");
  });
});
