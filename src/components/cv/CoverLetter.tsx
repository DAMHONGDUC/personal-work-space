import { CopyBlock } from "@/components/cv/CopyBlock";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * The cover letter, in its own tab beside the CV, framed like a code block so it reads as
 * something to take away: a bar with a copy button, then the letter as it will
 * be pasted.
 */
export function CoverLetter({ text }: { text: string }) {
  return (
    <div className="flex max-w-[80ch] flex-col gap-4">
      {/* No heading of its own: the tab already names it. */}
      <p className={AppTextStyles.SMALL}>
        One letter for every application: copy it and replace the role in brackets.
      </p>

      <CopyBlock caption="Plain text" text={text} label="Copy cover letter" />
    </div>
  );
}
