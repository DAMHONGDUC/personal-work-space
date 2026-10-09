import { describe, expect, it } from "vitest";
import { DOMAINS_SKILL, mergeCv } from "./cv-merge.mts";
import type { CvShared, CvSource, Experience } from "./cv-types";

const job = (company: string, domains: string[] = []): Experience => ({
  company,
  role: "Mobile engineer",
  arrangement: "Onsite",
  location: "HCM City, Viet Nam",
  period: "Jan 2022 – now",
  groups: [{ title: "App", meta: "Flutter", domains, bullets: ["Built it."] }],
});

const shared: CvShared = {
  header: { name: "A", photo: "a.jpg", contacts: [] },
  aboutMe: ["I am A, with {{years}}+ years of experience.", "I am based here."],
  education: [],
  skills: [{ name: "Flutter", items: "Dart" }],
  projects: [],
  experience: { first: job("First", ["Fintech"]), second: job("Second", ["Games", "Fintech"]) },
};

const source: CvSource = {
  label: "Test",
  lastUpdated: "2026-01-01",
  experience: ["second", "first"],
};

describe("merging a CV version with the shared parts", () => {
  it("takes the jobs it names, in the order it names them", () => {
    expect(mergeCv(source, shared).experience.map((j) => j.company)).toEqual([
      "Second",
      "First",
    ]);
  });

  it("takes everything but the label, date, jobs and portfolio text from the shared parts", () => {
    const cv = mergeCv(source, shared);

    expect(cv.header).toBe(shared.header);
    expect(cv.aboutMe[1]).toBe(shared.aboutMe[1]);
    expect(cv.education).toBe(shared.education);
    expect(cv.skills.slice(0, -1)).toEqual(shared.skills);
    expect(cv.projects).toBe(shared.projects);
  });

  it("keeps what belongs to the version", () => {
    const cv = mergeCv(source, shared);

    expect(cv.label).toBe("Test");
    expect(cv.lastUpdated).toBe("2026-01-01");
  });

  it("counts {{years}} from the oldest job the version lists", () => {
    // Typed, the number goes stale every year; counted, it never does.
    const cv = mergeCv(source, shared, new Date(2026, 9, 7));

    expect(cv.aboutMe[0]).toBe("I am A, with 4+ years of experience.");
  });

  it("builds the Domains line from the jobs it lists, then the projects, once each", () => {
    const projects = [{ name: "P", description: "D.", domains: ["Health", "Games"], links: [] }];

    expect(mergeCv(source, { ...shared, projects }).skills.at(-1)).toEqual({
      name: DOMAINS_SKILL,
      items: "Games, Fintech, Health",
    });
  });

  it("leaves out the industry of a job the version does not list", () => {
    // The point of building it: a version cut without a job must not claim
    // that job's domain.
    const cv = mergeCv({ ...source, experience: ["first"] }, shared);

    expect(cv.skills.at(-1)?.items).toBe("Fintech");
  });

  it("writes no Domains line when nothing has a domain", () => {
    const bare = { ...shared, experience: { first: job("First"), second: job("Second") } };

    expect(mergeCv(source, bare).skills).toBe(bare.skills);
  });

  it("fails on a Domains line written into the shared skills", () => {
    const skills = [...shared.skills, { name: DOMAINS_SKILL, items: "Fintech" }];

    expect(() => mergeCv(source, { ...shared, skills })).toThrow(/Domains/);
  });

  it("fails on a job the shared file does not have", () => {
    // A typo must fail the build, never silently drop a job from the CV.
    expect(() => mergeCv({ ...source, experience: ["frist"] }, shared)).toThrow(/frist/);
  });
});
