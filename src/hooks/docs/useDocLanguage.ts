"use client";

import { useCallback, useSyncExternalStore } from "react";
import { LANGUAGES, type Lang } from "@/lib/docs/doc-model";

const STORAGE_KEY = "docs-language";

/** Subscribers in this tab, so every switch on the page moves together. */
const listeners = new Set<() => void>();

function isLang(value: string | null): value is Lang {
  return LANGUAGES.includes(value as Lang);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab writing the preference fires storage, never our own listeners.
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readStored(): Lang {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLang(stored) ? stored : "en";
}

/**
 * The language the guides are read in, remembered across pages and visits.
 *
 * localStorage is genuinely an external store, so it is read through
 * useSyncExternalStore rather than copied into state by an effect: the
 * prerendered HTML gets English, the browser gets the stored choice on its first
 * render, and every switch on the page — index and article alike — stays in step
 * with the others and with the other tabs.
 */
export function useDocLanguage(): [Lang, (next: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, readStored, () => "en" as Lang);

  const choose = useCallback((next: Lang) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    for (const listener of listeners) listener();
  }, []);

  return [lang, choose];
}
