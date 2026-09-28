import type { CSSProperties, ReactNode } from "react";

/**
 * The portfolio's card: a slightly translucent surface with a hairline border
 * that darkens as the card lifts on hover. When its section scrolls in, the
 * card rises in on turn `order` (0, 1, 2 …), so a grid arrives card by card.
 * `className` places it in a grid; the look itself is not overridable, so
 * every card on the page matches.
 *
 * The lift uses `transform`, not Tailwind's `translate`, which the rise-in
 * animation holds.
 */
export function GlassCard({
  children,
  className = "",
  as: Tag = "div",
  order = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
  /** Its turn in the section's entrance. */
  order?: number;
}) {
  return (
    <Tag
      style={{ "--pf-i": order } as CSSProperties}
      className={`pf-item group relative overflow-hidden rounded-2xl border border-border-soft bg-surface/80 p-6 backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-300 hover:border-foreground/20 hover:shadow-lg motion-safe:hover:[transform:translateY(-3px)] ${className}`}
    >
      {children}
    </Tag>
  );
}
