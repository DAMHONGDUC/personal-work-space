"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

/**
 * A card with a faint, colourless light that follows the pointer.
 *
 * It writes the pointer position into two CSS variables and CSS draws the
 * light, so there is no re-render per move. On touch there is no hover, and
 * the card is simply a card. With a mouse it also tilts a few degrees toward
 * the pointer and lifts, like a card picked up off the table. Like GlassCard
 * it rises in on turn `order` when its section scrolls in.
 */
export function SpotlightCard({ children, order = 0 }: { children: ReactNode; order?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card) return;

    const box = card.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);

    // A mouse tilts the card toward it, a few degrees at most; a finger or
    // pen does not, and neither does a reader who asked for less motion.
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    card.style.setProperty("--rx", `${((0.5 - y / box.height) * 5).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${((x / box.width - 0.5) * 7).toFixed(2)}deg`);
  }

  function onPointerLeave() {
    const card = ref.current;
    if (!card) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ "--pf-i": order } as CSSProperties}
      className="pf-item group relative overflow-hidden rounded-2xl border border-border-soft bg-surface transition-[border-color,box-shadow,transform] duration-300 ease-out [transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))_translateY(var(--lift,0px))] hover:border-foreground/20 hover:shadow-xl motion-safe:hover:[--lift:-4px]"
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
