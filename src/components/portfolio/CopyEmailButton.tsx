"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * Copies the address, for the reader whose mail client is not the one a
 * mailto: link would open. Falls back to doing nothing visible when the
 * clipboard is unavailable — the address is printed beside it anyway.
 */
export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context, permissions): nothing to recover.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-11 items-center gap-2 rounded-xl border border-border-soft bg-surface px-4 text-sm font-medium transition-colors hover:border-foreground/25"
    >
      {copied ? (
        <Check aria-hidden className="size-4 text-[var(--pf-a)]" />
      ) : (
        <Copy aria-hidden className="size-4 text-muted" />
      )}
      <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
}
