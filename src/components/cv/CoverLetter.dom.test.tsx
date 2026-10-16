/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CoverLetter } from "./CoverLetter";

let container: HTMLDivElement;
let root: Root;
let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("CoverLetter", () => {
  it("shows the letter and copies exactly what it shows", async () => {
    const text = "Dear Hiring Team,\n\n- Native: Kotlin\n\nBest regards,";
    act(() => {
      root = createRoot(container);
      root.render(<CoverLetter text={text} />);
    });

    const button = container.querySelector<HTMLButtonElement>('button[aria-label="Copy cover letter"]')!;
    await act(async () => button.click());

    expect(container.querySelector("p.whitespace-pre-line")!.textContent).toBe(text);
    expect(writeText).toHaveBeenCalledWith(text);
    expect(button.getAttribute("aria-label")).toBe("Copied");
  });
});
