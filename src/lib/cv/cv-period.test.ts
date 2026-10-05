import { describe, expect, it } from "vitest";
import { formatDuration, periodStart, periodWithDuration } from "./cv-period.mts";

describe("periodWithDuration", () => {
  it("counts both the first and the last month, as a CV does", () => {
    expect(periodWithDuration("Jul 2022 – Nov 2022")).toBe("Jul 2022 – Nov 2022 (5 mos)");
    expect(periodWithDuration("Nov 2022 – Oct 2024")).toBe("Nov 2022 – Oct 2024 (2 yrs)");
  });

  it("counts a running job up to the month of the build", () => {
    expect(periodWithDuration("Oct 2024 – now", new Date(2026, 7, 14))).toBe(
      "Oct 2024 – now (1 yr 11 mos)",
    );
    expect(periodWithDuration("Oct 2024 – now", new Date(2026, 9, 4))).toBe(
      "Oct 2024 – now (2 yrs 1 mo)",
    );
  });

  it("refuses a period it cannot read, or one typed with its length", () => {
    expect(() => periodWithDuration("2024 – now")).toThrow(/Cannot read/);
    expect(() => periodWithDuration("Jul 2022 – Nov 2022 (5 mos)")).toThrow(/Cannot read/);
    expect(() => periodWithDuration("Nov 2022 – Jul 2022")).toThrow(/Cannot read/);
  });
});

describe("formatDuration", () => {
  it("writes singular and plural units, and leaves out a zero", () => {
    expect(formatDuration(1)).toBe("1 mo");
    expect(formatDuration(12)).toBe("1 yr");
    expect(formatDuration(13)).toBe("1 yr 1 mo");
    expect(formatDuration(36)).toBe("3 yrs");
  });
});

describe("periodStart", () => {
  it("reads a long month name too", () => {
    expect(periodStart("Sept 2019 – Aug 2023")).toBe("2019-09");
  });
});
