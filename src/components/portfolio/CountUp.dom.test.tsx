/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CountUp } from "./CountUp";
import { MaskedWords } from "./MaskedWords";

let container: HTMLDivElement;
let root: Root;

function render(ui: React.ReactNode, reducedMotion = false) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reducedMotion }) as typeof window.matchMedia;
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(ui);
  });
  return container;
}

beforeEach(() => {
  vi.useFakeTimers();
  // Frames advance with the fake clock, 16ms apart.
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 16),
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("CountUp", () => {
  it("counts from zero up to the real value, suffix kept", () => {
    const page = render(<CountUp value="4+" delay={100} />);

    expect(page.textContent).toBe("0+");
    act(() => vi.advanceTimersByTime(2000));
    expect(page.textContent).toBe("4+");
  });

  it("just shows the value for a reader who asked for reduced motion", () => {
    expect(render(<CountUp value="7" />, true).textContent).toBe("7");
  });

  it("leaves a value that is not a number alone", () => {
    expect(render(<CountUp value="—" />).textContent).toBe("—");
  });
});

describe("MaskedWords", () => {
  it("keeps the sentence as plain text, word for word", () => {
    // Screen readers, search and copy-paste read the words, not the masks.
    expect(render(<MaskedWords text="Things I have built" />).textContent).toBe("Things I have built");
  });
});
