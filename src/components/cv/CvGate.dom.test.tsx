/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CvGate } from "./CvGate";

let container: HTMLDivElement;
let root: Root;

function render() {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(
      <CvGate>
        <p>secret cv</p>
      </CvGate>,
    );
  });
}

async function submit(password: string) {
  const input = container.querySelector("input")!;
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;

  await act(async () => {
    setValue.call(input, password);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => {
    container.querySelector("form")!.requestSubmit();
    // The hash is computed asynchronously.
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

beforeEach(() => sessionStorage.clear());

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("CvGate", () => {
  it("hides the CV until a password is entered", () => {
    render();

    expect(container.textContent).not.toContain("secret cv");
    expect(container.querySelector('input[type="password"]')).not.toBeNull();
  });

  it("refuses a wrong password", async () => {
    render();
    await submit("12345678");

    expect(container.textContent).not.toContain("secret cv");
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("not right");
  });

  it("shows the CV for the right password and remembers it for the tab", async () => {
    render();
    await submit("06112001");

    expect(container.textContent).toContain("secret cv");
    expect(sessionStorage.getItem("cv-unlocked")).toBe("1");
  });

  it("stays open on a later visit in the same tab", () => {
    sessionStorage.setItem("cv-unlocked", "1");
    render();

    expect(container.textContent).toContain("secret cv");
  });
});
