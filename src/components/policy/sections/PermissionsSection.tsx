import { Badge } from "@/components/policy/Badge";
import { Section } from "@/components/policy/Section";
import type { App } from "@/lib/apps/apps";

export function PermissionsSection({ app, number }: { app: App; number: number }) {
  return (
    <Section
      id="permissions"
      number={number}
      title="Device permissions"
      accent={app.accent}
    >
      <div className="flex flex-col gap-3">
        {app.permissions.map((permission) => (
          <article
            key={permission.name}
            className="group relative overflow-hidden rounded-2xl border border-border-soft bg-surface p-6 transition-colors hover:border-foreground/20"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundColor: app.accent }}
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-semibold tracking-tight">{permission.name}</h3>
              <Badge tone={permission.required ? "strong" : "neutral"}>
                {permission.required ? "Required" : "Optional"}
              </Badge>
            </div>

            <p className="mt-2.5 text-base leading-7 text-muted">{permission.reason}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
