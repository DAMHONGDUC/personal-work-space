import { describe, expect, it } from "vitest";
import { cv, cvPdfFileName } from "./cv";

describe("the downloaded CV's filename", () => {
  it("is the name and the build date, day first", () => {
    expect(cvPdfFileName(new Date(2026, 7, 25))).toBe(
      "CV_DAM_HONG_DUC_25_08_2026.pdf",
    );
  });

  it("pads a single-digit day and month", () => {
    // Without the padding these sort out of order in a downloads folder, and
    // 1_9_2026 reads as two different dates depending on where you are.
    expect(cvPdfFileName(new Date(2026, 0, 5))).toContain("_05_01_2026.pdf");
  });

  it("carries the name that is actually in the CV", () => {
    // The expectation above is written out in full so it is readable; this is
    // what stops it going stale if the CV is ever issued under another name.
    const name = cv.header.name.toUpperCase().replace(/\s+/g, "_");

    expect(cvPdfFileName()).toContain(`CV_${name}_`);
  });

  it("is the same for every version of the CV", () => {
    // The switcher offers several CVs from one page and they all download
    // under this one name — the version is not something a recruiter should
    // have to read off a filename.
    expect(cvPdfFileName(new Date(2026, 7, 25), "Dam Hong Duc")).toBe(
      "CV_DAM_HONG_DUC_25_08_2026.pdf",
    );
  });

  it("keeps diacritics and punctuation out of the filename", () => {
    // Not the live name, but the CV data is one edit away from being written
    // this way — and a filename is not the place to find out.
    expect(cvPdfFileName(new Date(2026, 7, 25), "Đàm Hồng Đức")).toBe(
      "CV_DAM_HONG_DUC_25_08_2026.pdf",
    );
  });
});
