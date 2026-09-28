import type { ReactNode } from "react";

/**
 * The portfolio's card: a slightly translucent surface with a hairline border
 * that darkens as the card lifts on hover. Each card rises in on its own as it
 * scrolls into view, so a grid arrives card by card. `className` places it in
 * a grid; the look itself is not overridable, so every card on the page matches.
 *
 * The lift uses `transform`, not Tailwind's `translate`, which the rise-in
 * animation holds.
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
      className={`pf-reveal group relative overflow-hidden rounded-2xl border border-border-soft bg-surface/80 p-6 backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 hover:border-foreground/20 hover:shadow-lg motion-safe:hover:[transform:translateY(-3px)] ${className}`}
    >
      {children}
    </Tag>
  );
}
