import type { Cv, CvLeaveOut, CvShared, CvSource, Experience, Skill } from "./cv-types";
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
 * `leaveOut` cuts named job projects, skill lines, About me phrases and
 * personal projects from what the shared parts give this version; Domains is built after the cut, so a
 * dropped project takes its industry with it. A skill item tied to a project
 * (`onlyWith`) goes with it too, or with a job the version does not list.
 *
 * Throws on a job id the shared file does not have, and on anything
 * `leaveOut` names that is not there, so a typo fails the build rather than
 * quietly printing what was meant to be cut, or dropping a job.
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
  const leaveOut = source.leaveOut ?? {};
  const kept = leaveOutGroups(source.label, experience, leaveOut.groups ?? []);

  if (shared.skills.some((skill) => skill.name === DOMAINS_SKILL)) {
    throw new Error(
      `shared/skills.json has a "${DOMAINS_SKILL}" line; it is built from the jobs`,
    );
  }

  const aboutMe = cutPhrases(
    source.label,
    brief ? shared.aboutMeBrief : shared.aboutMe,
    [...shared.aboutMe, ...shared.aboutMeBrief],
    leaveOut.phrases ?? [],
  );
  const sharedSkills = keepBackedItems(
    source.label,
    leaveOutSkills(source.label, shared, leaveOut),
    Object.values(shared.experience),
    kept,
  );
  const projects = leaveOutProjects(source.label, shared, leaveOut.projects ?? []);

  const domains = [
    ...new Set(kept.flatMap((job) => job.groups.flatMap((group) => group.domains))),
  ];
  const skills = domains.length
    ? [...sharedSkills, { name: DOMAINS_SKILL, items: domains.join(", ") }]
    : sharedSkills;

  const oldest = kept[kept.length - 1];
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
    experience: kept,
    projects,
  };
}

/** The version's jobs without the projects it leaves out; a job left with none is a mistake. */
function leaveOutGroups(label: string, jobs: Experience[], titles: string[]): Experience[] {
  if (titles.length === 0) return jobs;

  const known = new Set(jobs.flatMap((job) => job.groups.map((group) => group.title)));
  const unknown = titles.filter((title) => !known.has(title));
  if (unknown.length) {
    throw new Error(`CV "${label}" leaves out projects none of its jobs has: ${unknown.join(", ")}`);
  }

  return jobs.map((job) => {
    const groups = job.groups.filter((group) => !titles.includes(group.title));
    if (groups.length === 0) {
      throw new Error(`CV "${label}" leaves out every project of ${job.company}; drop the job instead`);
    }
    return groups.length === job.groups.length ? job : { ...job, groups };
  });
}

/** The shared skill lines without the ones the version leaves out. */
function leaveOutSkills(label: string, shared: CvShared, leaveOut: CvLeaveOut): CvShared["skills"] {
  const names = leaveOut.skills ?? [];
  const unknown = names.filter((name) => !shared.skills.some((skill) => skill.name === name));
  if (unknown.length) {
    throw new Error(`CV "${label}" leaves out skill lines shared/skills.json does not have: ${unknown.join(", ")}`);
  }

  return names.length ? shared.skills.filter((skill) => !names.includes(skill.name)) : shared.skills;
}

/**
 * Skill lines without the items whose `onlyWith` project the version's jobs
 * do not have. Throws on an `onlyWith` naming an item the line lacks or a
 * project no shared job has, so a rename cannot quietly keep a claim.
 */
function keepBackedItems(label: string, skills: CvShared["skills"], every: Experience[], kept: Experience[]): Skill[] {
  const titles = (jobs: Experience[]) => new Set(jobs.flatMap((job) => job.groups.map((group) => group.title)));
  const known = titles(every);
  const shown = titles(kept);

  const result = skills.map((line) => {
    if (!line.onlyWith) return line;

    const { onlyWith, ...skill } = line;
    const items = splitItems(skill.items);
    for (const [item, project] of Object.entries(onlyWith)) {
      if (!items.includes(item)) {
        throw new Error(`CV "${label}": skill "${skill.name}" ties "${item}", which it does not list`);
      }
      if (!known.has(project)) {
        throw new Error(`CV "${label}": skill "${skill.name}" ties "${item}" to "${project}", which no job has`);
      }
    }

    const cut = items.filter((item) => !onlyWith[item] || shown.has(onlyWith[item]));
    return cut.length === items.length ? skill : { ...skill, items: cut.join(", ") };
  });

  return result.every((line, i) => line === skills[i]) ? skills : result;
}

/** A skill line's items, split on the commas outside parentheses. */
function splitItems(items: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i] === "(") depth++;
    if (items[i] === ")") depth--;
    if (items[i] === "," && depth === 0) {
      parts.push(items.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(items.slice(start).trim());
  return parts;
}

/** The shared personal projects without the ones the version leaves out. */
function leaveOutProjects(label: string, shared: CvShared, names: string[]): CvShared["projects"] {
  const unknown = names.filter((name) => !shared.projects.some((project) => project.name === name));
  if (unknown.length) {
    throw new Error(`CV "${label}" leaves out personal projects shared/projects.json does not have: ${unknown.join(", ")}`);
  }

  return names.length ? shared.projects.filter((project) => !names.includes(project.name)) : shared.projects;
}

/**
 * About me with each phrase cut. A phrase belongs to one wording, full or
 * brief, so it is checked against both: it must be in one of them.
 */
function cutPhrases(label: string, lines: string[], every: string[], phrases: string[]): string[] {
  const unknown = phrases.filter((phrase) => !every.some((line) => line.includes(phrase)));
  if (unknown.length) {
    throw new Error(`CV "${label}" cuts About me phrases no wording has: ${unknown.join(" | ")}`);
  }

  return lines.map((line) => phrases.reduce((text, phrase) => text.replaceAll(phrase, ""), line));
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
