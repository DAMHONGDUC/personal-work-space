import { PolicyNav, type NavItem } from "@/components/policy/PolicyNav";

/** Collapsed table of contents, shown instead of the sidebar on small screens. */
export function MobileToc({ items, accent }: { items: NavItem[]; accent: string }) {
  return (
    <details className="mb-10 rounded-xl border border-border-soft bg-surface lg:hidden">
      <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium marker:content-none">
        On this page
        <span className="float-right text-muted">{items.length} sections</span>
      </summary>
      <div className="border-t border-border-soft px-5 py-3">
        <PolicyNav items={items} accent={accent} />
      </div>
    </details>
  );
}

/** Sticky sidebar table of contents for wide screens. */
export function SidebarToc({ items, accent }: { items: NavItem[]; accent: string }) {
  return (
    <aside className="hidden lg:block">
      <nav
        aria-label="On this page"
        className="sticky top-24 flex flex-col gap-3 border-l border-border-soft"
      >
        <p className="pl-4 text-xs font-medium uppercase tracking-wider text-muted">
          On this page
        </p>
        <PolicyNav items={items} accent={accent} />
      </nav>
    </aside>
  );
}
