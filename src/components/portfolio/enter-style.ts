import type { CSSProperties } from "react";

/**
 * The inline style that gives a `.pf-enter`, `.pf-curtain` or `.pf-words-enter` element its turn in
 * the hero's opening sequence, `ms` after the page loads. With reduced motion
 * the classes do nothing, so the delay is harmless.
 */
export function enterStyle(ms: number): CSSProperties {
  return { "--pf-delay": `${ms}ms` } as CSSProperties;
}
