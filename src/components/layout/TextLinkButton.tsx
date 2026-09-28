import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** An internal link drawn as the site's outline button. */
export function TextLinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button asChild variant="outline">
      <Link href={href}>{children}</Link>
    </Button>
  );
}
