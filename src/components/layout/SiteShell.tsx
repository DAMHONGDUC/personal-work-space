import type { ReactNode } from "react";
import { ScrollMemory } from "@/components/layout/ScrollMemory";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/**
 * Everything inside `<body>`: header, the page, footer.
 *
 * `min-h-screen` on the body (not `h-full` on `<html>`) keeps the footer at the
 * bottom of a short page without pinning `<html>` to the viewport height, which
 * would break the document scroll the sticky header and reading progress use.
 */
export function SiteShell({ publisher, children }: { publisher: string; children: ReactNode }) {
  return (
    <body className="flex min-h-screen flex-col font-sans">
      {/* Renders nothing: it puts you back where you were on Back. */}
      <ScrollMemory />
      <SiteHeader publisher={publisher} />
      <div className="flex-1">{children}</div>
      <SiteFooter publisher={publisher} />
    </body>
  );
}
