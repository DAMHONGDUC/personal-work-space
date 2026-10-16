import type { Cv, CvShared, CvSource, Experience } from "./cv-types";
import { periodStart, yearsSince } from "./cv-period.mts";

/** The skill line `mergeCv` writes; the shared skills may not hold one. */
export const DOMAINS_SKILL = "Domains";

/**
 * One version file plus the shared parts -> the complete CV every renderer
 * reads.
 *
 * Import-free but for cv-period.mts, like cv-latex.mts, so the site (which
 * imports the JSON statically) and the plain-Node LaTeX build (which reads it
 * from disk) put a CV together the same way and cannot print different ones.
 *
 * `{{years}}` in About me becomes the years since this version's oldest job,
 * in half-year steps (`4`, `4.5`), counted to `now`, so neither the PDF nor
 * the portfolio goes stale.
 *
 * The Domains skill line is built here, from the domains of this version's
 * jobs, in the order they first appear: a version without a job does not claim
 * its industry, and a personal project claims none.
 *
 * A brief version says everything the full one does, in shorter lines:
 * `aboutMeBrief`, each group's `briefBullets` and a note's `brief` text, each
 * falling back to the full wording when it has none. Skills are the same.
 *
 * Throws on a job id the shared file does not have, so a typo fails the build
 * rather than quietly dropping a job from the CV.
 */
export function mergeCv(source: CvSource, shared: CvShared, now: Date = new Date()): Cv {
  const brief = source.brief ?? false;

  const experience = source.experience.map((id) => {
    const job = shared.experience[id];

    if (!job) {
      throw new Error(
        `CV "${source.label}" lists the job "${id}", which is not in shared/experience.json`,
      );
    }

    return brief ? briefJob(job) : job;
  });

  if (shared.skills.some((skill) => skill.name === DOMAINS_SKILL)) {
    throw new Error(
      `shared/skills.json has a "${DOMAINS_SKILL}" line; it is built from the jobs`,
    );
  }

  const aboutMe = brief ? shared.aboutMeBrief : shared.aboutMe;

  const domains = [
    ...new Set(experience.flatMap((job) => job.groups.flatMap((group) => group.domains))),
  ];
  const skills = domains.length
    ? [...shared.skills, { name: DOMAINS_SKILL, items: domains.join(", ") }]
    : shared.skills;

  const oldest = experience[experience.length - 1];
  const years = oldest ? String(yearsSince(periodStart(oldest.period), now)) : "";

  // Spelled out field by field so the printed order of the keys — and so the
  // order of every JSON.stringify of a CV — matches the type, not the merge.
  return {
    label: source.label,
    lastUpdated: source.lastUpdated,
    brief,
    header: shared.header,
    aboutMe: aboutMe.map((line) => line.replaceAll("{{years}}", years)),
    education: shared.education,
    skills,
    experience,
    projects: shared.projects,
  };
}

/** A job as a brief version prints it: the same points, in their brief wording where it has one. */
function briefJob(job: Experience): Experience {
  const { note, ...rest } = job;
  const groups = job.groups.map(({ briefBullets, ...group }) => ({
    ...group,
    bullets: briefBullets ?? group.bullets,
  }));

  return note
    ? { ...rest, groups, note: { label: note.label, text: note.brief ?? note.text } }
    : { ...rest, groups };
}
