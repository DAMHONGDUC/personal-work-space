import type { CSSProperties } from "react";

/**
 * Text whose words slide up into view one after another, each out from
 * behind its own mask — the `.pf-word` rules in globals.css. `--pf-w` is each
 * word's turn. The words stay real text with real spaces between them, so a
 * screen reader, a search engine and copy-paste all get the plain sentence.
 * Nothing moves until an ancestor asks for it (`.pf-words-enter` on load, or a
 * section's `data-reveal`), and with reduced motion nothing moves at all.
 */
export function MaskedWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="pf-word">
            <span style={{ "--pf-w": index } as CSSProperties}>{word}</span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
