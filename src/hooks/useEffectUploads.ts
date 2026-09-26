"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { UploadsManifest } from "@/lib/effect-uploads";
import { canReadUploads, readUploads } from "@/lib/google-drive";

export type UploadsState = {
  /** Null until Drive has answered, and for good when uploads are not set up. */
  manifest: UploadsManifest | null;
  fileId: string | null;
};

// One copy for the whole tab: read from Drive once, shared by every page and
// by the upload dialog, which writes the new manifest straight into it.
let state: UploadsState = { manifest: null, fileId: null };
const SERVER_STATE: UploadsState = { manifest: null, fileId: null };
const listeners = new Set<() => void>();
let requested = false;

function publish(next: UploadsState) {
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function load() {
  if (!canReadUploads || requested) return;
  requested = true;

  readUploads()
    .then(publish)
    .catch((error: Error) => {
      // The synced library still shows; only the uploads are missing.
      console.warn(`Could not read uploads from Google Drive: ${error.message}`);
      requested = false;
    });
}

/** After an upload: the manifest as just written to Drive. */
export function commitUploads(next: UploadsState) {
  publish(next);
}

/** The uploads manifest, fetched on first use. */
export function useEffectUploads(): UploadsState {
  const current = useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
  useEffect(load, []);
  return current;
}
