import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import source from "@/data/cv/cover-letter/cover-letter.json";
import { buildCoverLetter, coverLetter, type CoverLetterSource } from "@/lib/cv/cover-letter";
import { cv } from "@/lib/cv/cv";
import { DOMAINS_SKILL } from "@/lib/cv/cv-merge.mts";
import { ResourceConstant } from "@/lib/resource-constant.mts";

const letter = source as CoverLetterSource;

describe("the cover letter", () => {
  it("is the file ResourceConstant names", () => {
    const onDisk = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), ResourceConstant.CV_COVER_LETTER_FILE), "utf8"),
    );

    expect(onDisk).toEqual(source);
  });

  it("counts the years as the CV does and leaves no placeholder", () => {
    // Flynk, the oldest job, starts in May 2022: 54 months to October 2026.
    const text = buildCoverLetter(letter, cv, new Date(2026, 9, 16));

    expect(text).toContain("I have 4.5 years of experience");
    expect(text).not.toContain("{{");
  });

  it("is signed with the CV's name, email and phone", () => {
    const email = cv.header.contacts.find((item) => item.kind === "email")!.value;
    const phone = cv.header.contacts.find((item) => item.kind === "phone")!.value;

    expect(coverLetter.endsWith(`${letter.signOff}\nDam Hong Duc\n${email} | ${phone}`)).toBe(true);
  });

  it("prints one line per point", () => {
    for (const point of letter.points) {
      expect(coverLetter).toContain(`\n- ${point.label}: ${point.text}\n`);
    }
  });

  it("claims only domains the CV's jobs have", () => {
    // The letter is cut for every company, so it lists a few domains by hand;
    // each one must still be a domain some job on the CV was in.
    const domains = cv.skills
      .find((skill) => skill.name === DOMAINS_SKILL)!
      .items.toLowerCase()
      .split(", ");
    const claimed = letter.points.find((point) => point.label === DOMAINS_SKILL)!.text.split(", ");

    for (const domain of claimed) {
      expect(domains).toContain(domain.toLowerCase());
    }
  });
});
