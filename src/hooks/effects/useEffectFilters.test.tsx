/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { EFFECTS_QUERY } from "@/lib/routes/routes";
import { useEffectFilters } from "./useEffectFilters";

let container: HTMLDivElement;
let root: Root;
let seen: ReturnType<typeof useEffectFilters>;

function Probe({ report }: { report: (value: typeof seen) => void }) {
  report(useEffectFilters());
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

function param(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("useEffectFilters", () => {
  it("opens on the search and the kind in the address", () => {
    render(`/effects/sfx/?${EFFECTS_QUERY.search}=whoosh&${EFFECTS_QUERY.kind}=audio`);

    expect(seen.query).toBe("whoosh");
    expect(seen.kind).toBe("audio");
  });

  it("ignores a kind the library does not have", () => {
    render(`/effects/?${EFFECTS_QUERY.kind}=hologram`);

    expect(seen.kind).toBeNull();
  });

  it("writes both into the address, and clears them again", () => {
    render("/effects/");

    act(() => {
      seen.setQuery("burn");
      seen.setKind("video");
    });
    expect(param(EFFECTS_QUERY.search)).toBe("burn");
    expect(param(EFFECTS_QUERY.kind)).toBe("video");

    act(() => {
      seen.setQuery("");
      seen.setKind(null);
    });
    expect(window.location.search).toBe("");
  });
});
