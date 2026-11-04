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
    { title: "App", meta: "4 mobile devs", stack: "Flutter", domains, bullets: ["Built it.", "Shipped it."], briefBullets: ["Built and shipped it."] },
  ],
  note: { label: "Also:", text: "Did more.", brief: "More." },
});

const shared: CvShared = {
  header: { name: "A", photo: "a.jpg", contacts: [] },
  aboutMe: ["I am A, with {{years}}+ years of experience.", "I am based here."],
  aboutMeBrief: ["I am A, {{years}}+ years in."],
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

    // Jan 2022 to Oct 2026, both months counted: 58 months, 4.5 years.
    expect(cv.aboutMe[0]).toBe("I am A, with 4.5+ years of experience.");
  });

  it("builds the Domains line from the jobs it lists, once each", () => {
    expect(mergeCv(source, shared).skills.at(-1)).toEqual({
      name: DOMAINS_SKILL,
      items: "Games, Fintech",
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
    expect(cv.aboutMe).toEqual(["I am A, 4.5+ years in."]);
    expect(cv.skills.slice(0, -1)).toEqual(shared.skills);
    expect(cv.experience[0].groups[0].bullets).toEqual(["Built and shipped it."]);
    expect(cv.experience[0].groups[0].stack).toBe("Flutter");
    expect(cv.experience[0].groups[0]).not.toHaveProperty("briefBullets");
    expect(cv.experience[0].note).toEqual({ label: "Also:", text: "More." });
  });

  it("falls back to the full bullets and note text where there is no brief wording", () => {
    const plain = job("Plain");
    const group = { ...plain.groups[0], briefBullets: undefined };
    const bare = { ...shared, experience: { first: { ...plain, groups: [group], note: { label: "Also:", text: "Long." } } } };
    const cv = mergeCv({ ...source, brief: true, experience: ["first"] }, bare);

    expect(cv.experience[0].groups[0].bullets).toEqual(["Built it.", "Shipped it."]);
    expect(cv.experience[0].note).toEqual({ label: "Also:", text: "Long." });
  });

  it("fails on a job the shared file does not have", () => {
    // A typo must fail the build, never silently drop a job from the CV.
    expect(() => mergeCv({ ...source, experience: ["frist"] }, shared)).toThrow(/frist/);
  });
});

describe("a version that leaves out shared parts", () => {
  const two = job("Two", ["Fintech"]);
  const side = { ...two.groups[0], title: "Side App", domains: ["Construction"] };
  const withSide: CvShared = {
    ...shared,
    aboutMe: ["I am A: Android, iOS with SwiftUI and Flutter."],
    aboutMeBrief: ["I am A: Android, SwiftUI (iOS), Flutter."],
    skills: [...shared.skills, { name: "Native iOS", items: "Swift" }],
    experience: { two: { ...two, groups: [...two.groups, side] } },
  };
  const cut: CvSource = {
    ...source,
    experience: ["two"],
    leaveOut: { groups: ["Side App"], skills: ["Native iOS"], phrases: ["iOS with SwiftUI and ", "SwiftUI (iOS), "] },
  };

  it("drops the project, and its industry from Domains", () => {
    // Domains is built after the cut: a dropped project must not leave its
    // industry behind.
    const cv = mergeCv(cut, withSide);

    expect(cv.experience[0].groups.map((group) => group.title)).toEqual(["App"]);
    expect(cv.skills.at(-1)?.items).toBe("Fintech");
  });

  it("drops the skill line", () => {
    expect(mergeCv(cut, withSide).skills.map((skill) => skill.name)).toEqual(["Flutter", DOMAINS_SKILL]);
  });

  it("cuts the phrase from whichever About me wording it prints", () => {
    expect(mergeCv(cut, withSide).aboutMe).toEqual(["I am A: Android, Flutter."]);
    expect(mergeCv({ ...cut, brief: true }, withSide).aboutMe).toEqual(["I am A: Android, Flutter."]);
  });

  it("leaves the shared job itself untouched", () => {
    mergeCv(cut, withSide);

    expect(withSide.experience.two.groups).toHaveLength(2);
  });

  it("fails on a project, skill or phrase that is not there", () => {
    // A renamed title must fail the build, never quietly print what was cut.
    expect(() => mergeCv({ ...cut, leaveOut: { groups: ["Sidd App"] } }, withSide)).toThrow(/Sidd App/);
    expect(() => mergeCv({ ...cut, leaveOut: { skills: ["iOS"] } }, withSide)).toThrow(/iOS/);
    expect(() => mergeCv({ ...cut, leaveOut: { phrases: ["Kotlin"] } }, withSide)).toThrow(/Kotlin/);
  });

  it("leaves out named personal projects, and fails on one that is not there", () => {
    const pool = {
      ...shared,
      projects: [
        { name: "Kept", description: "Flutter – Kept.", links: [] },
        { name: "Cut", description: "Flutter – Cut.", links: [] },
      ],
    };

    expect(mergeCv({ ...source, leaveOut: { projects: ["Cut"] } }, pool).projects.map((p) => p.name)).toEqual(["Kept"]);
    expect(mergeCv(source, pool).projects).toBe(pool.projects);
    expect(() => mergeCv({ ...source, leaveOut: { projects: ["Cutt"] } }, pool)).toThrow(/Cutt/);
  });

  it("prints a skill item tied to a project only with that project", () => {
    const tied = {
      ...withSide,
      skills: [
        { name: "Flutter", items: "Dart, Flame, Firebase (FCM, Crashlytics)", onlyWith: { Flame: "Side App" } },
        { name: "Native iOS", items: "Swift" },
      ],
    };

    expect(mergeCv({ ...source, experience: ["two"] }, tied).skills[0]).toEqual({
      name: "Flutter",
      items: "Dart, Flame, Firebase (FCM, Crashlytics)",
    });
    expect(mergeCv(cut, tied).skills[0]).toEqual({ name: "Flutter", items: "Dart, Firebase (FCM, Crashlytics)" });
  });

  it("fails on a tie to an item or a project that is not there", () => {
    const tie = (onlyWith: Record<string, string>) => ({ ...withSide, skills: [{ name: "Flutter", items: "Dart, Flame", onlyWith }] });

    expect(() => mergeCv({ ...source, experience: ["two"] }, tie({ Flam: "Side App" }))).toThrow(/Flam/);
    expect(() => mergeCv({ ...source, experience: ["two"] }, tie({ Flame: "Sidd App" }))).toThrow(/Sidd App/);
  });

  it("fails when a job would be left with no project", () => {
    expect(() => mergeCv({ ...cut, leaveOut: { groups: ["App", "Side App"] } }, withSide)).toThrow(/drop the job/);
  });
});
