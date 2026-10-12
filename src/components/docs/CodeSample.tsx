import { CopyButton } from "@/components/shared/CopyButton";
import type { CodeBlock } from "@/lib/docs/doc-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * A code sample, drawn like a fenced block in Markdown on GitHub: a bar naming
 * the language with a copy button, then the code, coloured when the page was
 * built (`highlighted`). The lines are stored one per array entry in the JSON
 * so the data file stays readable, and copied joined with real newlines.
 */
export function CodeSample({ block }: { block: CodeBlock }) {
  const code = block.code.join("\n");

  return (
    <figure className="code-block mt-5 max-w-[80ch]">
      <figcaption className={`${AppTextStyles.CAPTION} code-bar`}>
        <span className="min-w-0 truncate">{block.caption ?? "Terminal"}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-mono uppercase tracking-wider">{block.language}</span>
          <CopyButton text={code} />
        </span>
      </figcaption>
      {block.highlighted ? (
        <div dangerouslySetInnerHTML={{ __html: block.highlighted }} />
      ) : (
        // Unhighlighted where no page build coloured it, as in a component test.
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </figure>
  );
}
