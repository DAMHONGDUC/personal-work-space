"use client";

import { useReadingProgress } from "@/hooks/scroll/useReadingProgress";

/** Thin accent bar across the top showing how far through the policy you are. */
export function ReadingProgress({ accent }: { accent: string }) {
  const progress = useReadingProgress();

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-30 h-0.5">
      <div
        className="h-full origin-left"
        style={{ transform: `scaleX(${progress})`, backgroundColor: accent }}
      />
    </div>
  );
}
