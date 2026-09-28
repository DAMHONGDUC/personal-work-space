import type { App } from "@/lib/apps/apps";

export function ContactCard({ app, email }: { app: App; email: string }) {
  return (
    <div
      className="rounded-2xl border p-7"
      style={{
        backgroundColor: `color-mix(in oklab, ${app.accent} 6%, transparent)`,
        borderColor: `color-mix(in oklab, ${app.accent} 22%, transparent)`,
      }}
    >
      <h2 className="text-lg font-semibold tracking-tight">
        Questions about {app.name}?
      </h2>
      <p className="mt-2 max-w-[60ch] text-base leading-7 text-muted">
        We usually reply within a few business days.
      </p>
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(`${app.name} — privacy question`)}`}
        className="mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        style={{ backgroundColor: app.accent }}
      >
        {email}
      </a>
    </div>
  );
}
