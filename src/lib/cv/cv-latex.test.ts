import { describe, expect, it } from "vitest";
import { renderCvLatex, tex, texUrl } from "./cv-latex.mts";
import type { Cv } from "./cv-types";

/** A complete CV that tests can shallow-override, so cases stay readable. */
function makeCv(overrides: Partial<Cv> = {}): Cv {
  return {
    label: "Test version",
    lastUpdated: "2026-01-01",
    header: {
      name: "Test Person",
      photo: "avt.png",
      contacts: [{ kind: "email", value: "hi@example.com" }],
    },
    aboutMe: ["A sentence."],
    education: [
      {
        institution: "A University",
        location: "A City",
        period: "2019 – 2023",
        degree: "BSc",
      },
    ],
    skills: [{ name: "Flutter", items: "BLoC, get_it" }],
    experience: [
      {
        company: "Acme",
        role: "Developer",
        arrangement: "Onsite",
        location: "A City",
        period: "Jan 2024 – Mar 2024",
        groups: [{ title: "Mobile App", meta: "Flutter · Team size: 4", domains: [], bullets: ["Did a thing."] }],
      },
    ],
    projects: [
      {
        name: "Thing",
        description: "A thing.",
        domains: [],
        links: [{ label: "github.com/x/a_b", href: "https://github.com/x/a_b" }],
      },
    ],
    ...overrides,
  };
}

const TEMPLATE =
  "%%HEADER%%|%%ABOUT_ME%%|%%EDUCATION%%|%%SKILLS%%|%%EXPERIENCE%%|%%PROJECTS%%";

describe("tex", () => {
  it("escapes the characters that would otherwise be LaTeX syntax", () => {
    expect(tex("R&D")).toBe("R\\&D");
    expect(tex("get_it")).toBe("get\\_it");
    expect(tex("100%")).toBe("100\\%");
    expect(tex("$5")).toBe("\\$5");
    expect(tex("#1")).toBe("\\#1");
    expect(tex("{x}")).toBe("\\{x\\}");
  });

  it("escapes a backslash without mangling the escapes it adds", () => {
    // The backslash rule has to run first, or it would re-escape the
    // backslashes the "&" rule introduces.
    expect(tex("a\\b & c")).toBe("a\\textbackslash{}b \\& c");
  });

  it("converts dashes and the middle dot to their LaTeX spelling", () => {
    expect(tex("2019 – 2023")).toBe("2019 -- 2023");
    expect(tex("a — b")).toBe("a --- b");
    expect(tex("Flutter · Team size: 4")).toBe("Flutter $\\cdot$ Team size: 4");
  });

  it("leaves the maths it introduces alone", () => {
    // Typography runs after escaping, so the "$" in $\cdot$ must survive.
    expect(tex("a · b")).not.toContain("\\$");
  });
});

describe("texUrl", () => {
  it("keeps characters hyperref reads verbatim", () => {
    // Escaping these would change the link target itself.
    expect(texUrl("https://x.dev/a_b?c=1&d=2")).toBe("https://x.dev/a_b?c=1&d=2");
  });

  it("escapes the two characters that would end the argument early", () => {
    expect(texUrl("https://x.dev/a%20b#f")).toBe("https://x.dev/a\\%20b\\#f");
  });
});

describe("renderCvLatex", () => {
  it("fills every placeholder in the template", () => {
    expect(renderCvLatex(makeCv(), TEMPLATE)).not.toMatch(/%%[A-Z_]+%%/);
  });

  it("throws when the template asks for a section that does not exist", () => {
    // Otherwise the CV would ship with a literal "%%AWARDS%%" printed on it.
    expect(() => renderCvLatex(makeCv(), "%%AWARDS%%")).toThrow(/%%AWARDS%%/);
  });

  it("defaults an email contact to a mailto link", () => {
    expect(renderCvLatex(makeCv(), TEMPLATE)).toContain(
      "\\hrefWithoutArrow{mailto:hi@example.com}{hi@example.com}",
    );
  });

  it("uses an explicit href when the contact carries one", () => {
    const out = renderCvLatex(
      makeCv({
        header: {
          name: "T",
          photo: "avt.png",
          contacts: [{ kind: "phone", value: "+84 355 211 735", href: "tel:+84355211735" }],
        },
      }),
      TEMPLATE,
    );

    expect(out).toContain("\\hrefWithoutArrow{tel:+84355211735}{+84 355 211 735}");
  });

  it("splits the contacts into two columns, filling the left one first", () => {
    const contacts = ["a", "b", "c"].map((value) => ({ kind: "link" as const, value, href: `https://${value}.dev` }));
    const out = renderCvLatex(
      makeCv({ header: { name: "T", photo: "avt.png", contacts } }),
      TEMPLATE,
    );

    const [, left, right] = out.split("\\begin{minipage}[t]{0.5\\linewidth}");

    expect(left).toContain("a.dev");
    expect(left).toContain("b.dev");
    expect(right).toContain("c.dev");
    expect(right).not.toContain("b.dev");
  });

  it("escapes the URL label but not the URL", () => {
    const out = renderCvLatex(makeCv(), TEMPLATE);

    expect(out).toContain("\\href{https://github.com/x/a_b}{github.com/x/a\\_b}");
  });

  it("links a school and a company that carry a website, and highlights the rest", () => {
    const base = makeCv();
    const out = renderCvLatex(
      makeCv({
        education: [{ ...base.education[0], url: "https://uni.example/" }],
        experience: [
          { ...base.experience[0], url: "https://acme.example/" },
          { ...base.experience[0], company: "Beta" },
        ],
      }),
      TEMPLATE,
    );

    expect(out).toContain("\\cvRole{\\cvNameLink{https://uni.example/}{A University}}");
    expect(out).toContain("\\cvNameLink{https://acme.example/}{Acme}");
    expect(out).toContain("\\cvCompany{\\cvNameHighlight{Beta}}");
  });

  it("highlights the word freelancer in a job's heading, and nothing else", () => {
    const job = makeCv().experience[0];
    const out = renderCvLatex(
      makeCv({ experience: [{ ...job, arrangement: "Freelancer, remote (Japan)" }, job] }),
      TEMPLATE,
    );

    expect(out).toContain("\\cvHighlight{Freelancer}, remote (Japan)");
    expect(out.match(/\\cvHighlight\{/g)).toHaveLength(1);
  });

  it("renders a skill as a bold lead-in", () => {
    expect(renderCvLatex(makeCv(), TEMPLATE)).toContain(
      "\\item \\textbf{Flutter:} BLoC, get\\_it",
    );
  });

  it("puts the group's stack line above its bullets", () => {
    const out = renderCvLatex(makeCv(), TEMPLATE);
    const meta = out.indexOf("Flutter $\\cdot$ Team size: 4");

    expect(meta).toBeGreaterThan(-1);
    expect(out.indexOf("Did a thing.")).toBeGreaterThan(meta);
  });

  it("separates jobs with a rule but does not lead or trail with one", () => {
    const two = makeCv().experience[0];
    const out = renderCvLatex(
      makeCv({ experience: [two, { ...two, company: "Beta" }] }),
      TEMPLATE,
    );

    expect(out.match(/\\noindent\\rule/g)).toHaveLength(1);
  });

  it("lists the jobs newest first, without numbers", () => {
    const job = makeCv().experience[0];
    const out = renderCvLatex(
      makeCv({ experience: [job, { ...job, company: "Older" }] }),
      TEMPLATE,
    );

    expect(out).toContain("\\cvCompany{\\cvNameHighlight{Acme}}");
    expect(out).toContain("\\cvCompany{\\cvNameHighlight{Older}}");
    expect(out.indexOf("{Acme}")).toBeLessThan(out.indexOf("{Older}"));
  });

  it("marks up dates, roles and companies by meaning, not by size", () => {
    // Every size the CV uses is declared once in cv/template/main.tex. An
    // inline \fontsize here would be a second place to change it, and is how
    // headings drifted out of step with each other before.
    const out = renderCvLatex(makeCv(), TEMPLATE);

    expect(out).toContain("\\cvDate{Jan 2024 -- Mar 2024 (3 mos)}");
    expect(out).toContain("\\cvRole{Mobile App}");
    expect(out).not.toContain("\\fontsize");
  });

  it("omits the note bullet when the job has none", () => {
    expect(renderCvLatex(makeCv(), TEMPLATE)).not.toContain("\\textbf{Process:}");
  });

  it("renders a note bullet after the last group", () => {
    const job = makeCv().experience[0];
    const out = renderCvLatex(
      makeCv({
        experience: [{ ...job, note: { label: "Process:", text: "Agile – and so on." } }],
      }),
      TEMPLATE,
    );

    expect(out).toContain("\\textbf{Process:} Agile -- and so on.");
    expect(out.indexOf("Process:")).toBeGreaterThan(out.indexOf("Did a thing."));
  });

  it("omits the link list for a project with no links", () => {
    const out = renderCvLatex(
      makeCv({ projects: [{ name: "Thing", description: "A thing.", domains: [], links: [] }] }),
      TEMPLATE,
    );

    expect(out).not.toContain("\\begin{itemize}");
  });

  it("drops the projects section, heading and all, when there are none", () => {
    const out = renderCvLatex(makeCv({ projects: [] }), TEMPLATE);

    expect(out).not.toContain("Personal Projects");
    expect(out).not.toContain("\\begin{highlights}\n\\end{highlights}");
  });

  it("treats a dollar sign in the data as text, not as maths", () => {
    // A raw "$" would open maths mode and break the compile several lines later.
    const out = renderCvLatex(makeCv({ aboutMe: ["Saved $1M"] }), TEMPLATE);

    expect(out).toContain("Saved \\$1M");
  });
});
