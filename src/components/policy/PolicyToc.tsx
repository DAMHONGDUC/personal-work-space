import { PolicyNav, type NavItem } from "@/components/policy/PolicyNav";
import { PanelHeading } from "@/components/shared/PanelHeading";

/** Collapsed table of contents, shown instead of the sidebar on small screens. */
export function MobileToc({
  items,
  accent,
  numbered,
}: {
  items: NavItem[];
  accent: string;
  numbered?: boolean;
}) {
  return (
    <details className="mb-10 rounded-xl border border-border-soft bg-surface lg:hidden">
      <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium marker:content-none">
        On this page
        <span className="float-right text-muted">{items.length} sections</span>
      </summary>
      <div className="border-t border-border-soft px-5 py-3">
        <PolicyNav items={items} accent={accent} numbered={numbered} />
      </div>
    </details>
  );
}

/**
 * Sticky sidebar table of contents for wide screens, on whichever side the
 * page places it — the privacy policies on the right, the guides on the left. `children` sit above the
 * contents — a guide's series list — in a box of their own capped at 40% of
 * the window, so a long series never pushes the page's contents out of view;
 * each part scrolls on its own.
 */
export function SidebarToc({
  items,
  accent,
  numbered,
  children,
}: {
  items: NavItem[];
  accent: string;
  numbered?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <aside className="hidden lg:block">
      {/* One fixed height for the column: each block above the contents has its
          own and scrolls on its own (`data-scroll-panel`), and the contents
          take the rest, so no block grows or shrinks with what it lists. */}
      <div data-toc-column className="sticky top-24 flex h-[calc(100vh-7rem)] flex-col gap-8 pb-6">
        {children}
        <nav
          aria-label="On this page"
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto border-l border-border-soft [scrollbar-width:thin]"
        >
          <PanelHeading accent={accent}>On this page</PanelHeading>
          <PolicyNav items={items} accent={accent} numbered={numbered} />
        </nav>
      </div>
    </aside>
  );
}
