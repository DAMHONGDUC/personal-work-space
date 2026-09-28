"use client";

import { useEffect, useRef } from "react";

/** Milliseconds per character, and the pause between paragraphs. */
const CHAR_MS = 14;
const PARAGRAPH_PAUSE_MS = 380;
/** Lets the card around the text rise in before the typing starts. */
const START_DELAY_MS = 550;

/**
 * Paragraphs that type themselves out, like a typewriter, when they scroll
 * into view — a blinking caret leading, one paragraph after another.
 *
 * Each paragraph is rendered twice in the same box: the real text, which
 * holds the layout and is what a screen reader and a search engine read, and
 * an empty overlay the typing fills. While typing, the real text is made
 * transparent, so the words appear in place and wrap exactly where they will
 * end up; nothing below moves. When the typing is done the overlay empties
 * and the real text shows again.
 *
 * Without JavaScript, or with reduced motion, nothing is hidden and the text
 * is simply there. The typing writes to the DOM directly, so React never
 * re-renders for it.
 */
export function Typewriter({ paragraphs, paragraphClassName }: { paragraphs: string[]; paragraphClassName?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const overlays = [...root.querySelectorAll<HTMLElement>("[data-typed]")];
    const texts = overlays.map((overlay) => overlay.dataset.typed ?? "");
    let timer: number | undefined;

    const finish = () => {
      for (const overlay of overlays) {
        overlay.textContent = "";
        delete overlay.dataset.caret;
      }
      delete root.dataset.typing;
    };

    const type = (paragraph: number, length: number) => {
      const overlay = overlays[paragraph];
      const text = texts[paragraph];

      overlay.textContent = text.slice(0, length);
      overlay.dataset.caret = "";

      if (length < text.length) {
        timer = window.setTimeout(() => type(paragraph, length + 1), CHAR_MS);
        return;
      }

      delete overlay.dataset.caret;
      if (paragraph + 1 < overlays.length) {
        overlays[paragraph + 1].dataset.caret = "";
        timer = window.setTimeout(() => type(paragraph + 1, 1), PARAGRAPH_PAUSE_MS);
      } else {
        timer = window.setTimeout(finish, PARAGRAPH_PAUSE_MS * 2);
      }
    };

    // Hide the real text now; the typing will bring the words back in place.
    root.dataset.typing = "";
    overlays[0].dataset.caret = "";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => type(0, 1), START_DELAY_MS);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      finish();
    };
  }, []);

  return (
    <div ref={rootRef} className="pf-typewriter flex flex-col gap-4">
      {paragraphs.map((text) => (
        <p key={text} className={`relative ${paragraphClassName ?? ""}`}>
          <span className="pf-typewriter-text">{text}</span>
          <span aria-hidden data-typed={text} className="pf-typewriter-typed absolute inset-0" />
        </p>
      ))}
    </div>
  );
}
