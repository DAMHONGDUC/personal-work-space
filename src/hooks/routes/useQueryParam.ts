"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Subscribers in this tab, so every reader of the address moves together. */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Back and forward change the address without our own writes.
  window.addEventListener("popstate", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

/**
 * One query parameter of the page's address, read and written as state, so a
 * filter survives a reload and a shared link opens on what the sender saw.
 *
 * The address is an external store, read through useSyncExternalStore like
 * the stored language: the prerendered HTML has no query (`null`), the browser
 * reads it on its first render. A write replaces the history entry instead of
 * adding one, so typing a search does not fill Back with every letter; an
 * empty value removes the parameter.
 */
export function useQueryParam(name: string): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );

  const write = useCallback(
    (next: string | null) => {
      const url = new URL(window.location.href);
      if (next) url.searchParams.set(name, next);
      else url.searchParams.delete(name);
      window.history.replaceState(window.history.state, "", url);
      for (const listener of listeners) listener();
    },
    [name],
  );

  return [value, write];
}
