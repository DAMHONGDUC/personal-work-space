"use client";

import { useEffect, useState } from "react";

/** Whichever element actually reports the scroll offset in this document. */
function readScrollTop() {
  return Math.max(
    window.scrollY,
    document.documentElement.scrollTop,
    document.body.scrollTop,
  );
}

/** How far the document has been scrolled, from 0 to 1. */
export function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const height =
        Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;

      setProgress(height > 0 ? Math.min(1, readScrollTop() / height) : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    document.addEventListener("scroll", update, { passive: true, capture: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      document.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, []);

  return progress;
}
