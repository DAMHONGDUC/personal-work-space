"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

/**
 * A card with a faint, colourless light that follows the pointer.
 *
 * The only JavaScript on the portfolio: it writes the pointer position into two
 * CSS variables and CSS draws the light, so there is no re-render per move.
 * On touch there is no hover, and the card is simply a card.
 */
export function SpotlightCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card) return;

    const box = card.getBoundingClientRect();
    card.style.setProperty("--x", `${event.clientX - box.left}px`);
    card.style.setProperty("--y", `${event.clientY - box.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className="pf-reveal group relative overflow-hidden rounded-2xl border border-border-soft bg-surface transition-[border-color,box-shadow,transform] duration-300 hover:border-foreground/20 hover:shadow-lg motion-safe:hover:[transform:translateY(-3px)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(28rem circle at var(--x, 50%) var(--y, 50%), color-mix(in oklab, var(--foreground) 5%, transparent), transparent 60%)",
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
