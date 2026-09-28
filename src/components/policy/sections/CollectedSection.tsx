import { Badge } from "@/components/policy/Badge";
import { Section } from "@/components/policy/Section";
import type { App } from "@/lib/apps/apps";

export function CollectedSection({ app, number }: { app: App; number: number }) {
  return (
    <Section
      id="data-collected"
      number={number}
      title="Data we collect"
      accent={app.accent}
    >
      {app.collects.length === 0 ? (
        <p className="rounded-2xl border border-border-soft bg-muted-surface p-6 text-base leading-7">
          {app.name} does not collect any data. Nothing is sent off your device.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {app.collects.map((entry) => (
            <article
              key={entry.category}
              className="group relative overflow-hidden rounded-2xl border border-border-soft bg-surface p-6 transition-colors hover:border-foreground/20"
            >
              {/* Accent edge that lights up on hover. */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundColor: app.accent }}
              />

              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-semibold tracking-tight">{entry.category}</h3>
                <Badge tone={entry.linked ? "warn" : "ok"}>
                  {entry.linked ? "Linked to you" : "Not linked to you"}
                </Badge>
              </div>

              <p className="mt-2.5 text-base leading-7 text-muted">{entry.purpose}</p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {entry.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg bg-muted-surface px-2.5 py-1 font-mono text-xs text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
