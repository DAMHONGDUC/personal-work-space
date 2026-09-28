"use client";

import { useMemo, useState } from "react";
import type { Doc } from "@/lib/docs/doc-model";
import { searchDocs, type DocMatch } from "@/lib/docs/doc-search";

/**
 * The query box on the guide index. The matching itself lives in
 * `doc-search.ts`, which is plain functions and testable without a DOM.
 */
export function useDocSearch(docs: Doc[]): {
  query: string;
  setQuery: (value: string) => void;
  results: DocMatch[];
} {
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchDocs(docs, query), [docs, query]);

  return { query, setQuery, results };
}
