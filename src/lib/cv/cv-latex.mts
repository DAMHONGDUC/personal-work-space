import type {
  Contact,
  Cv,
  Education,
  Experience,
  ExperienceGroup,
  Project,
  Skill,
} from "./cv-types";

/**
 * Turns cv.json into the body of a LaTeX document.
 *
 * This file is deliberately free of `fs` and of JSON imports so it stays a pure
 * function: the build script supplies the data and the template, and the tests
 * supply their own. It runs under bare Node (type stripping), so every value
 * import elsewhere in the chain needs an explicit .ts extension.
 */

/** Characters that mean something to TeX and have to be neutralised. */
const SPECIALS: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "&": "\\&",
  "%": "\\%",
  $: "\\$",
  "#": "\\#",
  _: "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

/** Unicode the JSON is written with, mapped to its LaTeX spelling. */
const TYPOGRAPHY: [RegExp, string][] = [
  [/—/g, "---"],
  [/–/g, "--"],
  [/·/g, "$\\cdot$"],
];

/**
 * Escapes plain text for use in a LaTeX document.
 *
 * Escaping is a single pass: the replacements themselves contain "\", "{" and
 * "}", so a second pass over the result would escape those and turn
 * "\textbackslash{}" into visible braces.
 *
 * Typography runs afterwards so the "$" it introduces is not escaped; none of
 * the characters it matches are TeX specials, so the two passes cannot
 * interfere.
 */
export function tex(text: string): string {
  let out = text.replace(/[\\&%$#_{}~^]/g, (char) => SPECIALS[char]);

  for (const [pattern, replacement] of TYPOGRAPHY) {
    out = out.replace(pattern, replacement);
  }

  return out;
}

/**
 * A URL for the argument of \href, which is read almost verbatim by hyperref —
 * so "_" and "&" must stay as they are, and only "%" and "#" need escaping.
 * Anything else would land in the link target itself.
 */
export function texUrl(url: string): string {
  return url.replace(/([%#])/g, "\\$1");
}

function link(href: string, label: string): string {
  return `\\hrefWithoutArrow{${texUrl(href)}}{${tex(label)}}`;
}

function contactLine(contact: Contact): string {
  const href =
    contact.kind === "email" ? (contact.href ?? `mailto:${contact.value}`) : contact.href;

  // A contact with no target is still worth showing, just not as a link.
  return href
    ? `\\mbox{${link(href, contact.value)}}`
    : `\\mbox{${tex(contact.value)}}`;
}

/** Contacts stack in two equal columns, filling the left one first. */
function contactColumn(contacts: Contact[]): string {
  return contacts.map(contactLine).join("\\\\[-4pt]\n            ");
}

function renderHeader(cv: Cv): string {
  const { name, photo, contacts } = cv.header;
  const half = Math.ceil(contacts.length / 2);

  return `\\begin{header}
    \\begin{minipage}[c]{0.75\\textwidth}
        \\cvName{${tex(name)}}
        \\normalsize
        \\vspace{2pt}
        \\begin{minipage}[t]{0.5\\linewidth}
            \\raggedright
            ${contactColumn(contacts.slice(0, half))}
        \\end{minipage}%
        \\begin{minipage}[t]{0.5\\linewidth}
            \\raggedright
            ${contactColumn(contacts.slice(half))}
        \\end{minipage}
    \\end{minipage}%
    \\hfill
    \\begin{minipage}[c]{0.2\\textwidth}
        \\raggedleft
        \\begin{tikzpicture}
            \\clip (0,0) circle (1.6cm);
            \\node at (0,0) {\\includegraphics[width=3.2cm]{${photo}}};
        \\end{tikzpicture}
    \\end{minipage}
\\end{header}`;
}

/** The \begin{highlights} bullet list used throughout the document. */
function highlights(items: string[], indent: string, separator = "\n"): string {
  const body = items.map((item) => `${indent}    \\item ${item}`).join(separator);

  return `${indent}\\begin{highlights}\n${body}\n${indent}\\end{highlights}`;
}

function renderAboutMe(cv: Cv): string {
  return `\\begin{onecolentry}
${highlights(cv.aboutMe.map(tex), "    ")}
\\end{onecolentry}`;
}

function renderEducation(entry: Education): string {
  return `\\begin{twocolentry}{\\cvDate{${tex(entry.period)}}}
    \\cvRole{${tex(entry.institution)}} -- ${tex(entry.location)}
\\end{twocolentry}
\\vspace{1.5mm}
${tex(entry.degree)}
\\vspace{0.05cm}`;
}

function renderSkills(skills: Skill[]): string {
  const items = skills.map((skill) => `\\textbf{${tex(skill.name)}:} ${tex(skill.items)}`);

  // A blank line between items matches the spacing of the hand-written source.
  return `\\begin{onecolentry}
${highlights(items, "    ", "\n        \n")}
\\end{onecolentry}`;
}

/** Group heading, then its stack/team line followed by the achievements. */
function renderGroup(group: ExperienceGroup): string {
  const inner = highlights(
    [`{${tex(group.meta)}}`, ...group.bullets.map(tex)],
    "        ",
  );

  return `        \\item \\cvRole{${tex(group.title)}}
${inner}`;
}

/**
 * `position` counts from the earliest job, so the oldest is 1. Entries are
 * still listed newest first, which means the numbers run downwards — they read
 * as "this was my Nth role" rather than as a ranking of the list.
 */
function renderExperience(entry: Experience, position: number): string {
  const heading = [entry.role, entry.arrangement, entry.location]
    .map(tex)
    .join(" -- ");

  const blocks = entry.groups.map(renderGroup);

  if (entry.note) {
    // Body size, so the only thing setting it apart from a bullet is the weight
    // of its lead-in — every line of content reads at one size.
    blocks.push(
      `        \\item \\textbf{${tex(entry.note.label)}} ${tex(entry.note.text)}`,
    );
  }

  return `\\begin{twocolentry}{\\cvDate{${tex(entry.period)}}}
    \\cvCompany{${position}. ${tex(entry.company)}} -- ${heading}
\\end{twocolentry}
\\vspace{3mm}
\\begin{onecolentry}
    \\begin{highlights}
${blocks.join("\n\n        \\vspace{2mm}\n\n")}
    \\end{highlights}
\\end{onecolentry}`;
}

/**
 * Jobs are listed newest first but numbered from the oldest, so the count runs
 * down the page. Separated by a full-width rule.
 */
function renderExperiences(entries: Experience[]): string {
  return entries
    .map((entry, index) => renderExperience(entry, entries.length - index))
    .join("\n\n\\noindent\\rule{\\linewidth}{0.5pt}\\par\n\\vspace{3mm}\n\n");
}

function renderProject(project: Project): string {
  // A project name sits at the same level as a role inside a job, and its
  // description is content, so only the name takes the heading size.
  const heading = `    \\item \\cvRole{${tex(project.name)}}: ${tex(project.description)}`;

  if (project.links.length === 0) {
    return heading;
  }

  const links = project.links
    .map((entry) => `        \\item \\href{${texUrl(entry.href)}}{${tex(entry.label)}}`)
    .join("\n");

  return `${heading}
    \\begin{itemize}
${links}
    \\end{itemize}`;
}

function renderProjects(projects: Project[]): string {
  return `\\begin{highlights}
${projects.map(renderProject).join("\n")}
\\end{highlights}`;
}

/** Placeholder in cv/template/main.tex → the LaTeX that replaces it. */
function sections(cv: Cv): Record<string, string> {
  return {
    HEADER: renderHeader(cv),
    ABOUT_ME: renderAboutMe(cv),
    EDUCATION: cv.education.map(renderEducation).join("\n\\vspace{3mm}\n"),
    SKILLS: renderSkills(cv.skills),
    EXPERIENCE: renderExperiences(cv.experience),
    PROJECTS: renderProjects(cv.projects),
  };
}

/**
 * Fills every %%PLACEHOLDER%% in the template with its rendered section.
 *
 * Throws if the template still holds a placeholder afterwards, so a renamed
 * section fails the build rather than shipping a CV with a literal
 * "%%SKILLS%%" printed in it.
 */
export function renderCvLatex(cv: Cv, template: string): string {
  let out = template;

  for (const [name, latex] of Object.entries(sections(cv))) {
    out = out.replaceAll(`%%${name}%%`, () => latex);
  }

  const unresolved = out.match(/%%[A-Z_]+%%/g);
  if (unresolved) {
    throw new Error(
      `cv/template/main.tex has placeholders nothing fills: ${[...new Set(unresolved)].join(", ")}`,
    );
  }

  return out;
}
