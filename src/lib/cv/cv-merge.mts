import type { Cv, CvShared, CvSource } from "./cv-types";
import { periodStart, yearsSince } from "./cv-period.mts";

/**
 * One version file plus the shared parts -> the complete CV every renderer
 * reads.
 *
 * Import-free but for cv-period.mts, like cv-latex.mts, so the site (which
 * imports the JSON statically) and the plain-Node LaTeX build (which reads it
 * from disk) put a CV together the same way and cannot print different ones.
 *
 * `{{years}}` in About me becomes the whole years since this version's oldest
 * job, counted to `now`, so neither the PDF nor the portfolio goes stale.
 *
 * Throws on a job id the shared file does not have, so a typo fails the build
 * rather than quietly dropping a job from the CV.
 */
export function mergeCv(source: CvSource, shared: CvShared, now: Date = new Date()): Cv {
  const experience = source.experience.map((id) => {
    const job = shared.experience[id];

    if (!job) {
      throw new Error(
        `CV "${source.label}" lists the job "${id}", which is not in shared/experience.json`,
      );
    }

    return job;
  });

  const oldest = experience[experience.length - 1];
  const years = oldest ? String(yearsSince(periodStart(oldest.period), now)) : "";

  // Spelled out field by field so the printed order of the keys — and so the
  // order of every JSON.stringify of a CV — matches the type, not the merge.
  return {
    label: source.label,
    lastUpdated: source.lastUpdated,
    header: shared.header,
    aboutMe: shared.aboutMe.map((line) => line.replaceAll("{{years}}", years)),
    education: shared.education,
    skills: shared.skills,
    experience,
    projects: shared.projects,
  };
}
