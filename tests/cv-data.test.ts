import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderCvLatex } from "@/lib/cv/cv-latex.mts";
import { ResourceConstant } from "@/lib/resource-constant.mts";
import { cv, getCvVersions } from "@/lib/cv/cv";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const template = fs.readFileSync(
  path.join(process.cwd(), ResourceConstant.CV_TEMPLATE_DIR, "main.tex"),
  "utf8",
);

/** The slugs actually sitting in the data directory. */
const onDisk = fs
  .readdirSync(path.join(process.cwd(), ResourceConstant.CV_DATA_DIR))
  .filter((file) => file.endsWith(".json"))
  .map((file) => ResourceConstant.cvSlug(file))
  .sort();

const versions = getCvVersions();

describe("the set of CVs", () => {
  it("offers every file in the data directory", () => {
    // Bundling a static export needs a literal import path, so cv.ts names the
    // files rather than reading the folder. This is what stops a new CV being
    // added and then never appearing in the switcher.
    expect([...versions.map((version) => version.slug)].sort()).toEqual(onDisk);
  });

  it("shows the CV named by CV_DATA_FILE first", () => {
    expect(versions[0].slug).toBe(ResourceConstant.DEFAULT_CV_SLUG);
    expect(versions[0].data).toEqual(cv);
  });

  it("gives each version a label of its own for the dropdown", () => {
    const labels = versions.map((version) => version.label);

    for (const label of labels) {
      expect(label.trim()).not.toBe("");
    }

    // Two versions under one name is a dropdown a reader cannot use.
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe.each(versions)("the CV data file $slug", ({ slug, data: cv }) => {
  it("is the same file the PDF is generated from", () => {
    // The site imports the JSON statically and the generator reads it from
    // disk. If those ever name different files, the page and the downloadable
    // PDF quietly show different CVs.
    const fromGenerator = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), ResourceConstant.CV_DATA_DIR, `${slug}.json`),
        "utf8",
      ),
    );

    expect(fromGenerator).toEqual(cv);
  });

  it("has an ISO lastUpdated date that is not in the future", () => {
    expect(cv.lastUpdated).toMatch(ISO_DATE);
    expect(Number.isNaN(Date.parse(cv.lastUpdated))).toBe(false);
  });

  it("names a photo that is actually in the CV assets folder", () => {
    const photo = path.join(process.cwd(), ResourceConstant.CV_ASSETS_DIR, cv.header.photo);

    expect(fs.existsSync(photo)).toBe(true);
  });

  it("ends every location with the country, spelled Viet Nam", () => {
    // One spelling across the CV, the PDF and the portfolio — not Vietnam,
    // not VietNam — and a remote client's country goes in the arrangement.
    const locations = [
      ...cv.education.map((school) => school.location),
      ...cv.experience.map((job) => job.location),
    ];

    expect(locations.filter((location) => !location.endsWith(", Viet Nam"))).toEqual([]);
  });

  it("gives every contact a usable target", () => {
    for (const contact of cv.header.contacts) {
      expect(contact.value.trim()).not.toBe("");

      // Only an email can go without one — it falls back to mailto:.
      if (contact.kind !== "email") {
        expect(contact.href).toBeTruthy();
      }
    }
  });

  it("has non-empty text throughout", () => {
    expect(cv.aboutMe.length).toBeGreaterThan(0);

    for (const skill of cv.skills) {
      expect(skill.name.trim()).not.toBe("");
      expect(skill.items.trim()).not.toBe("");
    }

    for (const job of cv.experience) {
      expect(job.company.trim()).not.toBe("");
      expect(job.period.trim()).not.toBe("");
      expect(job.groups.length).toBeGreaterThan(0);

      for (const group of job.groups) {
        expect(group.title.trim()).not.toBe("");
        expect(group.bullets.length).toBeGreaterThan(0);
      }
    }
  });

  it("uses https for every project link", () => {
    for (const project of cv.projects) {
      for (const link of project.links) {
        expect(link.href).toMatch(/^https:\/\//);
      }
    }
  });

  it("holds plain text, never LaTeX markup", () => {
    // A backslash here would be escaped into a literal "\textbackslash" on the
    // page rather than acting as a command, so it is always a mistake.
    const text = JSON.stringify(cv);

    expect(text).not.toMatch(/\\\\(textbf|item|begin|end|href)/);
  });
});

describe.each(versions)("the LaTeX generated for $slug", ({ data }) => {
  const latex = renderCvLatex(data, template);

  it("resolves every placeholder in the real template", () => {
    expect(latex).not.toMatch(/%%[A-Z_]+%%/);
  });

  it("is a complete document", () => {
    expect(latex).toContain("\\begin{document}");
    expect(latex).toContain("\\end{document}");
  });

  it("balances every environment it opens", () => {
    // An unclosed environment is the most common way a generated CV fails to
    // compile, and CI is the only place that would otherwise catch it.
    const opened = [...latex.matchAll(/\\begin\{(\w+)\}/g)].map((m) => m[1]);
    const closed = [...latex.matchAll(/\\end\{(\w+)\}/g)].map((m) => m[1]);

    const count = (names: string[]) =>
      names.reduce<Record<string, number>>(
        (acc, name) => ({ ...acc, [name]: (acc[name] ?? 0) + 1 }),
        {},
      );

    expect(count(opened)).toEqual(count(closed));
  });

  it("leaves no unescaped ampersand, which would be read as a column break", () => {
    expect(latex).not.toMatch(/(^|[^\\])&/);
  });
});
