import { CopyButton } from "@/components/shared/CopyButton";
import { AppTextStyles } from "@/lib/design/app-text-styles";
import { cn } from "@/lib/utils";

/**
 * Text to take away, framed like a code block: a bar naming it with a copy
 * button, then the text as it will be pasted. Plain text in, plain text out —
 * what is shown is what is copied.
 */
export function CopyBlock({ caption, text, label }: { caption: string; text: string; label: string }) {
  return (
    <figure className="code-block">
      <figcaption className={`${AppTextStyles.CAPTION} code-bar`}>
        <span>{caption}</span>
        <CopyButton text={text} label={label} />
      </figcaption>
      {/* Words to paste, so full-strength text rather than the muted body voice. */}
      <p className={cn(AppTextStyles.BODY_SM, "whitespace-pre-line px-4 py-3.5 text-foreground")}>
        {text}
      </p>
    </figure>
  );
}
