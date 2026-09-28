import { Info, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { NoteBlock } from "@/lib/docs/doc-model";
import { AppColors } from "@/lib/design/app-colors";

const TONES = {
  info: { Icon: Info, color: AppColors.NOTE_INFO, label: "Note" },
  warning: { Icon: TriangleAlert, color: AppColors.NOTE_WARNING, label: "Warning" },
} as const;

/**
 * A note pulled out of the flow of the text. shadcn's Alert has one neutral and
 * one destructive look, so the two tones this site uses are tinted here — the
 * component supplies the layout and the icon slot, the tone supplies the colour.
 */
export function Callout({ block }: { block: NoteBlock }) {
  const tone = TONES[block.tone];

  return (
    <Alert
      className="mt-5 max-w-[68ch] rounded-xl px-4 py-3.5"
      style={{
        borderColor: `${AppColors.tint(tone.color, 32)}`,
        backgroundColor: `${AppColors.tint(tone.color, 8)}`,
      }}
    >
      <tone.Icon aria-hidden style={{ color: tone.color }} />
      <span className="sr-only">{tone.label}: </span>
      <AlertDescription className="text-foreground">
        {block.body.map((paragraph, index) => (
          <p key={index} className="text-sm leading-6">
            {paragraph}
          </p>
        ))}
      </AlertDescription>
    </Alert>
  );
}
