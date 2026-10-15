import { describe, expect, it } from "vitest";
import { DOMAINS_SKILL, mergeCv } from "./cv-merge.mts";
import type { CvShared, CvSource, Experience } from "./cv-types";

const job = (company: string, domains: string[] = []): Experience => ({
  company,
  role: "Mobile engineer",
  arrangement: "Onsite",
  location: "HCM City, Viet Nam",
  period: "Jan 2022 – now",
  groups: [
    { title: "App", meta: "Flutter", domains, bullets: ["Built it.", "Shipped it."], briefBullets: ["Built and shipped it."], briefMeta: "Dart" },
  ],
  note: { label: "Also:", text: "Did more.", brief: "More." },
});

const shared: CvShared = {
  header: { name: "A", photo: "a.jpg", contacts: [] },
  aboutMe: ["I am A, with {{years}}+ years of experience.", "I am based here."],
  aboutMeBrief: ["I am A, {{years}}+ years in."],
  education: [],
  skills: [{ name: "Flutter", items: "Dart" }],
  skillsBrief: [{ name: "Mobile", items: "Dart" }],
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

  it("prints the full wording unless the version is brief", () => {
    const cv = mergeCv(source, shared);

    expect(cv.brief).toBe(false);
    expect(cv.aboutMe).toHaveLength(2);
    expect(cv.skills[0]).toBe(shared.skills[0]);
    expect(cv.experience[0]).toBe(shared.experience.second);
  });

  it("prints the brief wording in a brief version", () => {
    const cv = mergeCv({ ...source, brief: true }, shared, new Date(2026, 9, 7));

    expect(cv.brief).toBe(true);
    expect(cv.aboutMe).toEqual(["I am A, 4+ years in."]);
    expect(cv.skills.map((skill) => skill.name)).toEqual(["Mobile", DOMAINS_SKILL]);
    expect(cv.experience[0].groups[0].bullets).toEqual(["Built and shipped it."]);
    expect(cv.experience[0].groups[0].meta).toBe("Dart");
    expect(cv.experience[0].groups[0]).not.toHaveProperty("briefBullets");
    expect(cv.experience[0].groups[0]).not.toHaveProperty("briefMeta");
    expect(cv.experience[0].note).toEqual({ label: "Also:", text: "More." });
  });

  it("falls back to the full bullets, and drops a note, that have no brief wording", () => {
    const plain = job("Plain");
    const group = { ...plain.groups[0], briefBullets: undefined, briefMeta: undefined };
    const bare = { ...shared, experience: { first: { ...plain, groups: [group], note: { label: "Also:", text: "Long." } } } };
    const cv = mergeCv({ ...source, brief: true, experience: ["first"] }, bare);

    expect(cv.experience[0].groups[0].bullets).toEqual(["Built it.", "Shipped it."]);
    expect(cv.experience[0].groups[0].meta).toBe("Flutter");
    expect(cv.experience[0].note).toBeUndefined();
  });

  it("fails on a Domains line written into the brief skills", () => {
    const skillsBrief = [{ name: DOMAINS_SKILL, items: "Fintech" }];

    expect(() => mergeCv(source, { ...shared, skillsBrief })).toThrow(/skills-brief/);
  });

  it("fails on a job the shared file does not have", () => {
    // A typo must fail the build, never silently drop a job from the CV.
    expect(() => mergeCv({ ...source, experience: ["frist"] }, shared)).toThrow(/frist/);
  });
});
