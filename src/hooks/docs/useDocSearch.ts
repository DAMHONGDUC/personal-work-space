"use client";

import { useMemo } from "react";
import { useQueryParam } from "@/hooks/routes/useQueryParam";
import type { Doc } from "@/lib/docs/doc-model";
import { searchDocs, type DocMatch } from "@/lib/docs/doc-search";
import { DOCS_QUERY } from "@/lib/routes/routes";

/**
 * The query box on the guide index, kept in the address (`?q=`) so a search
 * survives a reload and can be shared. The matching itself lives in
 * `doc-search.ts`, which is plain functions and testable without a DOM.
 */
export function useDocSearch(docs: Doc[]): {
  query: string;
  setQuery: (value: string) => void;
  results: DocMatch[];
} {
  const [stored, store] = useQueryParam(DOCS_QUERY.search);
  const query = stored ?? "";
  const setQuery = (value: string) => store(value === "" ? null : value);

  const results = useMemo(() => searchDocs(docs, query), [docs, query]);

  return { query, setQuery, results };
}
