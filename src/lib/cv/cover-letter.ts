import source from "@/data/cv/cover-letter/cover-letter.json";
import { cv } from "@/lib/cv/cv";
import { periodStart, yearsSince } from "@/lib/cv/cv-period.mts";
import type { Cv } from "@/lib/cv/cv-types";
import { titleCase } from "@/lib/format";

/** `ResourceConstant.CV_COVER_LETTER_FILE`: the words, written once for every company. */
export type CoverLetterSource = {
  greeting: string;
  /** May write `{{years}}`, counted from the CV's oldest job as About me is. */
  opening: string;
  /** One line each, printed `- Label: text`. */
  points: { label: string; text: string }[];
  closing: string;
  signOff: string;
};

/**
 * The cover letter as plain text, ready to paste into an application form or
 * an email. The years, the name and the contact line come from the CV, so the
 * letter never disagrees with the CV sent beside it.
 */
export function buildCoverLetter(letter: CoverLetterSource, from: Cv, now: Date = new Date()): string {
  const oldest = from.experience[from.experience.length - 1];
  const years = oldest ? String(yearsSince(periodStart(oldest.period), now)) : "";
  const contact = (kind: string) => from.header.contacts.find((item) => item.kind === kind)?.value;

  return [
    letter.greeting,
    letter.opening.replaceAll("{{years}}", years),
    letter.points.map((point) => `- ${point.label}: ${point.text}`).join("\n"),
    letter.closing,
    [
      letter.signOff,
      titleCase(from.header.name),
      [contact("email"), contact("phone")].filter(Boolean).join(" | "),
    ].join("\n"),
  ].join("\n\n");
}

/** The letter the CV page offers, signed from the default CV. */
export const coverLetter = buildCoverLetter(source as CoverLetterSource, cv);
