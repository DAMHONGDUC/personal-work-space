import type { ReactNode } from "react";

/**
 * The portfolio's card: a slightly translucent surface with a hairline border
 * that darkens on hover. `className` places it in a grid; the look itself is
 * not overridable, so every card on the page matches.
 */
export function GlassCard({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <Tag
      className={`group relative overflow-hidden rounded-2xl border border-border-soft bg-surface/80 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-foreground/20 ${className}`}
    >
      {children}
    </Tag>
  );
}
