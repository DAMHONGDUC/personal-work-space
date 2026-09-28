import type { ReactNode } from "react";

/**
 * Content with a narrow sticky-able column on the right from `lg` up, such as
 * a table of contents. Below `lg` the sidebar stacks after the content.
 */
export function WithSidebar({ children, sidebar }: { children: ReactNode; sidebar: ReactNode }) {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-14">
      <div className="flex min-w-0 flex-col gap-14">{children}</div>
      {sidebar}
    </div>
  );
}
