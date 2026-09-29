"use client";

import { useEffect, useRef } from "react";

/** How long the count takes, in milliseconds. */
const DURATION_MS = 1300;

/**
 * A figure that counts up from zero once the hero has played in: `4+` runs
 * 0+, 1+ … 4+, easing out so it settles rather than stops.
 *
 * The page renders the real value, so with no JavaScript, with reduced motion,
 * or for a value that does not start with a number, it simply shows. The count
 * writes to the DOM directly, so React never re-renders for it, and `delay`
 * keeps it inside the hero's opening sequence, while the figure is still
 * faded out — the reset to zero is never seen.
 */
export function CountUp({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    const match = /^(\d+)(.*)$/.exec(value);
    if (!element || !match) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const target = Number(match[1]);
    const suffix = match[2];
    let frame = 0;
    let start: number | undefined;

    element.textContent = `0${suffix}`;

    const step = (now: number) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / DURATION_MS);
      const eased = 1 - Math.pow(1 - progress, 4);

      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      element.textContent = value;
    };
  }, [value, delay]);

  return <span ref={ref}>{value}</span>;
}
