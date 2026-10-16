import { CopyButton } from "@/components/shared/CopyButton";
import { AppTextStyles } from "@/lib/design/app-text-styles";
import { cn } from "@/lib/utils";

/**
 * The cover letter, in its own tab beside the CV, framed like a code block so it reads as
 * something to take away: a bar with a copy button, then the letter as it will
 * be pasted. Plain text in, plain text out — what is shown is what is copied.
 */
export function CoverLetter({ text }: { text: string }) {
  return (
    <div className="flex max-w-[80ch] flex-col gap-4">
      {/* No heading of its own: the tab already names it. */}
      <p className={AppTextStyles.SMALL}>
        One letter for every application: copy it and replace the role in brackets.
      </p>

      <figure className="code-block">
        <figcaption className={`${AppTextStyles.CAPTION} code-bar`}>
          <span>Plain text</span>
          <CopyButton text={text} label="Copy cover letter" />
        </figcaption>
        {/* The letter's own words, so full-strength text rather than the muted body voice. */}
        <p className={cn(AppTextStyles.BODY_SM, "whitespace-pre-line px-4 py-3.5 text-foreground")}>
          {text}
        </p>
      </figure>
    </div>
  );
}
