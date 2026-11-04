/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useQueryChoice, useQueryParam, useQueryText } from "./useQueryParam";

let container: HTMLDivElement;
let root: Root;
/** What the probes last rendered, and the writers they were handed. */
let seen: {
  raw: string | null;
  text: string;
  choice: "a" | "b" | null;
  setRaw: (value: string | null) => void;
  setText: (value: string) => void;
  setChoice: (value: "a" | "b" | null) => void;
};

function Probe({ report }: { report: (value: typeof seen) => void }) {
  const [raw, setRaw] = useQueryParam("raw");
  const [text, setText] = useQueryText("q");
  const [choice, setChoice] = useQueryChoice("pick", ["a", "b"] as const);
  report({ raw, text, choice, setRaw, setText, setChoice });
  return null;
}

function render(address: string) {
  window.history.replaceState(null, "", address);
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<Probe report={(value) => (seen = value)} />);
  });
}

beforeEach(() => window.history.replaceState(null, "", "/"));

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("useQueryParam", () => {
  it("reads the parameters the page was opened with", () => {
    render("/page/?raw=1&q=auth&pick=b");

    expect(seen).toMatchObject({ raw: "1", text: "auth", choice: "b" });
  });

  it("reads an absent parameter as null, or as an empty text", () => {
    render("/page/");

    expect(seen).toMatchObject({ raw: null, text: "", choice: null });
  });

  it("writes into the address in place, without adding a history entry", () => {
    render("/page/?keep=yes");
    const entries = window.history.length;

    act(() => seen.setText("ma hoa"));

    expect(seen.text).toBe("ma hoa");
    expect(new URLSearchParams(window.location.search).get("q")).toBe("ma hoa");
    expect(new URLSearchParams(window.location.search).get("keep")).toBe("yes");
    expect(window.location.pathname).toBe("/page/");
    expect(window.history.length).toBe(entries);
  });

  it("removes the parameter when it is cleared", () => {
    render("/page/?q=auth&pick=a&raw=1");

    act(() => {
      seen.setText("");
      seen.setChoice(null);
      seen.setRaw(null);
    });

    expect(window.location.search).toBe("");
    expect(seen).toMatchObject({ raw: null, text: "", choice: null });
  });

  it("reads a value outside the options as no choice", () => {
    render("/page/?pick=zzz");

    expect(seen.choice).toBeNull();
  });

  it("follows the address when Back or Forward changes it", () => {
    render("/page/?q=one");

    act(() => {
      window.history.replaceState(null, "", "/page/?q=two");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(seen.text).toBe("two");
  });
});
