"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/lib/shared/clipboard";

/** How long the button says "Copied" before going back to "Copy". */
const CONFIRM_MS = 1500;

/**
 * Copies `text` and says so for a moment. Matches the copy button the synced
 * Markdown's code blocks carry (`.md-copy` in globals.css), so every code
 * block on the site offers the same control. `label` names what it copies
 * for a screen reader, where that is not code.
 */
export function CopyButton({ text, label = "Copy code" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className="code-copy"
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        if (!(await copyText(text))) return;
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), CONFIRM_MS);
      }}
    >
      {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
