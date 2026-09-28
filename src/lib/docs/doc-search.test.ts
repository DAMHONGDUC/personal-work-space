import { describe, expect, it } from "vitest";
import type { Doc } from "@/lib/docs/doc-model";
import { normalize, searchDocs } from "@/lib/docs/doc-search";

function doc(overrides: Partial<Doc> & Pick<Doc, "slug">): Doc {
  return {
    title: "Set up SSH for git",
    tagline: "Keys, agent and config.",
    icon: "🔑",
    topic: "tooling",
    tags: ["Git", "SSH"],
    readingTime: "6 min",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01",
    intro: ["One key per machine."],
    sections: [],
    ...overrides,
  };
}

const ssh = doc({
  slug: "ssh-git",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [{ type: "list", items: ["ssh-keygen writes two files"] }],
    },
    {
      id: "several-accounts",
      title: "Two accounts",
      blocks: [
        {
          type: "flow",
          stages: [
            {
              items: [
                {
                  label: "~/.ssh/config",
                  detail: "Matches the host name in the url",
                  explain: ["IdentitiesOnly yes stops ssh offering every key it holds."],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

const pinning = doc({
  slug: "ssl-pinning",
  title: "Ghim chứng chỉ",
  tagline: "Mã hoá không đủ.",
  tags: ["TLS"],
  intro: ["TLS chứng minh certificate được ký."],
  sections: [
    {
      id: "handshake",
      title: "Handshake",
      blocks: [{ type: "note", tone: "warning", body: ["SNI đi ở dạng rõ."] }],
    },
  ],
});

const docs = [ssh, pinning];

describe("normalize", () => {
  it("strips the diacritics a laptop keyboard cannot type", () => {
    expect(normalize("Mã hoá")).toBe("ma hoa");
    expect(normalize("chứng chỉ")).toBe("chung chi");
    expect(normalize("Đúng")).toBe("dung");
  });
});

describe("searchDocs", () => {
  it("returns every guide, whole, for an empty query", () => {
    const results = searchDocs(docs, "   ");

    expect(results.map((result) => result.doc.slug)).toEqual(["ssh-git", "ssl-pinning"]);
    expect(results[0].sections).toBe(ssh.sections);
  });

  it("matches a guide by its title and keeps all its sections", () => {
    const [result, ...rest] = searchDocs(docs, "SSH");

    expect(rest).toEqual([]);
    expect(result.doc.slug).toBe("ssh-git");
    expect(result.sections).toHaveLength(2);
  });

  it("finds a word used only inside one section, and lists that one", () => {
    const [result] = searchDocs(docs, "IdentitiesOnly");

    expect(result.doc.slug).toBe("ssh-git");
    expect(result.sections.map((section) => section.id)).toEqual(["several-accounts"]);
  });

  it("reads the points behind a diagram box, not just the box", () => {
    // The dialog holds the definitions, so a term is often only written there.
    expect(searchDocs(docs, "offering every key")).toHaveLength(1);
  });

  it("ands the terms together", () => {
    expect(searchDocs(docs, "ssh keygen")).toHaveLength(1);
    expect(searchDocs(docs, "ssh handshake")).toEqual([]);
  });

  it("finds Vietnamese text typed without diacritics, and the other way round", () => {
    expect(searchDocs(docs, "ma hoa")[0].doc.slug).toBe("ssl-pinning");
    expect(searchDocs(docs, "chứng chỉ")[0].doc.slug).toBe("ssl-pinning");
  });

  it("ignores the field names blocks are built from", () => {
    // Every guide has a "note" and a "flow" in it somewhere; searching for the
    // shape of the data would match all of them and mean nothing.
    expect(searchDocs(docs, "note")).toEqual([]);
    expect(searchDocs(docs, "flow")).toEqual([]);
  });

  it("returns nothing for a word no guide uses", () => {
    expect(searchDocs(docs, "kubernetes")).toEqual([]);
  });
});
