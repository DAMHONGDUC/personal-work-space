import source from "@/data/cv/upwork/upwork.json";
import { cv } from "@/lib/cv/cv";
import { periodStart, yearsSince } from "@/lib/cv/cv-period.mts";
import type { Cv } from "@/lib/cv/cv-types";
import { projectDetails, type ProjectDetails } from "@/lib/projects/project-details";

/** `ResourceConstant.CV_UPWORK_FILE`: what only Upwork asks for, as the profile shows it. */
export type UpworkSource = {
  profileUrl: string;
  title: string;
  hourlyRate: string;
  /**
   * The overview, one `- ` line each: its own words, a pitch for clients
   * rather than the CV's About me. May write `{{years}}`, counted as About me is.
   */
  overview: string[];
  skills: string[];
  hoursPerWeek: string;
  languages: string[];
  portfolio: {
    title: string;
    /** The CV project it shows, by name: its GitHub link becomes the project URL. */
    cvProject?: string;
    role: string;
    skills: string[];
  }[];
};

/** One box of Upwork's form: its label and the text pasted into it. */
export type UpworkField = { label: string; text: string };

/** A portfolio project or a school: a name over its own fields, and a project's cover to upload. */
export type UpworkGroup = { title: string; fields: UpworkField[]; details?: ProjectDetails };

/** Upwork's limits on a portfolio project's boxes. */
export const UPWORK_LIMITS = { title: 70, description: 600 };

/** Closes every project description: each one has a test build to hand out. */
const TEST_BUILD_LINE = "TestFlight build ready — ping me to try it";

export type UpworkProfile = {
  profileUrl: string;
  profile: UpworkField[];
  portfolio: UpworkGroup[];
  education: UpworkGroup[];
};

/**
 * The Upwork profile as fields to paste, in the order Upwork's form asks for
 * them. The overview's years are counted from the CV's oldest job and the
 * education is the CV's, so the profile never disagrees with the CV. A project's points,
 * cover and video are the ones the portfolio shows (`details`); its
 * description is those points, the video link and the test-build line.
 */
export function buildUpwork(
  upwork: UpworkSource,
  from: Cv,
  details: Record<string, ProjectDetails> = projectDetails,
  now: Date = new Date(),
): UpworkProfile {
  const projectUrl = (name: string) => {
    const project = from.projects.find((item) => item.name === name);
    if (!project) throw new Error(`Upwork portfolio names "${name}", which is not a CV project.`);
    return project.links[0].href;
  };

  const oldest = from.experience[from.experience.length - 1];
  const years = oldest ? String(yearsSince(periodStart(oldest.period), now)) : "";

  return {
    profileUrl: upwork.profileUrl,
    profile: [
      { label: "Title", text: upwork.title },
      { label: "Hourly rate", text: upwork.hourlyRate },
      { label: "Overview", text: upwork.overview.map((line) => `- ${line.replaceAll("{{years}}", years)}`).join("\n") },
      { label: "Skills", text: upwork.skills.join(", ") },
      { label: "Hours per week", text: upwork.hoursPerWeek },
      { label: "Languages", text: upwork.languages.join(", ") },
    ],
    portfolio: upwork.portfolio.map((project) => {
      const shown = details[project.cvProject ?? project.title];
      if (!shown) throw new Error(`Upwork portfolio project "${project.title}" has no project details.`);
      const description = [...shown.highlights, `Demo: ${shown.youtube}`, TEST_BUILD_LINE];

      return {
        title: project.title,
        details: shown,
        fields: [
          { label: "Title", text: project.title },
          { label: "Role", text: project.role },
          { label: "Description", text: description.map((line) => `- ${line}`).join("\n") },
          { label: "Skills", text: project.skills.join(", ") },
          ...(project.cvProject ? [{ label: "Project URL", text: projectUrl(project.cvProject) }] : []),
          { label: "Video", text: shown.youtube },
        ],
      };
    }),
    education: from.education.map((school) => ({
      title: school.institution,
      fields: [
        { label: "School", text: school.institution },
        { label: "Degree", text: school.degree },
        // Upwork asks for years only: `Sep 2019 – Aug 2023` -> `2019 – 2023`.
        { label: "Dates attended", text: (school.period.match(/\d{4}/g) ?? []).join(" – ") },
      ],
    })),
  };
}

/** The profile the CV page offers, built from the default CV. */
export const upwork = buildUpwork(source as UpworkSource, cv);
