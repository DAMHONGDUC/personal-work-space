import type { CodeBlock } from "@/lib/docs/doc-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * A shell sample. The lines are stored one per array entry in the JSON so the
 * data file stays readable; they are joined back into a single <code> here so
 * selecting and copying the block gives real newlines.
 */
export function CodeSample({ block }: { block: CodeBlock }) {
  return (
    <figure className="mt-5 max-w-[68ch] overflow-hidden rounded-xl border border-border-soft bg-muted-surface">
      <figcaption className={`${AppTextStyles.CAPTION} flex items-center justify-between gap-4 border-b border-border-soft px-4 py-2`}>
        <span>{block.caption ?? "Terminal"}</span>
        <span className="font-mono uppercase tracking-wider">{block.language}</span>
      </figcaption>
      {/* The pre scrolls on its own so a long command never widens the page. */}
      <pre className="overflow-x-auto px-4 py-3.5 text-[0.8125rem] leading-6">
        <code className="font-mono">{block.code.join("\n")}</code>
      </pre>
    </figure>
  );
}
