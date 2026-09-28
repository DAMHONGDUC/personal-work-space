import { Section } from "@/components/policy/Section";
import type { App } from "@/lib/apps/apps";

export function SummarySection({ app, number }: { app: App; number: number }) {
  return (
    <Section
      id="at-a-glance"
      number={number}
      title="At a glance"
      accent={app.accent}
    >
      <ul
        className="flex flex-col gap-3.5 rounded-2xl border p-6"
        style={{
          backgroundColor: `color-mix(in oklab, ${app.accent} 6%, transparent)`,
          borderColor: `color-mix(in oklab, ${app.accent} 22%, transparent)`,
        }}
      >
        {app.summary.map((point) => (
          <li key={point} className="flex gap-3 text-base leading-7">
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="mt-1.5 size-4 shrink-0"
              style={{ color: app.accent }}
            >
              <path
                d="M4 10.5l4 4 8-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {point}
          </li>
        ))}
      </ul>
    </Section>
  );
}
