import { describe, expect, it } from "vitest";
import { mergeCv } from "./cv-merge.mts";
import type { CvShared, CvSource, Experience } from "./cv-types";

const job = (company: string): Experience => ({
  company,
  role: "Mobile engineer",
  arrangement: "Onsite",
  location: "HCM City, Viet Nam",
  period: "Jan 2024 – now",
  groups: [{ title: "App", meta: "Flutter", bullets: ["Built it."] }],
});

const shared: CvShared = {
  header: { name: "A", photo: "a.jpg", contacts: [] },
  education: [],
  projects: [],
  experience: { first: job("First"), second: job("Second") },
};

const source: CvSource = {
  label: "Test",
  lastUpdated: "2026-01-01",
  aboutMe: ["Hi."],
  skills: [],
  experience: ["second", "first"],
};

describe("merging a CV version with the shared parts", () => {
  it("takes the jobs it names, in the order it names them", () => {
    expect(mergeCv(source, shared).experience.map((j) => j.company)).toEqual([
      "Second",
      "First",
    ]);
  });

  it("takes the header, education and projects from the shared parts", () => {
    const cv = mergeCv(source, shared);

    expect(cv.header).toBe(shared.header);
    expect(cv.education).toBe(shared.education);
    expect(cv.projects).toBe(shared.projects);
  });

  it("keeps what belongs to the version", () => {
    const cv = mergeCv({ ...source, portfolioAbout: ["About."] }, shared);

    expect(cv.label).toBe("Test");
    expect(cv.aboutMe).toEqual(["Hi."]);
    expect(cv.portfolioAbout).toEqual(["About."]);
  });

  it("leaves portfolioAbout out when the version has none", () => {
    expect("portfolioAbout" in mergeCv(source, shared)).toBe(false);
  });

  it("fails on a job the shared file does not have", () => {
    // A typo must fail the build, never silently drop a job from the CV.
    expect(() => mergeCv({ ...source, experience: ["frist"] }, shared)).toThrow(/frist/);
  });
});
