import { Section } from "@/components/policy/Section";
import type { App } from "@/lib/apps/apps";

export function NotCollectedSection({ app, number }: { app: App; number: number }) {
  return (
    <Section
      id="data-not-collected"
      number={number}
      title="Data we do not collect"
      accent={app.accent}
    >
      <p className="max-w-[68ch] text-base leading-7 text-muted">
        {app.name} never asks for, receives, or stores any of the following:
      </p>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {app.notCollected.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2.5 rounded-xl border border-border-soft bg-surface px-3.5 py-2.5 text-sm transition-colors hover:border-foreground/20"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 text-muted/60">
              <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5.5 5.5l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </Section>
  );
}
