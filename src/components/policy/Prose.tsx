import { AppTextStyles } from "@/lib/design/app-text-styles";

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="flex max-w-[68ch] flex-col gap-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={AppTextStyles.BODY}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
