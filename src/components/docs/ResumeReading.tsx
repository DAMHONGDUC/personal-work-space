"use client";

import { BookOpen, X } from "lucide-react";
import type { Lang } from "@/lib/docs/doc-model";
import { AppColors } from "@/lib/design/app-colors";

const LABELS = {
  message: { en: "Pick up where you left off:", vi: "Đọc tiếp chỗ bạn dừng:" },
  resume: { en: "Continue", vi: "Đọc tiếp" },
  dismiss: { en: "Dismiss", vi: "Bỏ qua" },
} satisfies Record<string, Record<Lang, string>>;

/**
 * A small bar at the foot of the window offering to go back to the section
 * the reader was in last time. It asks rather than jumps: someone opening the
 * guide to read it from the top should not be pulled away.
 */
export function ResumeReading({
  section,
  lang,
  onResume,
  onDismiss,
}: {
  /** The title of the section to go back to. */
  section: string;
  lang: Lang;
  onResume: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      lang={lang}
      className="fixed inset-x-4 bottom-5 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-border-soft bg-surface py-2.5 pr-2 pl-4 text-sm shadow-lg"
    >
      <BookOpen aria-hidden className="size-4 shrink-0" style={{ color: AppColors.DOCS }} />
      <p className="min-w-0 flex-1 truncate">
        <span className="text-muted">{LABELS.message[lang]}</span>{" "}
        <span className="font-medium">{section}</span>
      </p>
      <button
        type="button"
        onClick={onResume}
        className="shrink-0 rounded-lg px-3 py-1.5 font-medium transition-opacity hover:opacity-80"
        style={{ backgroundColor: AppColors.tint(AppColors.DOCS, 16), color: AppColors.DOCS }}
      >
        {LABELS.resume[lang]}
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={LABELS.dismiss[lang]}
        className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-muted-surface hover:text-foreground"
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}
