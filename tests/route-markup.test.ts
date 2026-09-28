import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appDir = path.join(process.cwd(), "src/app");

/** Every component file under src/app: pages, layouts, not-found and the rest. */
function routeFiles(dir: string = appDir): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return routeFiles(full);
    return entry.name.endsWith(".tsx") ? [full] : [];
  });
}

describe("route files", () => {
  it("compose components and never style markup themselves", () => {
    // A page says what is on it — <PageIntro>, <PageContainer> — and the
    // look lives in the component. A className or an inline style in a route
    // file is layout that no other page can reuse and no test can see.
    const styled = routeFiles()
      .filter((file) => /\b(className|style)=/.test(fs.readFileSync(file, "utf8")))
      .map((file) => path.relative(process.cwd(), file));

    expect(styled).toEqual([]);
  });
});
