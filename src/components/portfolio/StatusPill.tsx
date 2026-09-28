import { AppTextStyles } from "@/lib/design/app-text-styles";

/** A green dot and a line of availability, in a quiet pill. */
export function StatusPill({ children }: { children: string }) {
  return (
    <span className={`${AppTextStyles.CAPTION} flex w-fit items-center gap-2 rounded-full border border-border-soft bg-surface px-3 py-1`}>
      <span aria-hidden className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--pf-a)] opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex size-2 rounded-full bg-[var(--pf-a)]" />
      </span>
      {children}
    </span>
  );
}
