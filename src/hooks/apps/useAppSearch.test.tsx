/** @vitest-environment jsdom */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import type { DirectoryEntry } from "@/components/directory/AppCard";
import { APPS_QUERY } from "@/lib/routes/routes";
import { useAppSearch } from "./useAppSearch";

let container: HTMLDivElement;
let root: Root;
let seen: ReturnType<typeof useAppSearch>;

function entry(slug: string, name: string): DirectoryEntry {
  return { slug, name, tagline: "", icon: "⏳", accent: "#000000", platforms: [], updated: "2026-01-01" };
}

const entries = [entry("focus-timer", "Focus Timer"), entry("baro-ease", "BaroEase")];

function Probe({ report }: { report: (value: typeof seen) => void }) {
  report(useAppSearch(entries));
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

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("useAppSearch", () => {
  it("opens on the search in the address", () => {
    render(`/apps/?${APPS_QUERY.search}=baro`);

    expect(seen.query).toBe("baro");
    expect(seen.results.map((result) => result.slug)).toEqual(["baro-ease"]);
  });

  it("writes the search into the address, and clears it again", () => {
    render("/apps/");

    act(() => seen.setQuery("focus"));
    expect(new URLSearchParams(window.location.search).get(APPS_QUERY.search)).toBe("focus");
    expect(seen.results.map((result) => result.slug)).toEqual(["focus-timer"]);

    act(() => seen.setQuery(""));
    expect(window.location.search).toBe("");
    expect(seen.results).toHaveLength(2);
  });
});
