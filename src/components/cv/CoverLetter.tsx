import { CopyButton } from "@/components/shared/CopyButton";
import { AppTextStyles } from "@/lib/design/app-text-styles";
import { cn } from "@/lib/utils";

/**
 * The cover letter, under the CV, framed like a code block so it reads as
 * something to take away: a bar with a copy button, then the letter as it will
 * be pasted. Plain text in, plain text out — what is shown is what is copied.
 */
export function CoverLetter({ text }: { text: string }) {
  return (
    <section aria-labelledby="cover-letter" className="mt-16 flex max-w-[80ch] flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 id="cover-letter" className={AppTextStyles.CARD_TITLE_SM}>
          Cover letter
        </h2>
        <p className={AppTextStyles.SMALL}>
          One letter for every application: copy it and replace the role in brackets.
        </p>
      </div>

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
    </section>
  );
}
