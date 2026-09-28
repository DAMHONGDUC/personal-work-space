import type { ReactNode } from "react";

/** Two columns of equal cards from the small breakpoint up, one below it. */
export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}
