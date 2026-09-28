import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * One numbered section of a policy or a guide.
 *
 * The number is passed in rather than counted here: on the policy pages some
 * sections only render for some apps, so the page works it out from the same
 * list it builds the table of contents from, and the two can never disagree.
 */
export function Section({
  id,
  number,
  title,
  accent,
  children,
}: {
  id: string;
  /** Position in the document, starting at 1. */
  number: number;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className={`${AppTextStyles.CARD_TITLE} flex items-baseline gap-2.5 pb-5`}>
        <span className="tabular-nums" style={{ color: accent }}>
          {number}.
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
