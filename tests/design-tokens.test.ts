import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * Source files that must take colours and type from src/lib/design rather than
 * writing their own. shadcn's generated components are left out — they are
 * the registry's code, styled by the palette in globals.css — and so are the
 * token files themselves.
 */
function sources(dir = path.join(process.cwd(), "src")): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    const rel = path.relative(process.cwd(), full);

    if (entry.isDirectory()) {
      if (rel === path.join("src", "components", "ui") || rel === path.join("src", "lib", "design")) return [];
      return sources(full);
    }

    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const files = sources().map((file) => ({
  file: path.relative(process.cwd(), file),
  text: fs.readFileSync(file, "utf8"),
}));

/** Every role in AppTextStyles, as the set of classes it is made of. */
const roles = Object.entries(AppTextStyles).map(([name, classes]) => ({
  name,
  classes: (classes as string).split(" "),
}));

describe("design tokens", () => {
  it("names every colour in AppColors, never as a hex in a component", () => {
    const hex = files
      .filter(({ text }) => /["'`]#[0-9a-fA-F]{3,8}["'`]/.test(text))
      .map(({ file }) => file);

    expect(hex).toEqual([]);
  });

  it("tints through AppColors.tint, never a hand-written color-mix", () => {
    const mixed = files
      .filter(({ text }) => /color-mix\(in oklab, \$\{/.test(text))
      .map(({ file }) => file);

    expect(mixed).toEqual([]);
  });

  it("uses a AppTextStyles role instead of restating one", () => {
    // A class list holding every class of a role is that role written out by
    // hand — the drift AppTextStyles exists to stop.
    const restated: string[] = [];

    for (const { file, text } of files) {
      for (const [, list] of text.matchAll(/className="([^"]*)"/g)) {
        const classes = new Set(list.split(/\s+/));

        for (const role of roles) {
          if (role.classes.every((name) => classes.has(name))) {
            restated.push(`${file}: ${role.name} in "${list}"`);
          }
        }
      }
    }

    expect(restated).toEqual([]);
  });
});
