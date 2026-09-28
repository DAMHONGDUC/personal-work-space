import Link from "next/link";
import { routes } from "@/lib/routes/routes";

export function SiteFooter({ publisher }: { publisher: string }) {
  return (
    <footer className="mt-auto border-t border-border-soft">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {publisher}. All rights reserved.
        </p>
        <nav className="flex items-center gap-5">
          <Link
            href={routes.apps}
            className="transition-colors hover:text-foreground"
          >
            Privacy policies
          </Link>
          <Link href={routes.cv} className="transition-colors hover:text-foreground">
            CV
          </Link>
        </nav>
      </div>
    </footer>
  );
}
