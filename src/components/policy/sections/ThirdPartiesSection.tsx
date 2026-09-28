import { Section } from "@/components/policy/Section";
import type { App } from "@/lib/apps/apps";
import { AppTextStyles } from "@/lib/design/app-text-styles";

export function ThirdPartiesSection({ app, number }: { app: App; number: number }) {
  return (
    <Section
      id="third-parties"
      number={number}
      title="Third-party services"
      accent={app.accent}
    >
      <p className={`${AppTextStyles.BODY} max-w-[68ch]`}>
        {app.name} relies on the services below. Each one handles data under its own
        privacy policy.
      </p>
      <ul className="mt-5 divide-y divide-border-soft overflow-hidden rounded-2xl border border-border-soft bg-surface">
        {app.thirdParties.map((party) => (
          <li
            key={party.name}
            className="flex flex-col gap-1.5 p-5 transition-colors hover:bg-muted-surface sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <span className="min-w-0">
              <span className="block font-medium tracking-tight">{party.name}</span>
              <span className={`${AppTextStyles.BODY_SM} block`}>{party.purpose}</span>
            </span>
            <a
              href={party.url}
              target="_blank"
              rel="noreferrer noopener"
              className={`${AppTextStyles.CAPTION} shrink-0 whitespace-nowrap rounded-lg border border-border-soft px-2.5 py-1.5 transition-colors hover:border-foreground/25 hover:text-foreground`}
            >
              Privacy policy ↗
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
