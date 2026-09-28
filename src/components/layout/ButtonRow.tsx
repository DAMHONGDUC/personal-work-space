import type { ReactNode } from "react";

/** A wrapping row of buttons with the site's button gap. */
export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="mt-2 flex flex-wrap gap-2">{children}</div>;
}
