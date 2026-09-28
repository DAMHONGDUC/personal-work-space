import Link from "next/link";
import type { ReactNode } from "react";

/** One step back up the hierarchy, followed by a separator. */
export function BreadcrumbLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <>
      <Link href={href} className="transition-colors hover:text-foreground">
        {children}
      </Link>
      <span className="px-1.5 opacity-50">/</span>
    </>
  );
}
